"use client";

import { useMemo, useState } from "react";
import { InventoryEditor } from "@/components/admin/inventory-editor";
import { InventoryHistory } from "@/components/admin/inventory-history";
import type { AdminInventoryItem } from "@/types/admin";

export function InventoryManagementList({
  items,
  canManage,
  lowStockThreshold,
}: {
  items: AdminInventoryItem[];
  canManage: boolean;
  lowStockThreshold: number;
}) {
  const [search, setSearch] = useState("");
  const [threshold, setThreshold] = useState(lowStockThreshold);
  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return items;
    return items.filter((item) =>
      [item.productName, item.productSlug, item.sku, item.color, item.size]
        .some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [items, search]);

  return (
    <>
      <label className="mt-6 block max-w-xl text-xs font-bold uppercase tracking-wider">
        Search product or SKU
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Product name, SKU, color, or size"
          className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal"
        />
      </label>
      <p aria-live="polite" className="mt-4 text-xs text-muted-foreground">
        {filteredItems.length} matching variant{filteredItems.length === 1 ? "" : "s"}
      </p>
      {filteredItems.length === 0 ? (
        <div className="mt-4 border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          {items.length === 0
            ? "No product variants are available."
            : "No variants match this search."}
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto border-y border-border">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-4">Product</th>
                <th className="px-3 py-4">SKU</th>
                <th className="px-3 py-4">Variant</th>
                <th className="px-3 py-4">Current</th>
                <th className="px-3 py-4 text-right">Set stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => {
                const stockLabel = !item.isActive
                  ? "Inactive variant"
                  : item.stockQuantity === 0
                    ? "Out of stock"
                    : item.stockQuantity <= threshold
                      ? "Low stock"
                      : "In stock";
                return (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-3 py-4">
                      <span className="font-bold">{item.productName}</span>
                      <span className="mt-1 block text-muted-foreground">{stockLabel}</span>
                    </td>
                    <td className="px-3 py-4 font-mono">{item.sku}</td>
                    <td className="px-3 py-4">{item.color} / {item.size}</td>
                    <td className="px-3 py-4 font-bold tabular-nums">{item.stockQuantity}</td>
                    <td className="px-3 py-4">
                      <InventoryEditor
                        id={item.id}
                        initialStock={item.stockQuantity}
                        canManage={canManage}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <InventoryHistory
        canManage={canManage}
        onThresholdChange={setThreshold}
      />
    </>
  );
}
