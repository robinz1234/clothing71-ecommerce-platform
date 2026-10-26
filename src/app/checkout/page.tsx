import type { Metadata } from "next";
import { getCurrentCustomerProfile } from "@/lib/auth/profile";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getPublicDeliveryOptions } from "@/lib/checkout/delivery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | CLOTHING71",
  description: "Review your Clothing71 bag and delivery details.",
};

export default async function CheckoutPage() {
  const [profile, deliveryOptions] = await Promise.all([
    getCurrentCustomerProfile(),
    getPublicDeliveryOptions(),
  ]);

  return (
    <CheckoutForm
      deliveryOptions={deliveryOptions}
      profile={
        profile
          ? {
              fullName: profile.full_name ?? "",
              phone: profile.phone ?? "",
              email: profile.email ?? "",
            }
          : undefined
      }
    />
  );
}
