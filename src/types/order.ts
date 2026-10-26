import type { DeliveryZone } from "@/types/checkout";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "cancelled";

export type OrderItem = {
  id?: string;
  productId?: string;
  variantId?: string;
  productName: string;
  productSlug: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  unitPriceBdt: number;
  lineTotalBdt: number;
  imageSnapshotUrl?: string | null;
  imagePublicUrl?: string | null;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine: string;
  areaLocality: string;
  cityDistrict: string;
  deliveryNote: string | null;
  deliveryZone: DeliveryZone;
  deliveryFeeBdt: number;
  subtotalBdt: number;
  discountBdt?: number;
  promoCode?: string | null;
  totalBdt: number;
  paymentMethod: "COD";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt?: string;
  items: OrderItem[];
};

export type OrderListItem = Pick<OrderSummary, "id" | "orderNumber" | "totalBdt" | "paymentStatus" | "orderStatus"> & {
  createdAt: string;
};
