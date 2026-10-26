"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowRight, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import type { Product } from "@/types/product";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const performSearch = React.useCallback(async (searchTerm: string) => {
    const cleanTerm = searchTerm.trim();
    if (!cleanTerm) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(cleanTerm)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setQuery("");
      setResults([]);
      setIsLoading(false);
    }
    onOpenChange(newOpen);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    performSearch(val);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden border-border bg-background">
        <DialogHeader className="p-6 border-b border-border">
          <DialogTitle className="text-base font-black tracking-[0.2em]">
            SEARCH CLOTHING71
          </DialogTitle>
          <DialogDescription className="sr-only">
            Search our catalog by product name, category, fit, or color.
          </DialogDescription>
          <div className="relative mt-4 flex items-center">
            {isLoading ? (
              <Loader2 className="absolute left-3.5 size-4 animate-spin text-muted-foreground" />
            ) : (
              <Search className="absolute left-3.5 size-4 text-muted-foreground" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="SEARCH BY NAME, FIT, CATEGORY, OR COLOR..."
              className="h-12 w-full border border-border bg-muted/30 pl-10 pr-10 text-xs font-semibold uppercase tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
                aria-label="Clear search input"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {query.trim() === "" ? (
            <div className="py-8 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Popular Searches
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["Drop Shoulder", "Baggy Cargo", "Straight Fit", "Combo Sets", "Men", "Women"].map(
                  (term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        performSearch(term);
                      }}
                      className="border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-foreground hover:border-foreground transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {results.length} {results.length === 1 ? "Result" : "Results"} Found
                </span>
                <Link
                  href={`/shop?q=${encodeURIComponent(query)}`}
                  onClick={() => onOpenChange(false)}
                  className="text-[10px] font-bold uppercase tracking-wider text-foreground hover:underline"
                >
                  View All in Catalog &rarr;
                </Link>
              </div>
              <div className="divide-y divide-border">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="group flex items-center justify-between py-3.5 transition-colors hover:bg-muted/30 px-2"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail Placeholder or Image */}
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={56}
                          height={56}
                          className="size-14 shrink-0 object-cover border border-border bg-muted"
                          unoptimized
                        />
                      ) : (
                        <div className="flex size-14 shrink-0 items-center justify-center border border-border bg-muted/60 text-[10px] font-black text-muted-foreground">
                          C71
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                            {product.category}
                          </span>
                          {product.fit && (
                            <span className="border border-border/80 bg-background px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-foreground">
                              {product.fit}
                            </span>
                          )}
                          {!product.inStock && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-red-600">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        <h4 className="mt-0.5 text-xs font-bold uppercase tracking-wider text-foreground group-hover:underline line-clamp-1">
                          {product.name}
                        </h4>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs font-bold tabular-nums text-foreground">
                            ৳ {product.price.toLocaleString()}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-xs tabular-nums text-muted-foreground line-through">
                              ৳ {product.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-foreground">
                No Products Found For &ldquo;{query}&rdquo;
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Try searching for a different keyword such as &ldquo;tee&rdquo;, &ldquo;cargo&rdquo;, &ldquo;baggy&rdquo;, or &ldquo;men&rdquo;.
              </p>
              <div className="mt-6">
                <Link
                  href="/shop"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex h-10 items-center border border-border bg-background px-6 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors"
                >
                  Browse Entire Catalog
                </Link>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

