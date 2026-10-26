import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { getProducts } from "@/lib/catalog";
import type { Product } from "@/types/product";

export const dynamic = "force-dynamic";

function selectFeaturedProducts(products: Product[]): Product[] {
  const sortedProducts = [...products].sort((left, right) =>
    left.sku.localeCompare(right.sku),
  );
  const inStockProducts = sortedProducts.filter((product) => product.inStock);
  const selected = new Map<string, Product>();
  const addProducts = (candidates: Product[], limit: number) => {
    let added = 0;
    for (const product of candidates) {
      if (added >= limit) break;
      if (!selected.has(product.id)) {
        selected.set(product.id, product);
        added += 1;
      }
    }
  };

  addProducts(
    inStockProducts.filter((product) => product.productType === "t-shirts"),
    3,
  );
  addProducts(
    inStockProducts.filter(
      (product) =>
        product.productType === "trousers" ||
        product.productType === "short-pants",
    ),
    4,
  );
  addProducts(
    inStockProducts.filter((product) => product.audiences?.includes("kids")),
    1,
  );
  addProducts(sortedProducts, 8);

  return Array.from(selected.values()).slice(0, 8);
}

export default async function HomePage() {
  const products = await getProducts();
  const featuredProducts = selectFeaturedProducts(products);

  return (
    <div className="flex w-full flex-col">
      <Hero />
      <CategoryGrid />
      <FeaturedProducts
        title="FEATURED PICKS"
        subtitle="A considered edit of Clothing71 essentials."
        eyebrow="Selected for you"
        viewAllHref="/shop"
        products={featuredProducts}
        limit={8}
        id="featured-picks"
      />
    </div>
  );
}
