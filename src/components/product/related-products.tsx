import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";

interface RelatedProductsProps {
  products: Product[];
  category: string;
}

export function RelatedProducts({ products, category }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="w-full border-t border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Recommendations
            </span>
            <h3 className="font-sans text-xl font-black uppercase tracking-tight text-foreground sm:text-2xl">
              YOU MAY ALSO LIKE
            </h3>
          </div>
          <Link
            href={`/collections/${category.toLowerCase()}`}
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground hover:opacity-70"
          >
            <span>View More in {category}</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
