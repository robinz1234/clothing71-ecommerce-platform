"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStoreBase } from "@/lib/stores/cart-store";
import { useIsHydrated } from "@/lib/hooks/use-hydrated-store";

export function CartDrawer() {
  const isHydrated = useIsHydrated();
  const items = useCartStoreBase((state) => state.items);
  const isOpen = useCartStoreBase((state) => state.isOpen);
  const setIsOpen = useCartStoreBase((state) => state.setIsOpen);
  const removeItem = useCartStoreBase((state) => state.removeItem);
  const incrementQuantity = useCartStoreBase((state) => state.incrementQuantity);
  const decrementQuantity = useCartStoreBase((state) => state.decrementQuantity);
  const getSubtotal = useCartStoreBase((state) => state.getSubtotal);
  const getItemCount = useCartStoreBase((state) => state.getItemCount);
  const appliedPromoCode = useCartStoreBase((state) => state.appliedPromoCode);
  const getDiscount = useCartStoreBase((state) => state.getDiscount);

  if (!isHydrated) return null;

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const discount = getDiscount();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md border-l border-border bg-background">
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border p-6 text-left">
          <div>
            <SheetTitle className="text-base font-black uppercase tracking-[0.2em] text-foreground">
              SHOPPING BAG
            </SheetTitle>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-0.5">
              {itemCount} {itemCount === 1 ? "Item" : "Items"} Selected
            </p>
          </div>
        </SheetHeader>

        {/* Content Area */}
        {items.length > 0 ? (
          <>
            {/* Items Scroll Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-border px-6">
              {items.map((item) => {
                const lineTotal = item.unitPriceBdt * item.quantity;
                return (
                  <div key={item.id} className="flex gap-4 py-5">
                    {/* Thumbnail Image */}
                    <Link
                      href={`/products/${item.productSlug}`}
                      onClick={() => setIsOpen(false)}
                      className="relative block size-20 shrink-0 overflow-hidden border border-border bg-muted/60"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[10px] font-black text-muted-foreground">
                          C71
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.productSlug}`}
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-bold uppercase tracking-wider text-foreground hover:underline line-clamp-1"
                          >
                            {item.productName}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
                            aria-label={`Remove ${item.productName} from bag`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>

                        {/* Variant Details */}
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          <span>Color: {item.color}</span>
                          <span>&middot;</span>
                          <span>Size: {item.size}</span>
                        </div>
                      </div>

                      {/* Quantity Control & Price */}
                      <div className="mt-3 flex items-center justify-between pt-1">
                        {/* Quantity selector */}
                        <div className="flex items-center border border-border">
                          <button
                            type="button"
                            onClick={() => decrementQuantity(item.id)}
                            className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold tabular-nums text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementQuantity(item.id)}
                            className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        {/* Price Display */}
                        <div className="text-right">
                          <span className="text-xs font-bold tabular-nums text-foreground">
                            ৳ {lineTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer / Subtotal Area */}
            <div className="border-t border-border bg-muted/20 p-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-foreground">
                  <span>Subtotal</span>
                  <span className="text-sm font-black tabular-nums">
                    ৳ {subtotal.toLocaleString()}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    <span>Promo ({appliedPromoCode ?? "SPD10"})</span>
                    <span className="text-xs font-bold tabular-nums">
                      - ৳ {discount.toLocaleString()}
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-foreground border-t border-border pt-1">
                    <span>Total</span>
                    <span className="text-sm font-black tabular-nums">
                      ৳ {(subtotal - discount).toLocaleString()}
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Shipping & taxes calculated at checkout
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <SheetClose asChild>
                  <Link
                    href="/cart"
                    className="flex h-12 w-full items-center justify-center bg-black text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  >
                    <span>View Bag</span>
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </SheetClose>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="h-11 w-full text-xs font-bold uppercase tracking-[0.2em]"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty Bag State */
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex size-16 items-center justify-center border border-dashed border-border bg-muted/40 text-muted-foreground">
              <ShoppingBag className="size-6" />
            </div>
            <h3 className="mt-4 font-sans text-sm font-black uppercase tracking-widest text-foreground">
              YOUR BAG IS EMPTY
            </h3>
            <p className="mt-2 max-w-xs text-xs text-muted-foreground leading-relaxed">
              Explore our latest drop-shoulder silhouettes, heavyweight cotton tees, and relaxed trousers.
            </p>
            <SheetClose asChild>
              <Link
                href="/shop"
                className="mt-6 inline-flex h-11 items-center border border-foreground bg-foreground px-6 text-xs font-bold uppercase tracking-widest text-background hover:opacity-90 transition-opacity"
              >
                Browse Catalog
              </Link>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
