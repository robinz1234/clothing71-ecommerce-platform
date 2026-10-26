"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, Heart, User } from "lucide-react";
import { SearchTrigger } from "@/components/layout/search-trigger";
import { useCartStoreBase } from "@/lib/stores/cart-store";
import { useWishlistStoreBase } from "@/lib/stores/wishlist-store";
import { useIsHydrated } from "@/lib/hooks/use-hydrated-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function HeaderActions() {
  const isHydrated = useIsHydrated();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  const toggleCart = useCartStoreBase((state) => state.toggleCart);
  const getItemCount = useCartStoreBase((state) => state.getItemCount);
  const getWishlistCount = useWishlistStoreBase((state) => state.getItemCount);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const cartCount = isHydrated ? getItemCount() : 0;
  const wishlistCount = isHydrated ? getWishlistCount() : 0;
  const accountHref = isAuthenticated ? "/account" : "/login";

  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <SearchTrigger />

      <Link
        href={accountHref}
        className="relative hidden size-10 items-center justify-center text-foreground transition-opacity hover:opacity-60 sm:flex"
        aria-label={isAuthenticated ? "Customer account" : "Sign in"}
      >
        <User className="size-5" />
        {isAuthenticated && (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-emerald-600" />
        )}
      </Link>

      <Link
        href="/wishlist"
        className="relative hidden size-10 items-center justify-center text-foreground transition-opacity hover:opacity-60 sm:flex"
        aria-label={`Wishlist, ${wishlistCount} items`}
      >
        <Heart className="size-5" />
        {wishlistCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center bg-red-600 text-[9px] font-bold text-white">
            {wishlistCount}
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={toggleCart}
        className="relative flex size-10 items-center justify-center text-foreground transition-opacity hover:opacity-60"
        aria-label={`Shopping bag, ${cartCount} items`}
      >
        <ShoppingBag className="size-4 sm:size-5" />
        <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center bg-black text-[9px] font-bold text-white dark:bg-white dark:text-black">
          {cartCount}
        </span>
      </button>
    </div>
  );
}
