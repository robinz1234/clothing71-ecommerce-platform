"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, ArrowRight, Trash2 } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";
import { useWishlistStoreBase } from "@/lib/stores/wishlist-store";
import { useIsHydrated } from "@/lib/hooks/use-hydrated-store";

interface WishlistViewProps {
  catalogProducts: Product[];
}

export function WishlistView({ catalogProducts }: WishlistViewProps) {
  const isHydrated = useIsHydrated();
  const productIds = useWishlistStoreBase((state) => state.productIds);
  const clearWishlist = useWishlistStoreBase((state) => state.clearWishlist);

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-12">
        <div className="h-64 animate-pulse bg-muted/30 border border-border" />
      </div>
    );
  }

  // Filter available catalog products by saved wishlist IDs
  const savedProducts = catalogProducts.filter((product) =>
    productIds.includes(product.id)
  );

  if (savedProducts.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-12 lg:py-24">
        <div className="flex min-h-[400px] flex-col items-center justify-center border border-dashed border-border p-8 text-center sm:p-16">
          <div className="flex size-20 items-center justify-center border border-border bg-muted/40 text-muted-foreground">
            <Heart className="size-8" />
          </div>
          <h1 className="mt-6 font-sans text-2xl font-black uppercase tracking-widest text-foreground sm:text-3xl">
            YOUR WISHLIST IS EMPTY
          </h1>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Save your favorite drop-shoulder silhouettes, heavyweight cotton tees, and relaxed trousers for quick access later.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-12 items-center bg-black px-8 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-12 lg:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Saved Favorites
          </span>
          <h1 className="mt-1 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            WISHLIST ({savedProducts.length})
          </h1>
        </div>
        <button
          type="button"
          onClick={clearWishlist}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-red-600 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="size-3.5" />
          <span>Clear Wishlist</span>
        </button>
      </div>

      {/* Product Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {savedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
