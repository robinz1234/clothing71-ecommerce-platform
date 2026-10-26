"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import type { OrderStatus, PaymentStatus } from "@/types/order";

const orderStatuses: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses: PaymentStatus[] = ["pending", "paid", "cancelled"];

export function AdminOrderControls({ orderId, orderStatus, paymentStatus }: { orderId: string; orderStatus: OrderStatus; paymentStatus: PaymentStatus }) {
  const [nextOrderStatus, setNextOrderStatus] = React.useState(orderStatus);
  const [nextPaymentStatus, setNextPaymentStatus] = React.useState(paymentStatus);
  const [message, setMessage] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderStatus: nextOrderStatus, paymentStatus: nextPaymentStatus }) });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) { setMessage(result.message ?? "Unable to update order."); return; }
      setMessage("Order updated.");
      window.location.reload();
    } catch { setMessage("Unable to update order."); } finally { setSaving(false); }
  };

  return <div className="space-y-4 border border-border bg-muted/20 p-5"><div><label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Status<select value={nextOrderStatus} onChange={(event) => setNextOrderStatus(event.target.value as OrderStatus)} className="mt-2 h-11 w-full border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none">{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label></div><div><label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">COD Payment Status<select value={nextPaymentStatus} onChange={(event) => setNextPaymentStatus(event.target.value as PaymentStatus)} className="mt-2 h-11 w-full border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none">{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label></div><Button type="button" disabled={saving} onClick={save} className="h-11 w-full text-xs font-bold uppercase tracking-widest">{saving ? "Saving..." : "Save Order Status"}</Button>{message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}</div>;
}
