import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminInventoryItem, AdminOrder, AdminOrderListItem, AdminPathaoShipment, AdminProduct } from "@/types/admin";
import type { OrderStatus, PaymentStatus } from "@/types/order";
import { z } from "zod";

const ORDER_STATUSES: readonly OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES: readonly PaymentStatus[] = ["pending", "paid", "cancelled"];

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return PAYMENT_STATUSES.includes(value as PaymentStatus);
}

const dashboardMetricsSchema = z.object({
  orders: z.object({
    pending: z.number().int(),
    confirmed: z.number().int(),
    processing: z.number().int(),
    shipped: z.number().int(),
    delivered: z.number().int(),
    total: z.number().int(),
  }).nullable(),
  lowStock: z.number().int().nullable(),
  activeProducts: z.number().int().nullable(),
});

export async function getAdminDashboardStats() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_get_dashboard_metrics");
  if (error) throw new Error("Unable to load admin dashboard metrics.");
  const parsed = dashboardMetricsSchema.safeParse(data);
  if (!parsed.success) throw new Error("Admin dashboard metrics response is invalid.");
  const orderMetrics = parsed.data.orders;

  return {
    pending: orderMetrics?.pending ?? null,
    confirmed: orderMetrics?.confirmed ?? null,
    processing: orderMetrics?.processing ?? null,
    shipped: orderMetrics?.shipped ?? null,
    delivered: orderMetrics?.delivered ?? null,
    total: orderMetrics?.total ?? null,
    lowStock: parsed.data.lowStock,
    activeProducts: parsed.data.activeProducts,
  };
}

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  total_bdt: number;
};

function mapOrderList(row: OrderRow): AdminOrderListItem {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    createdAt: row.created_at,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    totalBdt: row.total_bdt,
  };
}

export async function getAdminOrders(filters: { status?: string; payment?: string; search?: string }) {
  const supabase = await getSupabaseServerClient();
  let query = supabase.from("orders").select("id, order_number, customer_name, customer_email, customer_phone, created_at, order_status, payment_status, total_bdt").order("created_at", { ascending: false });
  if (filters.status && isOrderStatus(filters.status)) query = query.eq("order_status", filters.status);
  if (filters.payment && isPaymentStatus(filters.payment)) query = query.eq("payment_status", filters.payment);
  if (filters.search?.trim()) {
    const term = filters.search.trim().replace(/[(),]/g, " ");
    query = query.or(`order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_email.ilike.%${term}%,customer_phone.ilike.%${term}%`);
  }
  const { data, error } = await query;
  if (error) throw new Error("Unable to load admin orders.");
  return ((data ?? []) as OrderRow[]).map(mapOrderList);
}

