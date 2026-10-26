import type { Metadata } from "next";
import Link from "next/link";
import { SitePage } from "@/components/content/site-page";
import { getPublicDeliveryOptions } from "@/lib/checkout/delivery";

export const metadata: Metadata = {
  title: "Shipping Information",
  description:
    "Domestic delivery charges and estimated delivery times, plus international shipping information for Clothing71.",
  alternates: { canonical: "/shipping" },
};

export default async function ShippingPage() {
  const deliveryOptions = await getPublicDeliveryOptions();
  return (
    <SitePage
      eyebrow="Delivery"
      title="SHIPPING"
      intro="Cash on Delivery is available nationwide for domestic orders shipped through Pathao Courier."
      sections={[
        {
          title: "Domestic delivery",
          items: [
            ...deliveryOptions.map((option) => `${option.label}: BDT ${option.chargeBdt.toLocaleString()} · estimated delivery ${option.estimate}.`),
            "Cash on Delivery is available nationwide across Bangladesh.",
          ],
        },
        {
          title: "International shipping",
          paragraphs: [
            "International shipping can be arranged through DHL, FedEx, or UPS. Full advance payment is required. Shipping rates and delivery estimates depend on the destination and will be provided in a quotation.",
            "International orders cannot currently be placed or paid for through online checkout. Please contact Clothing71 for a quotation and payment arrangements.",
          ],
        },
      ]}
    >
      <Link
        href="/contact"
        className="inline-flex min-h-12 items-center border border-foreground px-6 text-center text-xs font-bold uppercase tracking-[0.16em] hover:bg-foreground hover:text-background"
      >
        Request an international shipping quotation
      </Link>
    </SitePage>
  );
}
