export type DeliveryZone = "DHAKA" | "SUB_AREA" | "OUTSIDE_DHAKA";

export type CheckoutContact = {
  fullName: string;
  phone: string;
  email: string;
};

export type ShippingAddress = {
  address: string;
  locality: string;
  city: string;
  note?: string;
};

export type CheckoutRequestLine = {
  variantId: string;
  quantity: number;
};

export type ValidatedCheckoutLine = {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  color: string;
  size: string;
  unitPriceBdt: number;
  quantity: number;
  lineTotalBdt: number;
};

export type CheckoutTotals = {
  subtotalBdt: number;
  deliveryBdt: number;
  discountBdt?: number;
  promoCode?: string | null;
  totalBdt: number;
};

export type CheckoutValidationResult = {
  ok: boolean;
  lines: ValidatedCheckoutLine[];
  totals?: CheckoutTotals;
  message?: string;
};
