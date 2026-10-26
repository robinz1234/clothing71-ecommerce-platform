"use client";

import * as React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const responseSchema = z.object({
  movements: z.array(z.object({
    id: z.number(),
    stock_before: z.number(),
    stock_after: z.number(),
    stock_delta: z.number(),
    reason: z.string(),
    created_at: z.string(),
    product_variants: z.object({
      sku: z.string(),
      color_name: z.string(),
      size: z.string(),
      products: z.object({ name: z.string() }),
    }),
  })),
  lowStockThreshold: z.number().int(),
});

export function InventoryHistory({
  canManage,
  onThresholdChange,
}: {
  canManage: boolean;
  onThresholdChange: (value: number) => void;
}) {
  const [data, setData] = React.useState<z.infer<typeof responseSchema> | null>(null);
  const [threshold, setThreshold] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch("/api/admin/inventory/history", { signal: controller.signal });
        const body: unknown = await response.json();
        if (!response.ok) throw new Error("Unable to load inventory history.");
        const parsed = responseSchema.safeParse(body);
        if (!parsed.success) throw new Error("Inventory history response is invalid.");
        setData(parsed.data);
        setThreshold(String(parsed.data.lowStockThreshold));
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setMessage(caught instanceof Error ? caught.message : "Unable to load inventory history.");
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  const saveThreshold = async () => {
    const value = Number(threshold);
    if (!Number.isInteger(value) || value < 0) {
      setMessage("Enter a non-negative whole number.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/inventory/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lowStockThreshold: value }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const failure = z.object({ message: z.string() }).safeParse(body);
        throw new Error(failure.success ? failure.data.message : "Unable to update low-stock threshold.");
      }
      setData((current) => current ? { ...current, lowStockThreshold: value } : current);
      onThresholdChange(value);
      setMessage("Low-stock threshold saved.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to update low-stock threshold.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-12 space-y-5">
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="text-sm font-black uppercase tracking-wider">Stock history</h2><p className="mt-1 text-xs text-muted-foreground">Latest 100 inventory movements.</p></div>
        <div className="flex items-end gap-2">
          {canManage && (
            <>
              <label className="text-[10px] font-bold uppercase tracking-wider">Low-stock threshold
                <input className="mt-1 h-10 w-24 border border-border bg-background px-3 text-sm" type="number" min={0} step={1} value={threshold} onChange={(event) => setThreshold(event.target.value)} />
              </label>
              <Button type="button" variant="outline" disabled={saving || data === null} onClick={() => void saveThreshold()}>{saving ? "Saving…" : "Save"}</Button>
            </>
          )}
        </div>
      </div>
      {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
      {!data ? null : data.movements.length === 0 ? (
        <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No stock changes have been recorded yet.</p>
      ) : (
        <div className="overflow-x-auto border-y border-border">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-3 py-3">Date</th><th className="px-3 py-3">Product / SKU</th><th className="px-3 py-3">Change</th><th className="px-3 py-3">Before → After</th><th className="px-3 py-3">Reason</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.movements.map((movement) => (
                <tr key={movement.id}>
                  <td className="px-3 py-3 text-muted-foreground">{new Date(movement.created_at).toLocaleString()}</td>
                  <td className="px-3 py-3"><span className="font-bold">{movement.product_variants.products.name}</span><span className="mt-1 block text-muted-foreground">{movement.product_variants.sku} / {movement.product_variants.color_name} / {movement.product_variants.size}</span></td>
                  <td className="px-3 py-3 font-bold tabular-nums">{movement.stock_delta > 0 ? "+" : ""}{movement.stock_delta}</td>
                  <td className="px-3 py-3 tabular-nums">{movement.stock_before} → {movement.stock_after}</td>
                  <td className="px-3 py-3">{movement.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
