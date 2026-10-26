"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product, ProductColor } from "@/types/product";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductOptions } from "@/components/product/product-options";
import { ProductAccordions } from "@/components/product/product-accordions";

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedColor, setSelectedColor] = React.useState<ProductColor>(
    product.colors.find((color) =>
      product.variants?.some(
        (variant) => variant.color.name === color.name && variant.stockQuantity > 0
      )
    ) || product.colors[0] || { name: "Standard", hex: "#000000" }
  );

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;
  const audienceLabel = (product.audiences ?? [product.category])
    .map((audience) => audience.toUpperCase())
    .join(", ");

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3" />
        <Link href="/shop" className="hover:text-foreground">Catalog</Link>
        <ChevronRight className="size-3" />
        <Link href={`/collections/${product.category.toLowerCase()}`} className="hover:text-foreground">
          {audienceLabel}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Two-Column Editorial Layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column: Product Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery product={product} selectedColor={selectedColor} />
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="flex flex-col space-y-8 lg:col-span-5">
          {/* Header & Pricing */}
          <div className="space-y-2 border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                {audienceLabel} &middot; {product.productType.replaceAll("-", " ")}
              </span>
              {product.fit && (
                <span className="border border-border bg-muted/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-foreground">
                  {product.fit}
                </span>
              )}
            </div>

            <h1 className="font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xl font-black tabular-nums text-foreground sm:text-2xl">
                ৳ {product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-base tabular-nums text-muted-foreground line-through">
                    ৳ {product.compareAtPrice.toLocaleString()}
                  </span>
                  {discountPercent && (
                    <span className="bg-red-600 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase">
                      Save {discountPercent}%
                    </span>
                  )}
                </>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground pt-1">
              Tax included &middot; Nationwide Cash on Delivery available
            </p>
            {product.quantityPrices?.map((tier) => (
              <p key={tier.bundleQuantity} className="pt-2 text-xs font-bold uppercase tracking-wider">
                {tier.bundleQuantity} for ৳ {tier.bundlePriceBdt.toLocaleString()}
              </p>
            ))}
          </div>

          {/* Color & Size Selectors + CTA Buttons */}
          <ProductOptions
            product={product}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />

          {/* Product Accordions */}
          <ProductAccordions product={product} />
        </div>
      </div>
    </div>
  );
}
