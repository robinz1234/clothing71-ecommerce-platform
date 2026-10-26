/**
 * Cart domain type definitions for Clothing71 storefront.
 * 
 * IMPORTANT TRANSACTIONAL BOUNDARY NOTE:
 * The pricing, stock, and variant snapshot fields stored within the client-side
 * cart (e.g., unitPriceBdt, compareAtPriceBdt, stock) are strictly for UI rendering
 * and client convenience. They MUST NOT be trusted as authoritative for checkout.
 * Final order validation and pricing calculations are performed server-side during checkout.
 */

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantId?: string | null;
  sku: string;
  color: string;
  colorHex?: string;
  size: string;
  quantity: number;
  unitPriceBdt: number;
  compareAtPriceBdt?: number;
  quantityPrices?: { bundleQuantity: number; bundlePriceBdt: number }[];
  image?: string;
  fit?: string;
  productType?: string;
  maxStock?: number;
}
