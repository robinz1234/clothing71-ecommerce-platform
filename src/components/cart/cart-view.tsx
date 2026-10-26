"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, RefreshCw, CheckCircle2, X } from "lucide-react";
import { useCartStoreBase } from "@/lib/stores/cart-store";
import { useIsHydrated } from "@/lib/hooks/use-hydrated-store";
import { getCartLineTotals } from "@/lib/checkout/pricing";
import type { DeliveryOption } from "@/lib/checkout/delivery-options";
import { Button } from "@/components/ui/button";

export function CartView({ deliveryOptions }: { deliveryOptions: DeliveryOption[] }) {
  const isHydrated = useIsHydrated();
  const items = useCartStoreBase((state) => state.items);
  const removeItem = useCartStoreBase((state) => state.removeItem);
  const incrementQuantity = useCartStoreBase((state) => state.incrementQuantity);
  const decrementQuantity = useCartStoreBase((state) => state.decrementQuantity);
  const clearCart = useCartStoreBase((state) => state.clearCart);
  const getSubtotal = useCartStoreBase((state) => state.getSubtotal);
  const getItemCount = useCartStoreBase((state) => state.getItemCount);
  const appliedPromoCode = useCartStoreBase((state) => state.appliedPromoCode);
  const applyPromoCode = useCartStoreBase((state) => state.applyPromoCode);
  const removePromoCode = useCartStoreBase((state) => state.removePromoCode);
  const getDiscount = useCartStoreBase((state) => state.getDiscount);

  const [promoInput, setPromoInput] = React.useState("");
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = React.useState<string | null>(null);

  const handleApplyPromo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);
    if (!promoInput.trim()) {
      setPromoError("Please enter a promo code.");
      return;
    }
    const result = applyPromoCode(promoInput);
    if (result.success) {
      setPromoSuccess(result.message);
      setPromoInput("");
    } else {
      setPromoError(result.message);
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoSuccess(null);
    setPromoError(null);
  };

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-12">
        <div className="h-64 animate-pulse bg-muted/30 border border-border" />
      </div>
    );
  }

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const discount = getDiscount();
  const lineTotals = getCartLineTotals(items);
  const finalTotal = Math.max(0, subtotal - discount);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-12 lg:py-24">
        <div className="flex min-h-[400px] flex-col items-center justify-center border border-dashed border-border p-8 text-center sm:p-16">
          <div className="flex size-20 items-center justify-center border border-border bg-muted/40 text-muted-foreground">
            <ShoppingBag className="size-8" />
          </div>
          <h1 className="mt-6 font-sans text-2xl font-black uppercase tracking-widest text-foreground sm:text-3xl">
            YOUR BAG IS EMPTY
          </h1>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Browse our complete streetwear catalog of in-house manufactured drop-shoulder tees, heavy cottons, and relaxed trousers.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-12 items-center bg-black px-8 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-12 lg:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Shopping Cart
          </span>
          <h1 className="mt-1 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            YOUR BAG ({itemCount})
          </h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-red-600 transition-colors self-start sm:self-auto"
        >
          Clear Shopping Bag
        </button>
      </div>

      {/* Main Layout: 2 Columns on Desktop */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Left Column: Cart Items Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-border border-y border-border">
            {items.map((item) => {
              const lineTotal = lineTotals.get(item.id) ?? 0;
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6"
                >
                  {/* Product Info & Thumbnail */}
                  <div className="flex items-start gap-4">
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="relative block size-24 shrink-0 overflow-hidden border border-border bg-muted/60"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          sizes="96px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs font-black text-muted-foreground">
                          C71
                        </div>
                      )}
                    </Link>

                    <div className="space-y-1">
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="text-sm font-bold uppercase tracking-wider text-foreground hover:underline line-clamp-1"
                      >
                        {item.productName}
                      </Link>

                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <span>Color: <strong className="text-foreground">{item.color}</strong></span>
                        <span>&middot;</span>
                        <span>Size: <strong className="text-foreground">{item.size}</strong></span>
                      </div>

                      {item.sku && (
                        <p className="text-[10px] font-mono text-muted-foreground/80 uppercase">
                          SKU: {item.sku}
                        </p>
                      )}

                      <div className="pt-1 text-xs font-bold tabular-nums text-foreground sm:hidden">
                        Regular ৳ {item.unitPriceBdt.toLocaleString()} each
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Line Total (Desktop / Tablet) */}
                  <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    {/* Quantity Control */}
                    <div className="flex items-center border border-border bg-background">
                      <button
                        type="button"
                        onClick={() => decrementQuantity(item.id)}
                        className="flex size-9 items-center justify-center text-foreground hover:bg-muted transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-10 text-center text-xs font-bold tabular-nums text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => incrementQuantity(item.id)}
                        className="flex size-9 items-center justify-center text-foreground hover:bg-muted transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[100px]">
                      <div className="text-sm font-black tabular-nums text-foreground">
                        ৳ {lineTotal.toLocaleString()}
                      </div>
                      <div className="hidden sm:block text-[10px] tabular-nums text-muted-foreground">
                        Regular ৳ {item.unitPriceBdt.toLocaleString()} / ea
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-red-600 transition-colors p-1"
                      aria-label={`Remove ${item.productName} from bag`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-[0.15em] text-foreground hover:underline"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 border border-border bg-muted/20 p-6 sm:p-8 space-y-6">
            <h2 className="font-sans text-lg font-black uppercase tracking-wider text-foreground border-b border-border pb-4">
              ORDER SUMMARY
            </h2>

            <div className="space-y-3 text-xs uppercase tracking-wider">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="font-bold tabular-nums text-foreground">
                  ৳ {subtotal.toLocaleString()}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Promo Discount ({appliedPromoCode ?? "SPD10"})</span>
                  <span className="tabular-nums">- ৳ {discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted-foreground">
                <span>Estimated Shipping</span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  ৳{Math.min(...deliveryOptions.map((option) => option.chargeBdt)).toLocaleString()}–৳{Math.max(...deliveryOptions.map((option) => option.chargeBdt)).toLocaleString()} at checkout
                </span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span>Tax</span>
                <span className="font-medium text-muted-foreground">Included</span>
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-between text-sm font-black text-foreground">
                <span>TOTAL</span>
                <span className="text-base font-black tabular-nums">
                  ৳ {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Promo Code Input / Status */}
            <div className="border-t border-border pt-4">
              <label htmlFor="cart-promo-code" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                Promo Code
              </label>
              {appliedPromoCode ? (
                <div className="flex items-center justify-between border border-emerald-600/50 bg-emerald-500/10 p-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="size-4" />
                    <span>{appliedPromoCode} (10% OFF APPLIED)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label="Remove promo code"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      id="cart-promo-code"
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        if (promoError) setPromoError(null);
                      }}
                      placeholder="Enter promo code"
                      className="h-10 flex-1 border border-border bg-background px-3 text-xs uppercase placeholder:normal-case placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      className="h-10 px-4 text-xs font-bold uppercase tracking-wider border-foreground hover:bg-foreground hover:text-background"
                    >
                      Apply
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-[11px] text-red-600 font-medium">{promoError}</p>
                  )}
                  {promoSuccess && (
                    <p className="text-[11px] text-emerald-600 font-medium">{promoSuccess}</p>
                  )}
                </form>
              )}
            </div>

            <div className="pt-2 space-y-3">
              <Button asChild className="h-12 w-full text-xs font-bold uppercase tracking-[0.2em]">
                <Link href="/checkout">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-border pt-6 space-y-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-foreground shrink-0" />
                <span>Export Quality Guaranteed Direct From Dhaka Factory</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="size-4 text-foreground shrink-0" />
                <span>Nationwide Pathao Courier Cash on Delivery Available</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="size-4 text-foreground shrink-0" />
                <span>Hassle-Free Exchange Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
