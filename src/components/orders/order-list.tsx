import Link from "next/link";
import type { OrderListItem } from "@/types/order";

function formatBdt(amount: number) {
  return `BDT ${amount.toLocaleString()}`;
}

export function OrderList({ orders }: { orders: OrderListItem[] }) {
  if (orders.length === 0) {
    return <div className="border border-dashed border-border p-10 text-center"><p className="text-sm font-bold uppercase tracking-wider">No Orders Yet</p><p className="mt-2 text-xs text-muted-foreground">Your confirmed purchases will appear here.</p><Link href="/shop" className="mt-6 inline-flex h-11 items-center bg-black px-6 text-xs font-bold uppercase tracking-widest text-white">Browse Shop</Link></div>;
  }

  return <div className="divide-y divide-border border-y border-border">{orders.map((order) => <Link key={order.id} href={`/account/orders/${order.id}`} className="flex flex-col gap-3 py-5 transition-opacity hover:opacity-70 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold">{order.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</p></div><div className="flex items-center gap-5 text-xs"><span className="uppercase tracking-wider text-muted-foreground">{order.orderStatus}</span><span className="font-bold uppercase tracking-wider">{order.paymentStatus}</span><span className="font-bold tabular-nums">{formatBdt(order.totalBdt)}</span></div></Link>)}</div>;
}
