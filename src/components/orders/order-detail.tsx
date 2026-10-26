import Link from "next/link";
import type { OrderSummary } from "@/types/order";

function formatBdt(amount: number) {
  return `BDT ${amount.toLocaleString()}`;
}

export function OrderDetail({ order }: { order: OrderSummary }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
      <Link href="/account/orders" className="text-xs font-bold uppercase tracking-wider hover:underline">
        &larr; Order History
      </Link>
      <div className="mt-6 border border-border p-6 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Order</span>
            <h1 className="mt-1 text-2xl font-black tracking-tight">{order.orderNumber}</h1>
          </div>
          <div className="text-right text-xs uppercase tracking-wider">
            <p className="font-bold">{order.orderStatus}</p>
            <p className="mt-1 text-muted-foreground">{order.paymentStatus} payment</p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id ?? item.sku} className="flex gap-4 py-4 text-sm">
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
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.color} / {item.size} / Qty {item.quantity}
                  </p>
                </div>
                <span className="mt-2 font-bold tabular-nums sm:mt-0">{formatBdt(item.lineTotalBdt)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatBdt(order.subtotalBdt)}</span>
          </div>
          {order.discountBdt ? (
            <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Promo Discount ({order.promoCode ?? "SPD10"})</span>
              <span>- {formatBdt(order.discountBdt)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span>{formatBdt(order.deliveryFeeBdt)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-4 text-base font-black">
            <span>Total</span>
            <span>{formatBdt(order.totalBdt)}</span>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-sm">
          <p className="text-xs font-bold uppercase tracking-wider">Delivery Address</p>
          <p className="mt-2 text-muted-foreground">
            {order.addressLine}, {order.areaLocality}, {order.cityDistrict}
          </p>
          {order.deliveryNote && <p className="mt-2 text-xs text-muted-foreground">Note: {order.deliveryNote}</p>}
        </div>
      </div>
    </div>
  );
}
