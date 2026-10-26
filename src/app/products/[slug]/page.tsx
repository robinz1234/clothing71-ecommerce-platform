import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
  getCompleteTheLookProducts,
} from "@/lib/catalog";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { CompleteTheLook } from "@/components/product/complete-the-look";
import { RelatedProducts } from "@/components/product/related-products";
import { ProductStructuredData } from "@/components/seo/product-structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | CLOTHING71",
    };
  }

  return {
    title: `${product.name} | CLOTHING71`,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} — CLOTHING71`,
      description: product.description,
      type: "website",
      url: `/products/${product.slug}`,
      images: product.images.length > 0 ? product.images.slice(0, 1) : undefined,
    },
    twitter: { card: "summary_large_image", title: `${product.name} — CLOTHING71`, description: product.description },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const completeTheLookProducts = await getCompleteTheLookProducts(product);
  const relatedProducts = await getRelatedProducts(product, 4);

  return (
    <div className="w-full bg-background">
      <ProductStructuredData product={product} />
      {/* Product Detail Main View */}
      <ProductDetailView product={product} />

      {/* Complete The Look Section */}
      <CompleteTheLook
        currentProduct={product}
        pairingProducts={completeTheLookProducts}
      />

      {/* Related Products: You May Also Like */}
      <RelatedProducts
        products={relatedProducts}
        category={product.category}
      />
    </div>
  );
}

