import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentCustomerProfile } from "@/lib/auth/profile";
import { getCurrentCustomerOrder } from "@/lib/orders/queries";
import { OrderDetail } from "@/components/orders/order-detail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order Details | CLOTHING71" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentCustomerProfile();
  if (!profile) redirect("/login");
  const { id } = await params;
  const order = await getCurrentCustomerOrder(id);
  if (!order) notFound();
  return <OrderDetail order={order} />;
}
