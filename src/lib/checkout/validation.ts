import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicDeliveryOptions } from "@/lib/checkout/delivery";
import { getDeliveryOption } from "@/lib/checkout/delivery-options";
import { getTieredProductTotal } from "@/lib/checkout/pricing";
import type {
  CheckoutRequestLine,
  CheckoutValidationResult,
  DeliveryZone,
  ValidatedCheckoutLine,
} from "@/types/checkout";

type DatabaseVariant = {
  id: string;
  sku: string;
  color_name: string;
  size: string;
  stock_quantity: number;
  products: {
    id: string;
    name: string;
    slug: string;
    price_bdt: number;
    is_active: boolean;
    product_quantity_prices: { bundle_quantity: number; bundle_price_bdt: number }[];
  } | null;
};

export async function validateCheckoutCart(
  requestedLines: CheckoutRequestLine[],
  deliveryZone: DeliveryZone,
  promoCode?: string | null,
): Promise<CheckoutValidationResult> {
  const quantityByVariant = new Map<string, number>();
  for (const line of requestedLines) {
    const quantity = Number.isInteger(line.quantity) ? line.quantity : 0;
    quantityByVariant.set(line.variantId, (quantityByVariant.get(line.variantId) ?? 0) + quantity);
  }
  const normalizedLines = Array.from(quantityByVariant, ([variantId, quantity]) => ({
    variantId,
    quantity,
  }));

  if (
    normalizedLines.length === 0 ||
    normalizedLines.some((line) => !line.variantId || line.quantity < 1)
  ) {
    return {
      ok: false,
      lines: [],
      message: "One or more cart items have an invalid quantity. Please review your cart.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const deliveryOption = getDeliveryOption(deliveryZone, await getPublicDeliveryOptions());
  if (!deliveryOption) {
    return {
      ok: false,
      lines: [],
      message: "Delivery is not available in the selected zone. Please contact Clothing71.",
    };
  }
  const variantIds = normalizedLines.map((line) => line.variantId);
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "id, sku, color_name, size, stock_quantity, products!inner(id, name, slug, price_bdt, is_active, product_quantity_prices(bundle_quantity, bundle_price_bdt))",
    )
    .in("id", variantIds)
    .eq("is_active", true)
    .eq("products.is_active", true);

    if (error || !data) {
      return {
        ok: false,
        lines: [],
        message: "We could not validate your cart. Please try again.",
      };
    }

    const variants = data as unknown as DatabaseVariant[];
    const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
    const rawLines: {
      variant: DatabaseVariant;
      product: NonNullable<DatabaseVariant["products"]>;
      quantity: number;
    }[] = [];

    for (const requestedLine of normalizedLines) {
      const variant = variantMap.get(requestedLine.variantId);
      const product = variant?.products;

      if (!variant || !product || !product.is_active) {
        return {
          ok: false,
          lines: [],
          message: "One or more items have changed. Please review your cart.",
        };
      }

      if (variant.stock_quantity < 1 || requestedLine.quantity > variant.stock_quantity) {
        return {
          ok: false,
          lines: [],
          message: `${product.name} does not have enough stock for the requested quantity.`,
        };
      }

      rawLines.push({ variant, product, quantity: requestedLine.quantity });
    }

    const linesByProduct = new Map<string, typeof rawLines>();
    for (const line of rawLines) {
      const lines = linesByProduct.get(line.product.id) ?? [];
      lines.push(line);
      linesByProduct.set(line.product.id, lines);
    }

    const validatedLines: ValidatedCheckoutLine[] = [];
    for (const productLines of linesByProduct.values()) {
      const product = productLines[0].product;
      const sortedLines = [...productLines].sort((left, right) =>
        left.variant.id.localeCompare(right.variant.id),
      );
      const productQuantity = sortedLines.reduce((total, line) => total + line.quantity, 0);
      const regularTotal = product.price_bdt * productQuantity;
      const chargedTotal = getTieredProductTotal(
        product.price_bdt,
        productQuantity,
        product.product_quantity_prices.map((tier) => ({
          bundleQuantity: tier.bundle_quantity,
          bundlePriceBdt: tier.bundle_price_bdt,
        })),
      );
      const productDiscount = regularTotal - chargedTotal;
      let quantityBefore = 0;
      let discountBefore = 0;

      for (const line of sortedLines) {
        const discountThroughLine = Math.floor(
          ((quantityBefore + line.quantity) * productDiscount) / productQuantity,
        );
        const lineDiscount = discountThroughLine - discountBefore;
        const lineTotalBdt = product.price_bdt * line.quantity - lineDiscount;
        validatedLines.push({
          variantId: line.variant.id,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          sku: line.variant.sku,
          color: line.variant.color_name,
          size: line.variant.size,
          unitPriceBdt: lineTotalBdt / line.quantity,
          quantity: line.quantity,
          lineTotalBdt,
        });
        quantityBefore += line.quantity;
        discountBefore = discountThroughLine;
      }
    }

  const subtotalBdt = validatedLines.reduce(
    (total, line) => total + line.lineTotalBdt,
    0,
  );
  const deliveryBdt = deliveryOption.chargeBdt;

  let discountBdt = 0;
  let normalizedPromo: string | null = null;
  if (promoCode && promoCode.trim().length > 0) {
    normalizedPromo = promoCode.trim().toUpperCase();
    if (normalizedPromo === "SPD10") {
      discountBdt = Math.round(subtotalBdt * 0.10);
    } else {
      return {
        ok: false,
        lines: [],
        message: "Invalid promo code. Please remove or enter a valid promo code.",
      };
    }
  }

  const totalBdt = Math.max(0, subtotalBdt - discountBdt + deliveryBdt);

  return {
    ok: true,
    lines: validatedLines,
    totals: {
      subtotalBdt,
      deliveryBdt,
      discountBdt,
      promoCode: normalizedPromo,
      totalBdt,
    },
  };
}
