import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCustomerProfile } from "@/lib/auth/profile";
import { getCurrentCustomerOrders } from "@/lib/orders/queries";
import { AccountDashboard } from "@/components/account/account-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account | CLOTHING71 Customer Portal",
  description: "View your Clothing71 customer profile, saved wishlist, and order history.",
};

export default async function AccountPage() {
  const profile = await getCurrentCustomerProfile();

  if (!profile) {
    redirect("/login");
  }

  const orders = await getCurrentCustomerOrders();

  return <AccountDashboard profile={profile} orders={orders} />;
}
