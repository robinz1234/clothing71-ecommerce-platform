"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type FulfillmentStatus = "not_booked" | "booked" | "failed" | "cancelled";
type Courier = "Pathao" | "Steadfast" | "Other";

export function OrderFulfillmentEditor({
  orderId,
  initialCourier,
  initialBookingStatus,
  initialTrackingNumber,
  initialDispatched,
}: {
  orderId: string;
  initialCourier: string | null;
  initialBookingStatus: FulfillmentStatus;
  initialTrackingNumber: string | null;
  initialDispatched: boolean;
}) {
  const [courier, setCourier] = React.useState<Courier | "">(initialCourier === "Pathao" || initialCourier === "Steadfast" || initialCourier === "Other" ? initialCourier : "");
  const [bookingStatus, setBookingStatus] = React.useState<FulfillmentStatus>(initialBookingStatus);
  const [trackingNumber, setTrackingNumber] = React.useState(initialTrackingNumber ?? "");
  const [dispatched, setDispatched] = React.useState(initialDispatched);
  const [note, setNote] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/fulfillment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courier: courier || null,
          bookingStatus,
          trackingNumber: trackingNumber || null,
          dispatched,
          note: note.trim() || undefined,
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(result.message ?? "Unable to save fulfillment details.");
        return;
      }
      setNote("");
      setMessage("Fulfillment saved.");
      window.location.reload();
    } catch {
      setMessage("Unable to save fulfillment details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4 border border-border p-5">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider">Courier & fulfillment</h3>
        <p className="mt-1 text-xs text-muted-foreground">Use this for consignments booked directly in the Pathao or Steadfast Merchant Panel. Enter the consignment ID here, mark dispatch, and record delivery progress with the order status controls. API-created Pathao shipments are tracked in the Pathao panel below.</p>
      </div>
      <label className="block text-[10px] font-bold uppercase tracking-wider">Courier
        <select className="mt-2 h-10 w-full border border-border bg-background px-3 text-sm" value={courier} onChange={(event) => setCourier(event.target.value as Courier | "")}>
          <option value="">Not assigned</option>
          <option value="Pathao">Pathao</option>
          <option value="Steadfast">Steadfast</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <label className="block text-[10px] font-bold uppercase tracking-wider">Booking status
        <select className="mt-2 h-10 w-full border border-border bg-background px-3 text-sm" value={bookingStatus} onChange={(event) => setBookingStatus(event.target.value as FulfillmentStatus)}>
          <option value="not_booked">Not booked</option>
          <option value="booked">Booked</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <label className="block text-[10px] font-bold uppercase tracking-wider">Tracking number
        <input className="mt-2 h-10 w-full border border-border bg-background px-3 text-sm" maxLength={120} value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} />
      </label>
      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
        <input type="checkbox" checked={dispatched} disabled={initialDispatched} onChange={(event) => setDispatched(event.target.checked)} />
        {initialDispatched ? "Dispatched (locked)" : "Order dispatched"}
      </label>
      <label className="block text-[10px] font-bold uppercase tracking-wider">Internal note (optional)
        <textarea className="mt-2 min-h-20 w-full border border-border bg-background p-3 text-sm" maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
      <Button type="button" disabled={saving} onClick={() => void save()} className="h-10 w-full text-xs font-bold uppercase tracking-wider">
        {saving ? "Saving…" : "Save fulfillment"}
      </Button>
      {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
    </section>
  );
}
