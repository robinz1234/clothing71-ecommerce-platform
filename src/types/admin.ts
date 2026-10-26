import type { OrderStatus, PaymentStatus } from "@/types/order";

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalBdt: number;
};

export type AdminOrder = AdminOrderListItem & {
  addressLine: string;
  areaLocality: string;
  cityDistrict: string;
  deliveryNote: string | null;
  deliveryZone: string;
  deliveryFeeBdt: number;
  subtotalBdt: number;
  discountBdt?: number;
  promoCode?: string | null;
  paymentMethod: "COD";
  fulfillmentCourier: string | null;
  fulfillmentBookingStatus: "not_booked" | "booked" | "failed" | "cancelled";
  fulfillmentTrackingNumber: string | null;
  fulfillmentDispatchedAt: string | null;
  internalNotes: Array<{ id: number; note: string; createdAt: string }>;
  items: Array<{
    id: string;
    productName: string;
    productSlug: string;
    sku: string;
    color: string;
    size: string;
    quantity: number;
    unitPriceBdt: number;
    lineTotalBdt: number;
    /** Immutable snapshot URL captured at order time (storage_path from catalog-images bucket). Null for legacy orders. */
    imageSnapshotUrl: string | null;
    /** Resolved public image URL for display (may come from snapshot or live product_images). */
    imagePublicUrl: string | null;
  }>;

};

export type AdminPathaoShipment = {
  id: string;
  storeId: number;
  merchantOrderReference: string;
  consignmentId: string | null;
  bookingStatus: "booking" | "booked" | "failed" | "unknown";
  courierStatus: string | null;
  amountToCollect: number;
  estimatedCourierFee: number | null;
  actualCourierFee: number | null;
  parcelWeightKg: number;
  itemQuantity: number;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  cityName: string;
  zoneName: string;
  areaName: string;
  specialInstruction: string | null;
  lastErrorCategory: string | null;
  bookingStartedAt: string;
  bookedAt: string | null;
  lastStatusAt: string | null;
  lastSyncAt: string | null;
  events: Array<{
    id: number;
    courierStatus: string;
    reportedAt: string;
    receivedAt: string;
    source: "booking" | "manual_refresh";
  }>;
  attempts: Array<{
    id: string;
    action: "booking" | "manual_reconciliation";
    outcome: "in_progress" | "booked" | "failed" | "unknown" | "confirmed_absent";
    errorCategory: string | null;
    reconciliationNote: string | null;
    startedAt: string;
    completedAt: string | null;
  }>;
};

export type AdminInventoryItem = {
  id: string;
  productName: string;
  productSlug: string;
  sku: string;
  color: string;
  size: string;
  stockQuantity: number;
  isActive: boolean;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  baseSku: string | null;
  audience: string;
  productType: string;
  priceBdt: number;
  isActive: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  publicationStatus: "draft" | "published" | "archived";
  variantCount: number;
  totalStock: number;
};
