import type { Metadata } from "next";
import { SitePage } from "@/components/content/site-page";

export const metadata: Metadata = { title: "Terms & Conditions", description: "Clothing71 terms for accounts, checkout, Cash on Delivery, delivery, and customer orders.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return <SitePage eyebrow="Legal" title="TERMS & CONDITIONS" intro="These terms describe the currently implemented Clothing71 storefront and ordering experience." sections={[{ title: "Accounts and checkout", paragraphs: ["Customers may browse and use guest checkout or create an account. Customers are responsible for providing accurate contact and delivery information. Product availability, price, stock, and totals are revalidated on the server before an order is created."] }, { title: "Orders and payment", paragraphs: ["Cash on Delivery is available nationwide for domestic orders. International orders require full advance payment; request a quotation by contacting Clothing71. International online checkout and payment are not currently available."] }, { title: "Domestic delivery", paragraphs: ["Domestic delivery is provided through Pathao Courier. Inside Dhaka and nearby areas: BDT 80, estimated 1–2 days. Outside Dhaka: BDT 120, estimated 2–4 days. Cash on Delivery is available nationwide."] }, { title: "Returns, exchanges, and refunds", paragraphs: ["Returns and exchanges are governed by the confirmed Returns & Exchanges policy. There are no refunds; all sales are final subject to eligible exchange rules."] }]} />;
}
