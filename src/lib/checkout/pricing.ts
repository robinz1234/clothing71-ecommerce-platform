import type { CartItem } from "@/types/cart";
import type { ProductQuantityPrice } from "@/types/product";

export function getTieredProductTotal(
  regularUnitPriceBdt: number,
  quantity: number,
  quantityPrices: ProductQuantityPrice[] = [],
): number {
  if (!Number.isInteger(quantity) || quantity < 1) return 0;

  const totals = Array<number>(quantity + 1).fill(0);
  const tiers = [...quantityPrices].sort(
    (left, right) => right.bundleQuantity - left.bundleQuantity,
  );

  for (let count = 1; count <= quantity; count += 1) {
    let best = totals[count - 1] + regularUnitPriceBdt;
    for (const tier of tiers) {
      if (tier.bundleQuantity > count) continue;
      best = Math.min(best, totals[count - tier.bundleQuantity] + tier.bundlePriceBdt);
    }
    totals[count] = best;
  }

  return totals[quantity];
}

export function getCartLineTotals(items: CartItem[]): Map<string, number> {
  const itemsByProduct = new Map<string, CartItem[]>();
  for (const item of items) {
    const productItems = itemsByProduct.get(item.productId) ?? [];
    productItems.push(item);
    itemsByProduct.set(item.productId, productItems);
  }

  const lineTotals = new Map<string, number>();
  for (const productItems of itemsByProduct.values()) {
    const orderedItems = [...productItems].sort((left, right) =>
      `${left.variantId ?? left.id}`.localeCompare(`${right.variantId ?? right.id}`),
    );
    const quantity = orderedItems.reduce((total, item) => total + item.quantity, 0);
    const regularUnitPriceBdt = orderedItems[0].unitPriceBdt;
    const regularTotal = regularUnitPriceBdt * quantity;
    const chargedTotal = getTieredProductTotal(
      regularUnitPriceBdt,
      quantity,
      orderedItems[0].quantityPrices,
    );
    const discount = regularTotal - chargedTotal;
    let quantityBefore = 0;
    let discountBefore = 0;

    for (const item of orderedItems) {
      const discountThroughItem = Math.floor(
        ((quantityBefore + item.quantity) * discount) / quantity,
      );
      const itemDiscount = discountThroughItem - discountBefore;
      lineTotals.set(item.id, item.unitPriceBdt * item.quantity - itemDiscount);
      quantityBefore += item.quantity;
      discountBefore = discountThroughItem;
    }
  }

  return lineTotals;
}

export function getCartSubtotal(items: CartItem[]): number {
  return [...getCartLineTotals(items).values()].reduce(
    (total, lineTotal) => total + lineTotal,
    0,
  );
}

export function calculatePromoDiscount(subtotalBdt: number, promoCode?: string | null): number {
  if (!promoCode) return 0;
  if (promoCode.trim().toUpperCase() === "SPD10") {
    return Math.round(subtotalBdt * 0.10);
  }
  return 0;
}