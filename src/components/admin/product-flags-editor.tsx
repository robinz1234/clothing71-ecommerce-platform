"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Flags = { isNew: boolean; isBestSeller: boolean; isFeatured: boolean };

export function ProductFlagsEditor({ id, initialFlags }: { id: string; initialFlags: Flags }) {
  const [flags, setFlags] = React.useState(initialFlags);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const toggle = (key: keyof Flags) => setFlags((current) => ({ ...current, [key]: !current[key] }));
  const save = async () => {
    setSaving(true); setMessage(null);
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(flags) });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) { setMessage(result.message ?? "Unable to save flags."); return; }
      setMessage("Saved.");
    } catch { setMessage("Unable to save flags."); } finally { setSaving(false); }
  };
  return <div className="space-y-3"><div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider"><label className="flex items-center gap-2"><input type="checkbox" checked={flags.isNew} onChange={() => toggle("isNew")} />New</label><label className="flex items-center gap-2"><input type="checkbox" checked={flags.isBestSeller} onChange={() => toggle("isBestSeller")} />Best Seller</label><label className="flex items-center gap-2"><input type="checkbox" checked={flags.isFeatured} onChange={() => toggle("isFeatured")} />Featured</label></div><div className="flex items-center gap-2"><Button type="button" disabled={saving} onClick={save} variant="outline" className="h-9 px-3 text-[10px] font-bold uppercase tracking-wider">{saving ? "Saving" : "Save Flags"}</Button>{message && <span role="status" className="text-[10px] text-muted-foreground">{message}</span>}</div></div>;
}
