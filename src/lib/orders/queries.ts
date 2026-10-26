import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderListItem, OrderSummary } from "@/types/order";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line: string;
  area_locality: string;
  city_district: string;
  delivery_note: string | null;
  delivery_zone: OrderSummary["deliveryZone"];
  delivery_fee_bdt: number;
  subtotal_bdt: number;
  discount_bdt?: number | null;
  promo_code?: string | null;
  total_bdt: number;
  payment_method: "COD";
  payment_status: OrderSummary["paymentStatus"];
  order_status: OrderSummary["orderStatus"];
  created_at: string;
};

type OrderItemRow = {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  product_slug: string;
  sku: string;
  color_name: string;
  size: string;
  quantity: number;
  unit_price_bdt: number;
  line_total_bdt: number;
  image_snapshot_url?: string | null;
  image_public_url?: string | null;
};

function mapOrder(
  row: OrderRow,
  items: OrderItemRow[],
  imageMap: Map<string, string | null>,
): OrderSummary {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    addressLine: row.address_line,
    areaLocality: row.area_locality,
    cityDistrict: row.city_district,
    deliveryNote: row.delivery_note,
    deliveryZone: row.delivery_zone,
    deliveryFeeBdt: row.delivery_fee_bdt,
    subtotalBdt: row.subtotal_bdt,
    discountBdt: row.discount_bdt ?? undefined,
    promoCode: row.promo_code ?? null,
    totalBdt: row.total_bdt,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    createdAt: row.created_at,
    items: items.map((item) => {
      const publicUrl = item.image_public_url ?? imageMap.get(item.id) ?? null;
      return {
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        productName: item.product_name,
        productSlug: item.product_slug,
        sku: item.sku,
        color: item.color_name,
        size: item.size,
        quantity: item.quantity,
        unitPriceBdt: item.unit_price_bdt,
        lineTotalBdt: item.line_total_bdt,
        imageSnapshotUrl: item.image_snapshot_url ?? null,
        imagePublicUrl: publicUrl,
      };
    }),
  };
}

export async function getCurrentCustomerOrders(): Promise<OrderListItem[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, total_bdt, payment_status, order_status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load orders.");
  return ((data ?? []) as OrderRow[]).map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    totalBdt: row.total_bdt,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    createdAt: row.created_at,
  }));
}

export async function getCurrentCustomerOrder(orderId: string): Promise<OrderSummary | null> {
  const supabase = await getSupabaseServerClient();
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error || !order) return null;
  const { data: items, error: itemError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at");
  if (itemError) return null;

  const rawItems = (items ?? []) as OrderItemRow[];
  const itemImageMap = new Map<string, string | null>();

  // For items without an image_snapshot_url, resolve fallback from product_images
  const missingProductIds = [
    ...new Set(
      rawItems
        .filter((item) => !item.image_snapshot_url)
        .map((item) => item.product_id),
    ),
  ];

  const fallbackMap = new Map<string, string>();
  if (missingProductIds.length > 0) {
    const { data: fallbackImages } = await supabase
      .from("product_images")
      .select("product_id, storage_path, image_role, color_name, sort_order")
      .in("product_id", missingProductIds)
      .in("image_role", ["primary", "gallery"])
      .order("sort_order");

    if (fallbackImages) {
      for (const img of fallbackImages as Array<{ product_id: string; storage_path: string; image_role: string }>) {
        if (!fallbackMap.has(img.product_id) || img.image_role === "primary") {
          fallbackMap.set(img.product_id, img.storage_path);
        }
      }
    }
  }

  for (const item of rawItems) {
    const path = item.image_snapshot_url || fallbackMap.get(item.product_id);
    if (path) {
      const publicUrl = supabase.storage.from("catalog-images").getPublicUrl(path).data.publicUrl;
      itemImageMap.set(item.id, publicUrl);
    } else {
      itemImageMap.set(item.id, null);
    }
  }

  return mapOrder(order as OrderRow, rawItems, itemImageMap);
}
