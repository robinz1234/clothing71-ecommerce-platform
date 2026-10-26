import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/orders/order-confirmation";

export const metadata: Metadata = {
  title: "Order Confirmation | CLOTHING71",
  description: "Your Clothing71 Cash on Delivery order confirmation.",
};

export default function OrderConfirmationPage() {
  return <OrderConfirmation />;
}
