import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";

interface FeaturedProductsProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  id?: string;
  viewAllHref: string;
  products: Product[];
  limit?: number;
}

export function FeaturedProducts({
  title,
  subtitle,
  eyebrow,
  id,
  viewAllHref,
  products,
  limit = 4,
}: FeaturedProductsProps) {
  const displayProducts = products.slice(0, limit);

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section id={id} className="w-full scroll-mt-24 border-b border-border bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div>
            {eyebrow && (
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                {eyebrow}
              </span>
            )}
            <h2 className="mt-1 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            href={viewAllHref}
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-foreground transition-opacity hover:opacity-70"
          >
            <span>View All</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Grid: 2 columns mobile, 4 columns desktop */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
