"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Package, Truck } from "lucide-react";
import type { OrderSummary } from "@/types/order";

function formatBdt(amount: number) {
  return `BDT ${amount.toLocaleString()}`;
}

export function OrderConfirmation() {
  const [order, setOrder] = React.useState<OrderSummary | null>(null);

  React.useEffect(() => {
    const storedOrder = sessionStorage.getItem("clothing71-last-order");
    if (!storedOrder) return;
    const timer = window.setTimeout(() => {
      try {
        setOrder(JSON.parse(storedOrder) as OrderSummary);
      } catch {
        sessionStorage.removeItem("clothing71-last-order");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!order) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 text-center sm:px-6 lg:px-12 lg:py-24">
        <h1 className="font-sans text-2xl font-black uppercase tracking-tight">Confirmation unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">This confirmation is no longer available in this browser session.</p>
        <Link href="/shop" className="mt-8 inline-flex h-12 items-center bg-black px-8 text-xs font-bold uppercase tracking-[0.2em] text-white">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-20">
      <div className="border border-border bg-background p-6 sm:p-10">
        <div className="flex size-14 items-center justify-center bg-black text-white"><Check className="size-7" /></div>
        <span className="mt-8 block text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Order Received</span>
        <h1 className="mt-1 font-sans text-3xl font-black uppercase tracking-tight">THANK YOU, {order.customerName}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Your Cash on Delivery order has been placed and is awaiting confirmation.</p>

        <div className="mt-8 grid gap-4 border-y border-border py-6 text-sm sm:grid-cols-2">
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Number</p><p className="mt-1 font-bold">{order.orderNumber}</p></div>
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment</p><p className="mt-1 font-bold uppercase">Cash on Delivery</p></div>
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivery</p><p className="mt-1">{order.addressLine}, {order.areaLocality}, {order.cityDistrict}</p></div>
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</p><p className="mt-1 font-bold uppercase">{order.orderStatus}</p></div>
        </div>

        <div className="mt-8 divide-y divide-border">
          {order.items.map((item) => (
            <div key={`${item.variantId ?? item.sku}-${item.size}`} className="flex gap-4 py-4 text-sm">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden border border-border bg-muted/40">
                {item.imagePublicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imagePublicUrl}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground text-center px-1">
                    No image
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                <div>
                  <p className="font-bold">{item.productName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.color} / {item.size} / Qty {item.quantity}</p>
                </div>
                <span className="mt-2 font-bold tabular-nums sm:mt-0">{formatBdt(item.lineTotalBdt)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBdt(order.subtotalBdt)}</span></div>
          {order.discountBdt ? (
            <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Promo Discount ({order.promoCode ?? "SPD10"})</span>
              <span>- {formatBdt(order.discountBdt)}</span>
            </div>
          ) : null}
          <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatBdt(order.deliveryFeeBdt)}</span></div>
          <div className="flex justify-between border-t border-border pt-4 text-base font-black"><span>Total</span><span>{formatBdt(order.totalBdt)}</span></div>
        </div>

        <div className="mt-8 grid gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:grid-cols-2"><div className="flex gap-2"><Truck className="size-4 shrink-0 text-foreground" /><span>Delivery through Pathao Courier.</span></div><div className="flex gap-2"><Package className="size-4 shrink-0 text-foreground" /><span>Keep your order number for reference.</span></div></div>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/shop" className="inline-flex h-11 items-center bg-black px-6 text-xs font-bold uppercase tracking-widest text-white">Continue Shopping</Link><Link href="/account/orders" className="inline-flex h-11 items-center border border-foreground px-6 text-xs font-bold uppercase tracking-widest">View Orders</Link></div>
      </div>
    </div>
  );
}
