import type { Metadata } from "next";
import { SitePage } from "@/components/content/site-page";

export const metadata: Metadata = { title: "About Clothing71", description: "Learn about Clothing71, a premium export-quality clothing brand designed and manufactured in Dhaka.", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return <SitePage eyebrow="The Brand" title="ABOUT CLOTHING71" intro="Wear Your Attitude." sections={[{ title: "Export-quality fashion", paragraphs: ["Clothing71 is a premium clothing brand dedicated to delivering export-quality fashion. Every piece is carefully designed and manufactured in our own factory, ensuring premium quality, superior craftsmanship, and attention to every detail."] }, { title: "Made in Dhaka", paragraphs: ["Clothing71 is based in Dhaka, Bangladesh. Our work is grounded in thoughtful design, careful construction, and a direct connection to our own factory production."] }]} />;
}
