"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { useWishlistStoreBase } from "@/lib/stores/wishlist-store";
import { useIsHydrated } from "@/lib/hooks/use-hydrated-store";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isHydrated = useIsHydrated();
  const isSoldOut = !product.inStock;
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const isWishlisted = useWishlistStoreBase((state) =>
    isHydrated ? state.isWishlisted(product.id) : false
  );
  const toggleWishlist = useWishlistStoreBase((state) => state.toggleItem);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);

    if (!isWishlisted) {
      toast.success("Added to Wishlist", {
        description: `${product.name} saved to your favorites.`,
      });
    } else {
      toast.info("Removed from Wishlist", {
        description: `${product.name} removed from favorites.`,
      });
    }
  };

  return (
    <div className={`group relative flex flex-col ${isSoldOut ? "opacity-75" : ""}`}>
      {/* Visual Image Container (3:4 ratio) */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] w-full overflow-hidden border border-border/60 bg-muted/60"
        aria-label={`View ${product.name}`}
      >
        {/* Real Product Image or Monogram Watermark */}
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-transform duration-500 ease-out group-hover:scale-105">
            <span className="select-none font-sans text-5xl font-black tracking-widest text-foreground/5 sm:text-6xl">
              C71
            </span>
            <div className="mt-2 flex flex-col items-center">
              <span className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground uppercase">
                {product.productType.replace("-", " ")}
              </span>
              {product.fit && (
                <span className="mt-1 border border-border/80 bg-background/80 px-2 py-0.5 text-[9px] font-medium tracking-widest text-foreground uppercase">
                  {product.fit}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Wishlist Button Overlay */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 z-10 flex size-8 items-center justify-center border transition-colors ${
            isWishlisted
              ? "border-red-600 bg-background text-red-600 shadow-sm"
              : "border-border/60 bg-background/80 text-foreground hover:bg-background hover:text-red-600"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart className={`size-3.5 ${isWishlisted ? "fill-current text-red-600" : ""}`} />
        </button>

        {/* Secondary hover detail cue */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/10 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex justify-between items-end">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-foreground/70 bg-background/90 px-1.5 py-0.5 border border-border/60">
            View Details
          </span>
          <span className="text-[9px] font-mono text-foreground/70 bg-background/90 px-1.5 py-0.5 border border-border/60">
            {product.sku}
          </span>
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 pointer-events-none">
          {isSoldOut ? (
            <span className="bg-neutral-800 px-2 py-0.5 text-[9px] font-bold tracking-widest text-white uppercase">
              Sold Out
            </span>
          ) : (
            <>
              {product.isNew && (
                <span className="bg-black px-2 py-0.5 text-[9px] font-bold tracking-widest text-white uppercase dark:bg-white dark:text-black">
                  New
                </span>
              )}
              {product.isSale && (
                <span className="bg-red-600 px-2 py-0.5 text-[9px] font-bold tracking-widest text-white uppercase">
                  Sale {discountPercent ? `-${discountPercent}%` : ""}
                </span>
              )}
              {product.isBestSeller && !product.isNew && (
                <span className="border border-border bg-background px-2 py-0.5 text-[9px] font-bold tracking-widest text-foreground uppercase">
                  Best Seller
                </span>
              )}
            </>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="mt-3 flex flex-col space-y-1">
        {/* Category & Sizes Preview */}
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>{(product.audiences ?? [product.category]).join(", ")}</span>
          {product.sizes && product.sizes.length > 0 && (
            <span className="text-[10px]">{product.sizes.slice(0, 3).join(" · ")}</span>
          )}
        </div>

        {/* Product Title */}
        <Link
          href={`/products/${product.slug}`}
          className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground transition-opacity hover:opacity-70 line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Price & Discount */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-xs font-bold tabular-nums text-foreground">
            ৳ {product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs tabular-nums text-muted-foreground line-through">
              ৳ {product.compareAtPrice.toLocaleString()}
            </span>
          )}
          {isSoldOut && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              (Out of Stock)
            </span>
          )}
        </div>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1.5" aria-label="Available colors">
            {product.colors.map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="size-3 border border-border/80"
                style={{ backgroundColor: color.hex }}
              />
            ))}
            <span className="text-[10px] text-muted-foreground ml-0.5">
              ({product.colors.length})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
