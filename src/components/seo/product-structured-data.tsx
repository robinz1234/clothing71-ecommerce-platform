import type { Product } from "@/types/product";

export function ProductStructuredData({ product }: { product: Product }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    sku: product.sku || undefined,
    brand: { "@type": "Brand", name: "Clothing71" },
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `https://www.clothing71bd.com/products/${product.slug}`,
    },
  };

  return <script type="application/ld+json">{JSON.stringify(structuredData)}</script>;
}
