import type { Metadata } from "next";
import { SitePage } from "@/components/content/site-page";

export const metadata: Metadata = { title: "Returns & Exchanges", description: "Clothing71 returns, exchanges, damaged-product, and refund policy.", alternates: { canonical: "/returns-exchanges" } };

export default function ReturnsExchangesPage() {
  return <SitePage eyebrow="Customer Care" title="RETURNS & EXCHANGES" intro="Please review these confirmed Clothing71 policies before accepting delivery." sections={[{ title: "Returns", paragraphs: ["Returns must be made to the delivery person at the time of delivery. Complaints or returns after the delivery person leaves are not accepted. The customer pays applicable return delivery charges."] }, { title: "Exchanges", paragraphs: ["Size or color exchange is available within 2–4 working days after receiving. The customer pays exchange delivery charges."] }, { title: "Damaged or incorrect products", paragraphs: ["Notify Clothing71 immediately upon delivery. Claims after the delivery person leaves are not accepted. Eligible products may be exchanged."] }, { title: "Refunds", paragraphs: ["There are no refunds. All sales are final subject to eligible exchange rules."] }]} />;
}
