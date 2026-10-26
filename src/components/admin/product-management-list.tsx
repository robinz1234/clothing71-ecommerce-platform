"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProductFlagsEditor } from "@/components/admin/product-flags-editor";
import type { AdminProduct } from "@/types/admin";

type PublicationFilter = "all" | AdminProduct["publicationStatus"];

export function ProductManagementList({ products }: { products: AdminProduct[] }) {
  const [search, setSearch] = useState("");
  const [publicationFilter, setPublicationFilter] = useState<PublicationFilter>("all");
  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          product.name,
          product.slug,
          product.baseSku ?? "",
          product.audience,
          product.productType,
        ].some((value) => value.toLowerCase().includes(normalizedSearch));
      return (
        matchesSearch &&
        (publicationFilter === "all" || product.publicationStatus === publicationFilter)
      );
    });
  }, [products, publicationFilter, search]);

  return (
    <>
      <div className="mt-6 grid gap-3 border-b border-border pb-5 sm:grid-cols-[1fr_220px]">
        <label className="text-xs font-bold uppercase tracking-wider">
          Search products
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, slug, SKU, audience, or type"
            className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal"
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-wider">
          Publication
          <select
            value={publicationFilter}
            onChange={(event) =>
              setPublicationFilter(event.target.value as PublicationFilter)
            }
            className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm font-normal"
          >
            <option value="all">All products</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      <p aria-live="polite" className="mt-4 text-xs text-muted-foreground">
        {filteredProducts.length} matching product{filteredProducts.length === 1 ? "" : "s"}
      </p>
      {filteredProducts.length === 0 ? (
        <div className="mt-4 border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          {products.length === 0
            ? "No products are available."
            : "No products match these filters."}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border border-border p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-sm font-bold">{product.name}</h3>
                    <span className="border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {product.publicationStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {product.baseSku ?? "No base SKU"} / {product.audience} / {product.productType}
                  </p>
                  <p className="mt-3 text-sm font-bold tabular-nums">
                    BDT {product.priceBdt.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {product.variantCount} variants / {product.totalStock} total stock
                  </p>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="mt-4 inline-flex border border-border px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-muted"
                  >
                    Edit product
                  </Link>
                </div>
                <div className="w-full lg:max-w-md">
                  <ProductFlagsEditor
                    id={product.id}
                    initialFlags={{
                      isNew: product.isNew,
                      isBestSeller: product.isBestSeller,
                      isFeatured: product.isFeatured,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
