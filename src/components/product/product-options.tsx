"use client";

import * as React from "react";
import { Ruler, Check, ShoppingBag, Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductColor } from "@/types/product";
import { Button } from "@/components/ui/button";
import { SizeGuideDialog } from "@/components/product/size-guide-dialog";
import { useCartStoreBase } from "@/lib/stores/cart-store";
import { useWishlistStoreBase } from "@/lib/stores/wishlist-store";
import { useIsHydrated } from "@/lib/hooks/use-hydrated-store";

type ComboSelection = {
  colorName: string;
  size: string;
};

function getFirstAvailableVariant(
  product: Product,
  colorName?: string,
) {
  return product.variants?.find(
    (variant) =>
      variant.stockQuantity > 0 &&
      (!colorName || variant.color.name === colorName),
  );
}

function getInitialComboSelections(
  product: Product,
  count: number,
  colorName: string,
): ComboSelection[] {
  const preferredVariant =
    getFirstAvailableVariant(product, colorName) ??
    getFirstAvailableVariant(product);
  if (!preferredVariant) return [];

  return Array.from({ length: count }, () => ({
    colorName: preferredVariant.color.name,
    size: preferredVariant.size,
  }));
}

interface ProductOptionsProps {
  product: Product;
  selectedColor: ProductColor;
  onColorChange: (color: ProductColor) => void;
}

