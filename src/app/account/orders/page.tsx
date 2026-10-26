import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCustomerProfile } from "@/lib/auth/profile";
import { getCurrentCustomerOrders } from "@/lib/orders/queries";
import { OrderList } from "@/components/orders/order-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order History | CLOTHING71" };

export default async function OrdersPage() {
  const profile = await getCurrentCustomerProfile();
  if (!profile) redirect("/login");
  const orders = await getCurrentCustomerOrders();

  return <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-12 lg:py-16"><div className="border-b border-border pb-6"><span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Customer Dashboard</span><h1 className="mt-1 text-3xl font-black uppercase tracking-tight">ORDER HISTORY</h1></div><div className="mt-8"><OrderList orders={orders} /></div></div>;
}
