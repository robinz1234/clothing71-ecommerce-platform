"use client";

import * as React from "react";
import Link from "next/link";
import { z } from "zod";

const responseSchema = z.object({
  customers: z.array(z.object({
    customer_email: z.string().email(),
    customer_name: z.string().nullable(),
    customer_phone: z.string().nullable(),
    is_guest: z.boolean(),
    order_count: z.number().int(),
    last_order_at: z.string(),
    order_history: z.array(z.object({
      id: z.string().uuid(),
      order_number: z.string(),
      created_at: z.string(),
      order_status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
      total_bdt: z.number().int(),
      is_guest: z.boolean(),
    })),
  })),
});

export function CustomerSearch() {
  const [search, setSearch] = React.useState("");
  const [customers, setCustomers] = React.useState<z.infer<typeof responseSchema>["customers"]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadCustomers = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/customers?search=${encodeURIComponent(searchTerm)}`);
      const body: unknown = await response.json();
      if (!response.ok) {
        const failure = z.object({ message: z.string() }).safeParse(body);
        throw new Error(failure.success ? failure.data.message : "Unable to search customers.");
      }
      const parsed = responseSchema.safeParse(body);
      if (!parsed.success) throw new Error("Customer search response is invalid.");
      setCustomers(parsed.data.customers);
      setLoaded(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to search customers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mt-8">
      <form onSubmit={(event) => { event.preventDefault(); void loadCustomers(search.trim()); }} className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row">
        <label className="sr-only" htmlFor="customer-search">Search email, name, or phone</label>
        <input id="customer-search" className="h-11 flex-1 border border-border bg-background px-3 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search email, name, or phone" maxLength={100} />
        <button type="submit" disabled={loading} className="h-11 bg-foreground px-5 text-xs font-bold uppercase tracking-wider text-background">{loading ? "Searching…" : "Search"}</button>
      </form>
      <p className="mt-4 text-xs text-muted-foreground">Search results group placed orders by account or guest email. Up to 10 recent linked orders are shown per customer.</p>
      {error && <p role="alert" className="mt-4 border border-border p-3 text-sm">{error}</p>}
      {loaded && customers.length === 0 && <p className="mt-8 border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No customers matched that search.</p>}
      {customers.length > 0 && (
        <div className="mt-6 overflow-x-auto border-y border-border">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-3 py-4">Customer</th><th className="px-3 py-4">Phone</th><th className="px-3 py-4">Orders</th><th className="px-3 py-4">Last order</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((customer) => (
                <tr
                  key={`${customer.customer_email}-${customer.is_guest}-${customer.order_history[0]?.id ?? customer.last_order_at}`}
                >
                  <td className="px-3 py-4">
                    <span className="block font-bold">{customer.customer_name || "Name not provided"}</span>
                    <a className="mt-1 block underline" href={`mailto:${customer.customer_email}`}>{customer.customer_email}</a>
                    {customer.is_guest && <span className="mt-2 inline-flex border border-border px-2 py-1 text-[9px] font-bold uppercase tracking-wider">Guest checkout</span>}
                  </td>
                  <td className="px-3 py-4">{customer.customer_phone ?? "—"}</td>
                  <td className="px-3 py-4 tabular-nums">{customer.order_count}</td>
                  <td className="px-3 py-4">
                    <span className="mb-2 block text-muted-foreground">{new Date(customer.last_order_at).toLocaleDateString()}</span>
                    <ul className="space-y-2">
                      {customer.order_history.map((order) => (
                        <li key={order.id}>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="flex flex-wrap items-center gap-x-2 underline"
                          >
                            <span>{order.order_number}</span>
                            <span className="text-muted-foreground">{order.order_status}</span>
                            <span className="text-muted-foreground">BDT {order.total_bdt.toLocaleString()}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
