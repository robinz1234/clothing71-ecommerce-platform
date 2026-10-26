"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function InventoryEditor({ id, initialStock, canManage = true }: { id: string; initialStock: number; canManage?: boolean }) {
  const [stock, setStock] = React.useState(String(initialStock));
  const [reason, setReason] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const save = async () => {
    const value = Number(stock);
    if (!Number.isInteger(value) || value < 0 || reason.trim().length < 3) { setMessage("Enter a non-negative quantity and a reason of at least 3 characters."); return; }
    setSaving(true); setMessage(null);
    try {
      const response = await fetch(`/api/admin/inventory/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockQuantity: value, reason }) });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) { setMessage(result.message ?? "Unable to update stock."); return; }
      setMessage("Saved.");
    } catch { setMessage("Unable to update stock."); } finally { setSaving(false); }
  };
  if (!canManage) return <span className="text-xs text-muted-foreground">Read only</span>;
  return <div className="flex flex-wrap items-center justify-end gap-2"><input aria-label="Stock quantity" type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} className="h-10 w-24 border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none" /><input aria-label="Inventory adjustment reason" type="text" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for change" className="h-10 min-w-36 border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none" /><Button type="button" disabled={saving} onClick={save} variant="outline" className="h-10 px-3 text-[10px] font-bold uppercase tracking-wider">{saving ? "Saving" : "Set Stock"}</Button>{message && <span role="status" className="text-[10px] text-muted-foreground">{message}</span>}</div>;
}
