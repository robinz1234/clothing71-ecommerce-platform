"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Heart, Package, LogOut, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { CustomerProfile } from "@/lib/auth/profile";
import type { OrderListItem } from "@/types/order";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface AccountDashboardProps {
  profile: CustomerProfile;
  orders: OrderListItem[];
}

export function AccountDashboard({ profile, orders }: AccountDashboardProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  const displayName = profile.full_name || profile.email || "Valued Customer";
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-12 lg:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Customer Dashboard
          </span>
          <h1 className="mt-1 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            MY ACCOUNT
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Welcome back, <span className="font-bold text-foreground">{displayName}</span> &middot; Member since {memberSince}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isSigningOut}
          onClick={handleSignOut}
          className="h-10 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-red-600 transition-colors self-start sm:self-auto"
        >
          <LogOut className="mr-2 size-3.5" />
          <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
        </Button>
      </div>

      {/* Grid Overview */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Profile */}
        <div className="flex flex-col justify-between border border-border bg-background p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex size-10 items-center justify-center border border-border bg-muted/30">
              <User className="size-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                PERSONAL PROFILE
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {profile.full_name || "Name not set"}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile.email}
              </p>
              {profile.phone && (
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  {profile.phone}
                </p>
              )}
            </div>
          </div>

          <Link
            href="/account/profile"
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground hover:underline pt-2"
          >
            <span>Edit Profile</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Card 2: Saved Favorites */}
        <div className="flex flex-col justify-between border border-border bg-background p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex size-10 items-center justify-center border border-border bg-muted/30">
              <Heart className="size-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                SAVED WISHLIST
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                View your saved streetwear pieces and drop favorites.
              </p>
            </div>
          </div>

          <Link
            href="/wishlist"
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground hover:underline pt-2"
          >
            <span>View Wishlist</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Card 3: Account Verification Badge */}
        <div className="flex flex-col justify-between border border-border bg-muted/20 p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex size-10 items-center justify-center border border-border bg-background">
              <ShieldCheck className="size-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                AUTHENTICATED SESSION
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Secured by Supabase Auth with encrypted sessions and Row Level Security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="mt-12 border border-border bg-background p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Package className="size-5 text-foreground" />
            <h2 className="font-sans text-lg font-black uppercase tracking-wider text-foreground">
              ORDER HISTORY
            </h2>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-foreground">No Orders Yet</p>
            <p className="mt-2 text-xs text-muted-foreground max-w-sm mx-auto">Your purchase history will appear here once you place an order.</p>
            <Link href="/shop" className="mt-6 inline-flex h-11 items-center border border-foreground bg-foreground px-6 text-xs font-bold uppercase tracking-widest text-background hover:opacity-90 transition-opacity">Browse Shop Catalog</Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.slice(0, 3).map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="flex flex-col gap-2 py-4 transition-opacity hover:opacity-70 sm:flex-row sm:items-center sm:justify-between">
                <span><span className="block text-sm font-bold">{order.orderNumber}</span><span className="mt-1 block text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</span></span>
                <span className="flex items-center gap-4 text-xs uppercase tracking-wider"><span className="text-muted-foreground">{order.orderStatus}</span><span className="font-bold tabular-nums">BDT {order.totalBdt.toLocaleString()}</span></span>
              </Link>
            ))}
            <Link href="/account/orders" className="inline-flex pt-5 text-xs font-bold uppercase tracking-wider hover:underline">View all orders <ArrowRight className="ml-1 size-3.5" /></Link>
          </div>
        )}
      </div>
    </div>
  );
}
