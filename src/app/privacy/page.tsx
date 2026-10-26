import type { Metadata } from "next";
import { SitePage } from "@/components/content/site-page";

export const metadata: Metadata = { title: "Privacy Policy", description: "Clothing71 privacy information for accounts, checkout, and customer communication.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <SitePage eyebrow="Legal" title="PRIVACY POLICY" intro="This summary explains how Clothing71 uses information needed to operate the storefront and customer account experience." sections={[{ title: "Information you provide", paragraphs: ["When you register, update your profile, or check out, Clothing71 may receive your name, email address, phone number, and delivery details. Guest checkout does not require an account."] }, { title: "How information is used", paragraphs: ["Information is used to authenticate accounts, maintain profiles, validate carts, process Cash on Delivery orders, deliver orders, provide customer support, and show your authenticated order history."] }, { title: "Security and access", paragraphs: ["Account and order access is protected by authenticated sessions and database access rules. Customer order information is not made available through a public order lookup."] }, { title: "Contact", paragraphs: ["For privacy questions, contact info@clothing71bd.com or call +880 1975743106."] }]} />;
}