export function ProductOptions({
  product,
  selectedColor,
  onColorChange,
}: ProductOptionsProps) {
  const isHydrated = useIsHydrated();
  const comboTier = product.quantityPrices
    ?.filter((tier) => tier.bundleQuantity >= 2)
    .sort((left, right) => left.bundleQuantity - right.bundleQuantity)[0];
  const [selectedSize, setSelectedSize] = React.useState<string>(
    product.variants?.find(
      (variant) => variant.color.name === selectedColor.name && variant.stockQuantity > 0
    )?.size || product.sizes[0] || "M"
  );
  const [quantity, setQuantity] = React.useState<number>(1);
  const [sizeGuideOpen, setSizeGuideOpen] = React.useState(false);
  const [comboSelections, setComboSelections] = React.useState<ComboSelection[]>(
    () =>
      comboTier
        ? getInitialComboSelections(
            product,
            comboTier.bundleQuantity,
            selectedColor.name,
          )
        : [],
  );

  const selectedVariant = product.variants?.find(
    (variant) =>
      variant.color.name === selectedColor.name && variant.size === selectedSize
  );
  const isOutOfStock = product.variants
    ? !selectedVariant || selectedVariant.stockQuantity < 1
    : !product.inStock;
  const selectedImage =
    product.productImages?.find(
      (image) => image.role !== "size_chart" && image.color === selectedColor.name,
    )?.url ??
    product.productImages?.find((image) => image.role === "primary")?.url ??
    product.images[0] ??
    "";

  const isWishlisted = useWishlistStoreBase((state) =>
    isHydrated ? state.isWishlisted(product.id) : false
  );
  const toggleWishlist = useWishlistStoreBase((state) => state.toggleItem);

  const handleQuantityMinus = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleQuantityPlus = () => {
    setQuantity((prev) =>
      selectedVariant
        ? Math.min(selectedVariant.stockQuantity, prev + 1)
        : prev + 1
    );
  };

  const handleColorSelect = (color: ProductColor) => {
    onColorChange(color);
    const availableVariant = product.variants?.find(
      (variant) => variant.color.name === color.name && variant.stockQuantity > 0
    );
    if (availableVariant) setSelectedSize(availableVariant.size);
    setQuantity(1);
    if (comboTier) {
      setComboSelections(
        getInitialComboSelections(product, comboTier.bundleQuantity, color.name),
      );
    }
  };

  const updateComboSelection = (
    index: number,
    update: Partial<ComboSelection>,
  ) => {
    setComboSelections((current) =>
      current.map((selection, currentIndex) =>
        currentIndex === index ? { ...selection, ...update } : selection,
      ),
    );
  };

  const handleAddCombo = () => {
    if (!comboTier || comboSelections.length !== comboTier.bundleQuantity) return;

    const variantQuantities = new Map<
      string,
      { variant: NonNullable<typeof product.variants>[number]; quantity: number }
    >();
    for (const selection of comboSelections) {
      const variant = product.variants?.find(
        (candidate) =>
          candidate.color.name === selection.colorName &&
          candidate.size === selection.size &&
          candidate.stockQuantity > 0,
      );
      if (!variant) {
        toast.error("One or more combo selections are unavailable.");
        return;
      }

      const existing = variantQuantities.get(variant.id);
      variantQuantities.set(variant.id, {
        variant,
        quantity: (existing?.quantity ?? 0) + 1,
      });
    }

    const cartItems = useCartStoreBase.getState().items;
    for (const { variant, quantity: requestedQuantity } of variantQuantities.values()) {
      const existingQuantity = cartItems
        .filter((item) => item.variantId === variant.id)
        .reduce((total, item) => total + item.quantity, 0);
      if (existingQuantity + requestedQuantity > variant.stockQuantity) {
        toast.error(`${product.name} does not have enough stock for this combo.`);
        return;
      }
    }

    for (const { variant, quantity: requestedQuantity } of variantQuantities.values()) {
      const image =
        product.productImages?.find(
          (candidate) =>
            candidate.role !== "size_chart" &&
            candidate.color === variant.color.name,
        )?.url ??
        product.productImages?.find((candidate) => candidate.role === "primary")
          ?.url ??
        product.images[0] ??
        "";

      useCartStoreBase.getState().addItem({
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        variantId: variant.id,
        sku: variant.sku,
        color: variant.color.name,
        colorHex: variant.color.hex,
        size: variant.size,
        quantity: requestedQuantity,
        unitPriceBdt: product.price,
        compareAtPriceBdt: product.compareAtPrice,
        quantityPrices: product.quantityPrices,
        maxStock: variant.stockQuantity,
        image,
        fit: product.fit,
        productType: product.productType,
      });
    }

    toast.success(`${comboTier.bundleQuantity}-piece combo added to your bag.`, {
      description: `The offer price of ৳${comboTier.bundlePriceBdt.toLocaleString()} will be applied in your order summary.`,
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    useCartStoreBase.getState().addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantId: selectedVariant?.id ?? null,
      sku: selectedVariant?.sku ?? product.sku,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      size: selectedSize,
      quantity,
      unitPriceBdt: product.price,
      compareAtPriceBdt: product.compareAtPrice,
      quantityPrices: product.quantityPrices,
      maxStock: selectedVariant?.stockQuantity,
      image: selectedImage,
      fit: product.fit,
      productType: product.productType,
    });

    toast.success("Added to Bag", {
      description: `${product.name} — ${selectedColor.name} / ${selectedSize} (x${quantity})`,
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;

    useCartStoreBase.getState().addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantId: selectedVariant?.id ?? null,
      sku: selectedVariant?.sku ?? product.sku,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      size: selectedSize,
      quantity,
      unitPriceBdt: product.price,
      compareAtPriceBdt: product.compareAtPrice,
      quantityPrices: product.quantityPrices,
      maxStock: selectedVariant?.stockQuantity,
      image: selectedImage,
      fit: product.fit,
      productType: product.productType,
    });

    useCartStoreBase.getState().setIsOpen(true);
  };

  const handleToggleWishlist = () => {
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
    <div className="flex flex-col space-y-6">
      {/* 1. Color Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-widest text-foreground">
            Color: <span className="font-semibold text-muted-foreground">{selectedColor.name}</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {product.colors.length} {product.colors.length === 1 ? "Option" : "Options"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {product.colors.map((color) => {
            const isSelected = selectedColor.name === color.name;
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={`relative flex items-center gap-2 border px-3 py-2 text-xs font-medium uppercase tracking-wider transition-all ${
                  isSelected
                    ? "border-foreground bg-muted font-bold ring-1 ring-foreground"
                    : "border-border bg-background hover:border-foreground/60"
                }`}
                aria-label={`Select color ${color.name}`}
              >
                <span
                  className="size-3.5 border border-border/80"
                  style={{ backgroundColor: color.hex }}
                />
                <span>{color.name}</span>
                {isSelected && <Check className="size-3 text-foreground ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Size Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-widest text-foreground">
            Size: <span className="font-semibold text-muted-foreground">{selectedSize}</span>
          </span>
          <button
            type="button"
            onClick={() => setSizeGuideOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors underline"
          >
            <Ruler className="size-3" />
            <span>Size Guide</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {product.sizes.map((size) => {
            const isSelected = selectedSize === size;
            const sizeVariant = product.variants?.find(
              (variant) =>
                variant.color.name === selectedColor.name && variant.size === size
            );
            const isSizeUnavailable = product.variants
              ? !sizeVariant || sizeVariant.stockQuantity < 1
              : !product.inStock;

            return (
              <button
                key={size}
                type="button"
                disabled={isSizeUnavailable}
                onClick={() => {
                  setSelectedSize(size);
                  setQuantity(1);
                }}
                className={`h-11 border text-center text-xs font-bold uppercase tracking-wider transition-all ${
                  isSizeUnavailable
                    ? "cursor-not-allowed border-dashed border-border bg-muted/30 text-muted-foreground/40 line-through"
                    : isSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-foreground hover:border-foreground"
                }`}
                aria-label={`Size ${size}`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Quantity Control */}
      <div className="space-y-2 border-t border-border pt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-foreground">
          Quantity:
        </span>
        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center border border-border bg-background">
            <button
              type="button"
              disabled={isOutOfStock || quantity <= 1}
              onClick={handleQuantityMinus}
              className="flex size-11 items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-12 text-center text-sm font-bold tabular-nums text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleQuantityPlus}
              className="flex size-11 items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isOutOfStock ? (
              <span className="font-bold text-red-600">Currently Out of Stock</span>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                In Stock &middot; Ready to Ship
              </span>
            )}
          </div>
        </div>
      </div>

      {comboTier && (
        <section
          aria-labelledby="combo-builder-heading"
          className="space-y-4 border border-border bg-muted/20 p-4 sm:p-5"
        >
          <div>
            <h3
              id="combo-builder-heading"
              className="text-sm font-black uppercase tracking-wider"
            >
              Build your {comboTier.bundleQuantity}-piece combo
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose a color and in-stock size for each piece.{" "}
              <span className="font-bold text-foreground">
                ৳{comboTier.bundlePriceBdt.toLocaleString()} for{" "}
                {comboTier.bundleQuantity}
              </span>
            </p>
          </div>

          {comboSelections.map((selection, index) => {
            const availableSizes = product.variants
              ?.filter(
                (variant) =>
                  variant.color.name === selection.colorName &&
                  variant.stockQuantity > 0,
              )
              .map((variant) => variant.size) ?? [];

            return (
              <fieldset
                key={`combo-piece-${index + 1}`}
                className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2"
              >
                <legend className="sr-only">Piece {index + 1}</legend>
                <label className="space-y-1.5 text-xs font-bold uppercase tracking-wider">
                  <span>Piece {index + 1} color</span>
                  <select
                    value={selection.colorName}
                    onChange={(event) => {
                      const colorName = event.target.value;
                      const nextVariant = getFirstAvailableVariant(
                        product,
                        colorName,
                      );
                      if (!nextVariant) return;
                      updateComboSelection(index, {
                        colorName,
                        size: nextVariant.size,
                      });
                    }}
                    className="h-11 w-full border border-border bg-background px-3 text-xs font-medium normal-case tracking-normal"
                  >
                    {product.colors.map((color) => (
                      <option key={color.name} value={color.name}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-xs font-bold uppercase tracking-wider">
                  <span>Piece {index + 1} size</span>
                  <select
                    value={selection.size}
                    onChange={(event) =>
                      updateComboSelection(index, { size: event.target.value })
                    }
                    className="h-11 w-full border border-border bg-background px-3 text-xs font-medium normal-case tracking-normal"
                  >
                    {availableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>
            );
          })}

          <Button
            type="button"
            variant="outline"
            disabled={
              comboSelections.length !== comboTier.bundleQuantity ||
              comboSelections.some(
                (selection) =>
                  !product.variants?.some(
                    (variant) =>
                      variant.color.name === selection.colorName &&
                      variant.size === selection.size &&
                      variant.stockQuantity > 0,
                  ),
              )
            }
            onClick={handleAddCombo}
            className="min-h-12 w-full text-xs font-bold uppercase tracking-[0.16em]"
          >
            Add {comboTier.bundleQuantity}-Piece Combo to Bag
          </Button>
        </section>
      )}

      {/* 4. Action Buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex gap-3">
          <Button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="h-12 flex-1 text-xs font-bold uppercase tracking-[0.2em]"
          >
            <ShoppingBag className="mr-2 size-4" />
            <span>Add to Bag</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleToggleWishlist}
            className={`size-12 shrink-0 border p-0 transition-colors ${
              isWishlisted
                ? "border-red-600 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                : "border-border text-foreground hover:border-foreground"
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`size-4 ${isWishlisted ? "fill-current text-red-600" : ""}`} />
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
          className="h-12 w-full text-xs font-bold uppercase tracking-[0.2em]"
        >
          <span>Buy Now</span>
        </Button>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideDialog
        open={sizeGuideOpen}
        onOpenChange={setSizeGuideOpen}
        productName={product.name}
        sizeGuides={product.sizeGuides ?? []}
        sizeChartImage={product.productImages?.find((image) => image.role === "size_chart")}
      />
    </div>
  );
}
