import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { CatalogView } from "@/components/catalog/catalog-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All | CLOTHING71 Catalog",
  description:
    "Explore the complete Clothing71 streetwear catalog. Premium export-quality t-shirts, relaxed trousers, and combo sets crafted in our Dhaka factory.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop All | CLOTHING71 Catalog",
    description: "Explore the complete Clothing71 streetwear catalog.",
    url: "/shop",
    type: "website",
  },
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <CatalogView
      title="ALL COLLECTIONS"
      description="Browse our complete collection of in-house manufactured streetwear essentials. Engineered drop-shoulder tees, heavyweight cottons, and relaxed trousers."
      initialProducts={products}
    />
  );
}

