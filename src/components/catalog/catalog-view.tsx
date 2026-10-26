"use client";

import * as React from "react";
import { SlidersHorizontal, X, RotateCcw, ChevronDown } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export type SortOption =
  | "featured"
  | "newest"
  | "best-selling"
  | "price-asc"
  | "price-desc";

function audiencesForProduct(product: Product): string[] {
  return product.audiences?.length ? product.audiences : [product.category];
}

interface CatalogViewProps {
  title: string;
  description?: string;
  initialProducts: Product[];
  fixedCategory?: string;
  collectionSlug?: string;
}

export function CatalogView({
  title,
  description,
  initialProducts,
  fixedCategory,
  collectionSlug,
}: CatalogViewProps) {
  // Filter States
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    fixedCategory ? [fixedCategory.toLowerCase()] : []
  );
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);
  const [selectedColors, setSelectedColors] = React.useState<string[]>([]);
  const [selectedFits, setSelectedFits] = React.useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = React.useState<boolean>(false);
  const [sortOption, setSortOption] = React.useState<SortOption>("featured");
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState<boolean>(false);

  // Available Filter Options derived from initialProducts
  const availableCategories = React.useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => audiencesForProduct(p).forEach((audience) => set.add(audience)));
    return Array.from(set);
  }, [initialProducts]);

  const availableTypes = React.useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => set.add(p.productType));
    return Array.from(set);
  }, [initialProducts]);

  const availableSizes = React.useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => p.sizes?.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [initialProducts]);

  const availableColors = React.useMemo(() => {
    const map = new Map<string, string>();
    initialProducts.forEach((p) =>
      p.colors?.forEach((c) => map.set(c.name, c.hex))
    );
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [initialProducts]);

  const availableFits = React.useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.fit) set.add(p.fit);
    });
    return Array.from(set);
  }, [initialProducts]);

  // Toggle helper
  const toggleFilter = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    if (!fixedCategory) setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedFits([]);
    setInStockOnly(false);
    setSortOption("featured");
  };

  // Filter & Sort Logic
  const filteredProducts = React.useMemo(() => {
    let result = [...initialProducts];

    // Category filter (if not locked by fixedCategory)
    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        audiencesForProduct(p).some((audience) =>
          selectedCategories.includes(audience.toLowerCase())
        )
      );
    }

    // Product Type filter
    if (selectedTypes.length > 0) {
      result = result.filter((p) => selectedTypes.includes(p.productType));
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors?.some((c) => selectedColors.includes(c.name))
      );
    }

    // Fit filter
    if (selectedFits.length > 0) {
      result = result.filter((p) => p.fit && selectedFits.includes(p.fit));
    }

    // Stock filter
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Sorting
    switch (sortOption) {
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "best-selling":
        result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "featured":
      default:
        // Default order
        break;
    }

    return result;
  }, [
    initialProducts,
    selectedCategories,
    selectedTypes,
    selectedSizes,
    selectedColors,
    selectedFits,
    inStockOnly,
    sortOption,
  ]);

  const activeFilterCount =
    (fixedCategory ? 0 : selectedCategories.length) +
    selectedTypes.length +
    selectedSizes.length +
    selectedColors.length +
    selectedFits.length +
    (inStockOnly ? 1 : 0);

  return (
    <div className="w-full bg-background">
      {/* Header Banner */}
      <div className="border-b border-border bg-muted/20 py-7 sm:py-10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-start gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              {collectionSlug ? "Collection Catalog" : "Storefront Catalog"}
            </span>
            <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Active Filters / Mobile Trigger / Sort Controls */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-sm lg:top-16">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-12">
          {/* Left: Mobile Filter Button & Desktop Count */}
          <div className="flex items-center gap-4">
            <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden flex items-center gap-2 h-9 px-3 text-xs uppercase tracking-wider"
                  aria-label="Open filter menu"
                >
                  <SlidersHorizontal className="size-3.5" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="flex size-4 items-center justify-center bg-black text-[9px] font-bold text-white dark:bg-white dark:text-black">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex w-[85vw] max-w-md flex-col justify-between p-0 border-r border-border bg-background"
              >
                <SheetHeader className="border-b border-border p-6 text-left">
                  <SheetTitle className="text-base font-black tracking-widest uppercase">
                    FILTER PRODUCTS
                  </SheetTitle>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {filteredProducts.length} Items Matching
                  </p>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Category Filter */}
                  {!fixedCategory && availableCategories.length > 0 && (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
                        Category
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() =>
                              toggleFilter(
                                selectedCategories,
                                setSelectedCategories,
                                cat.toLowerCase()
                              )
                            }
                            className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                              selectedCategories.includes(cat.toLowerCase())
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background text-foreground"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Type Filter */}
                  {availableTypes.length > 0 && (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
                        Product Type
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              toggleFilter(selectedTypes, setSelectedTypes, type)
                            }
                            className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                              selectedTypes.includes(type)
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background text-foreground"
                            }`}
                          >
                            {type.replace("-", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fit Filter */}
                  {availableFits.length > 0 && (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
                        Fit
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableFits.map((fit) => (
                          <button
                            key={fit}
                            type="button"
                            onClick={() =>
                              toggleFilter(selectedFits, setSelectedFits, fit)
                            }
                            className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                              selectedFits.includes(fit)
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background text-foreground"
                            }`}
                          >
                            {fit}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Filter */}
                  {availableSizes.length > 0 && (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
                        Size
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              toggleFilter(selectedSizes, setSelectedSizes, size)
                            }
                            className={`min-w-10 border px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-wider transition-colors ${
                              selectedSizes.includes(size)
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background text-foreground"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Filter */}
                  {availableColors.length > 0 && (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
                        Color
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map((color) => {
                          const isSelected = selectedColors.includes(color.name);
                          return (
                            <button
                              key={color.name}
                              type="button"
                              onClick={() =>
                                toggleFilter(
                                  selectedColors,
                                  setSelectedColors,
                                  color.name
                                )
                              }
                              className={`flex items-center gap-2 border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                                isSelected
                                  ? "border-foreground bg-muted font-bold"
                                  : "border-border bg-background"
                              }`}
                            >
                              <span
                                className="size-3 border border-border"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span>{color.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* In Stock Only Checkbox */}
                  <div className="pt-2 border-t border-border">
                    <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="size-4 rounded-none accent-black"
                      />
                      <span>In Stock Only</span>
                    </label>
                  </div>
                </div>

                {/* Mobile Drawer Footer Actions */}
                <div className="border-t border-border p-6 bg-muted/20 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="flex-1 h-11 text-xs font-bold tracking-widest uppercase"
                  >
                    Clear All
                  </Button>
                  <SheetClose asChild>
                    <Button className="flex-1 h-11 text-xs font-bold tracking-widest uppercase">
                      Show {filteredProducts.length} Items
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "Product" : "Products"}
            </span>
          </div>

          {/* Right: Sorting Select */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Sort:
            </span>
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                aria-label="Sort products by"
                className="h-9 w-36 min-w-0 appearance-none border border-border bg-background px-2 pr-7 text-[10px] font-semibold uppercase tracking-normal text-foreground focus:border-foreground focus:outline-none cursor-pointer sm:w-auto sm:px-3 sm:pr-8 sm:text-xs sm:tracking-wider"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="best-selling">Best Selling</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFilterCount > 0 && (
          <div className="border-t border-border/60 bg-muted/10 py-2">
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 px-4 sm:px-6 lg:px-12">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Active Filters:
              </span>

              {!fixedCategory &&
                selectedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      toggleFilter(
                        selectedCategories,
                        setSelectedCategories,
                        cat
                      )
                    }
                    className="inline-flex items-center gap-1 border border-border bg-background px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider hover:border-foreground"
                  >
                    <span>{cat}</span>
                    <X className="size-3" />
                  </button>
                ))}

              {selectedTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    toggleFilter(selectedTypes, setSelectedTypes, type)
                  }
                  className="inline-flex items-center gap-1 border border-border bg-background px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider hover:border-foreground"
                >
                  <span>{type.replace("-", " ")}</span>
                  <X className="size-3" />
                </button>
              ))}

              {selectedFits.map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() =>
                    toggleFilter(selectedFits, setSelectedFits, fit)
                  }
                  className="inline-flex items-center gap-1 border border-border bg-background px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider hover:border-foreground"
                >
                  <span>{fit}</span>
                  <X className="size-3" />
                </button>
              ))}

              {selectedSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    toggleFilter(selectedSizes, setSelectedSizes, size)
                  }
                  className="inline-flex items-center gap-1 border border-border bg-background px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider hover:border-foreground"
                >
                  <span>Size: {size}</span>
                  <X className="size-3" />
                </button>
              ))}

              {selectedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    toggleFilter(selectedColors, setSelectedColors, color)
                  }
                  className="inline-flex items-center gap-1 border border-border bg-background px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider hover:border-foreground"
                >
                  <span>{color}</span>
                  <X className="size-3" />
                </button>
              ))}

              {inStockOnly && (
                <button
                  type="button"
                  onClick={() => setInStockOnly(false)}
                  className="inline-flex items-center gap-1 border border-border bg-background px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider hover:border-foreground"
                >
                  <span>In Stock</span>
                  <X className="size-3" />
                </button>
              )}

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground underline ml-2"
              >
                <RotateCcw className="size-3" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Catalog Layout: Desktop Sidebar + Product Grid */}
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 xl:grid-cols-5">
          {/* Desktop Filter Sidebar (Left Column) */}
          <aside
            className="hidden lg:block lg:col-span-1 space-y-8 pr-4"
            aria-label="Desktop Filters"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                FILTERS
              </span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category */}
            {!fixedCategory && availableCategories.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Category
                </p>
                <div className="space-y-2">
                  {availableCategories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2.5 text-xs uppercase tracking-wider cursor-pointer hover:text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.toLowerCase())}
                        onChange={() =>
                          toggleFilter(
                            selectedCategories,
                            setSelectedCategories,
                            cat.toLowerCase()
                          )
                        }
                        className="size-3.5 rounded-none accent-black"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Product Type */}
            {availableTypes.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Product Type
                </p>
                <div className="space-y-2">
                  {availableTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2.5 text-xs uppercase tracking-wider cursor-pointer hover:text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() =>
                          toggleFilter(selectedTypes, setSelectedTypes, type)
                        }
                        className="size-3.5 rounded-none accent-black"
                      />
                      <span>{type.replace("-", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Fit */}
            {availableFits.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Fit
                </p>
                <div className="space-y-2">
                  {availableFits.map((fit) => (
                    <label
                      key={fit}
                      className="flex items-center gap-2.5 text-xs uppercase tracking-wider cursor-pointer hover:text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFits.includes(fit)}
                        onChange={() =>
                          toggleFilter(selectedFits, setSelectedFits, fit)
                        }
                        className="size-3.5 rounded-none accent-black"
                      />
                      <span>{fit}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {availableSizes.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Size
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          toggleFilter(selectedSizes, setSelectedSizes, size)
                        }
                        className={`h-8 border text-center text-xs font-semibold uppercase tracking-wider transition-colors ${
                          isSelected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-foreground hover:border-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color */}
            {availableColors.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Color
                </p>
                <div className="space-y-2">
                  {availableColors.map((color) => {
                    const isSelected = selectedColors.includes(color.name);
                    return (
                      <label
                        key={color.name}
                        className="flex items-center gap-2.5 text-xs uppercase tracking-wider cursor-pointer hover:text-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            toggleFilter(
                              selectedColors,
                              setSelectedColors,
                              color.name
                            )
                          }
                          className="size-3.5 rounded-none accent-black"
                        />
                        <span
                          className="size-3 border border-border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* In Stock */}
            <div className="pt-2 border-t border-border">
              <label className="flex items-center gap-2.5 text-xs uppercase tracking-wider cursor-pointer hover:text-foreground font-semibold">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="size-3.5 rounded-none accent-black"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area (Right Column) */}
          <main className="lg:col-span-3 xl:col-span-4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center border border-dashed border-border p-12 text-center">
                <span className="text-4xl font-black text-foreground/20">
                  C71
                </span>
                <h3 className="mt-4 text-base font-black uppercase tracking-widest text-foreground">
                  NO PRODUCTS MATCH YOUR FILTERS
                </h3>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  Try clearing some filter criteria or selecting another category to view available garments.
                </p>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  size="sm"
                  className="mt-6 h-10 px-6 text-xs font-bold uppercase tracking-widest"
                >
                  <RotateCcw className="mr-2 size-3.5" />
                  Reset All Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