export async function getAdminOrder(orderId: string): Promise<AdminOrder | null> {
  const supabase = await getSupabaseServerClient();
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error) throw new Error("Unable to load this order.");
  if (!order) return null;

  // Fetch items including image_snapshot_url (nullable for legacy orders)
  const { data: items, error: itemError } = await supabase
    .from("order_items")
    .select("id, product_id, product_name, product_slug, sku, color_name, size, quantity, unit_price_bdt, line_total_bdt, image_snapshot_url")
    .eq("order_id", orderId)
    .order("created_at");
  if (itemError) throw new Error("Unable to load order items.");

  const { data: notes, error: notesError } = await supabase
    .from("order_internal_notes")
    .select("id, note, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  if (notesError) throw new Error("Unable to load internal order notes.");

  // For legacy items with no snapshot, try to resolve a fallback from product_images.
  // Collect unique product_ids that need fallback image resolution.
  const itemsWithMissingImage = (items ?? []).filter(
    (item) => !(item as Record<string, unknown>)["image_snapshot_url"],
  );
  const missingProductIds = [...new Set(itemsWithMissingImage.map((item) => (item as Record<string, unknown>)["product_id"] as string))];

  // Build a map: product_id → best storage_path
  const fallbackImageMap = new Map<string, string>();
  if (missingProductIds.length > 0) {
    const { data: fallbackImages } = await supabase
      .from("product_images")
      .select("product_id, storage_path, image_role, color_name, sort_order")
      .in("product_id", missingProductIds)
      .in("image_role", ["primary", "gallery"])
      .order("sort_order");
    if (fallbackImages) {
      // Group by product_id and pick best match per color
      const grouped = new Map<string, Array<Record<string, unknown>>>();
      for (const img of fallbackImages) {
        const pid = (img as Record<string, unknown>)["product_id"] as string;
        if (!grouped.has(pid)) grouped.set(pid, []);
        grouped.get(pid)!.push(img as Record<string, unknown>);
      }
      for (const [pid, imgs] of grouped) {
        // Pick the primary image first, then gallery
        const primary = imgs.find((i) => i["image_role"] === "primary");
        fallbackImageMap.set(pid, ((primary ?? imgs[0])?.["storage_path"] ?? "") as string);
      }
    }
  }

  const row = order as Record<string, unknown>;
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    customerName: row.customer_name as string,
    customerEmail: (row.customer_email as string | null) ?? "",
    customerPhone: row.customer_phone as string,
    createdAt: row.created_at as string,
    orderStatus: row.order_status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    totalBdt: row.total_bdt as number,
    addressLine: row.address_line as string,
    areaLocality: row.area_locality as string,
    cityDistrict: row.city_district as string,
    deliveryNote: row.delivery_note as string | null,
    deliveryZone: row.delivery_zone as string,
    deliveryFeeBdt: row.delivery_fee_bdt as number,
    subtotalBdt: row.subtotal_bdt as number,
    discountBdt: (row.discount_bdt as number | null) ?? 0,
    promoCode: (row.promo_code as string | null) ?? null,
    paymentMethod: row.payment_method as "COD",
    fulfillmentCourier: row.fulfillment_courier as string | null,
    fulfillmentBookingStatus: row.fulfillment_booking_status as AdminOrder["fulfillmentBookingStatus"],
    fulfillmentTrackingNumber: row.fulfillment_tracking_number as string | null,
    fulfillmentDispatchedAt: row.fulfillment_dispatched_at as string | null,
    internalNotes: (notes ?? []).map((note) => ({
      id: note.id,
      note: note.note,
      createdAt: note.created_at,
    })),
    items: (items ?? []).map((item) => {
      const itemRow = item as Record<string, unknown>;
      const snapshotPath = (itemRow.image_snapshot_url as string | null) ??
        fallbackImageMap.get(itemRow.product_id as string) ?? null;
      const imagePublicUrl = snapshotPath
        ? supabase.storage.from("catalog-images").getPublicUrl(snapshotPath).data.publicUrl
        : null;
      return {
        id: itemRow.id as string,
        productName: itemRow.product_name as string,
        productSlug: itemRow.product_slug as string,
        sku: itemRow.sku as string,
        color: itemRow.color_name as string,
        size: itemRow.size as string,
        quantity: itemRow.quantity as number,
        unitPriceBdt: itemRow.unit_price_bdt as number,
        lineTotalBdt: itemRow.line_total_bdt as number,
        imageSnapshotUrl: snapshotPath,
        imagePublicUrl,
      };
    }),
  };
}


