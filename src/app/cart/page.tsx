import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { getPublicDeliveryOptions } from "@/lib/checkout/delivery";

export const metadata: Metadata = {
  title: "Shopping Bag | CLOTHING71",
  description:
    "Review your selected Clothing71 export-quality streetwear garments before proceeding to checkout.",
};

export default async function CartPage() {
  const deliveryOptions = await getPublicDeliveryOptions();
  return <CartView deliveryOptions={deliveryOptions} />;
}