export async function getAdminPathaoShipment(orderId: string): Promise<AdminPathaoShipment | null> {
  const supabase = await getSupabaseServerClient();
  const { data: shipment, error } = await supabase
    .from("pathao_shipments")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) throw new Error("Unable to load Pathao shipment details.");
  if (!shipment) return null;

  const [eventsResult, attemptsResult] = await Promise.all([
    supabase
      .from("pathao_shipment_events")
      .select("id, courier_status, reported_at, received_at, source")
      .eq("shipment_id", shipment.id)
      .order("reported_at", { ascending: false })
      .limit(50),
    supabase
      .from("pathao_shipment_attempts")
      .select("id, action, outcome, error_category, reconciliation_note, started_at, completed_at")
      .eq("order_id", orderId)
      .order("started_at", { ascending: false })
      .limit(20),
  ]);
  if (eventsResult.error || attemptsResult.error) {
    throw new Error("Unable to load Pathao shipment history.");
  }

  const row = shipment as Record<string, unknown>;
  return {
    id: row.id as string,
    storeId: Number(row.store_id),
    merchantOrderReference: row.merchant_order_reference as string,
    consignmentId: row.consignment_id as string | null,
    bookingStatus: row.booking_status as AdminPathaoShipment["bookingStatus"],
    courierStatus: row.courier_status as string | null,
    amountToCollect: row.amount_to_collect as number,
    estimatedCourierFee: row.estimated_courier_fee as number | null,
    actualCourierFee: row.actual_courier_fee as number | null,
    parcelWeightKg: Number(row.parcel_weight_kg),
    itemQuantity: row.item_quantity as number,
    recipientName: row.recipient_name as string,
    recipientPhone: row.recipient_phone as string,
    recipientAddress: row.recipient_address as string,
    cityName: row.city_name as string,
    zoneName: row.zone_name as string,
    areaName: row.area_name as string,
    specialInstruction: row.special_instruction as string | null,
    lastErrorCategory: row.last_error_category as string | null,
    bookingStartedAt: row.booking_started_at as string,
    bookedAt: row.booked_at as string | null,
    lastStatusAt: row.last_status_at as string | null,
    lastSyncAt: row.last_sync_at as string | null,
    events: (eventsResult.data ?? []).map((event) => ({
      id: event.id,
      courierStatus: event.courier_status,
      reportedAt: event.reported_at,
      receivedAt: event.received_at,
      source: event.source as "booking" | "manual_refresh",
    })),
    attempts: (attemptsResult.data ?? []).map((attempt) => ({
      id: attempt.id,
      action: attempt.action as AdminPathaoShipment["attempts"][number]["action"],
      outcome: attempt.outcome as AdminPathaoShipment["attempts"][number]["outcome"],
      errorCategory: attempt.error_category,
      reconciliationNote: attempt.reconciliation_note,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at,
    })),
  };
}

export async function getAdminInventory(): Promise<AdminInventoryItem[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("product_variants").select("id, sku, color_name, size, stock_quantity, is_active, products!inner(name, slug)").order("sku");
  if (error) throw new Error("Unable to load inventory.");
  return (data ?? []).map((entry) => {
    const row = entry as unknown as Record<string, unknown>;
    const product = row.products as { name: string; slug: string };
    return { id: row.id as string, productName: product.name, productSlug: product.slug, sku: row.sku as string, color: row.color_name as string, size: row.size as string, stockQuantity: row.stock_quantity as number, isActive: row.is_active as boolean };
  });
}

export async function getAdminLowStockThreshold(): Promise<number> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("inventory_settings")
    .select("low_stock_threshold")
    .eq("singleton", true)
    .maybeSingle();
  if (error) throw new Error("Unable to load the low-stock threshold.");
  if (!data) throw new Error("Inventory settings are not configured.");
  return data.low_stock_threshold;
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("products").select("id, name, slug, base_sku, audience, product_type, price_bdt, is_active, is_new, is_best_seller, is_featured, publication_status, product_variants(id, stock_quantity)").order("name");
  if (error) throw new Error("Unable to load products.");
  return (data ?? []).map((entry) => {
    const row = entry as unknown as Record<string, unknown>;
    const variants = (row.product_variants as Array<{ id: string; stock_quantity: number }> | null) ?? [];
    return { id: row.id as string, name: row.name as string, slug: row.slug as string, baseSku: row.base_sku as string | null, audience: row.audience as string, productType: row.product_type as string, priceBdt: row.price_bdt as number, isActive: row.is_active as boolean, isNew: row.is_new as boolean, isBestSeller: row.is_best_seller as boolean, isFeatured: row.is_featured as boolean, publicationStatus: row.publication_status as AdminProduct["publicationStatus"], variantCount: variants.length, totalStock: variants.reduce((total, variant) => total + variant.stock_quantity, 0) };
  });
}
