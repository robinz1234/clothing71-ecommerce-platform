"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, CheckCircle2, CircleAlert, LockKeyhole, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStoreBase } from "@/lib/stores/cart-store";
import { useIsHydrated } from "@/lib/hooks/use-hydrated-store";
import { getCartLineTotals, getCartSubtotal } from "@/lib/checkout/pricing";
import { getDeliveryOption, type DeliveryOption } from "@/lib/checkout/delivery-options";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations/checkout";
import type { CheckoutValidationResult } from "@/types/checkout";
import type { OrderSummary } from "@/types/order";

type CheckoutProfile = {
  fullName: string;
  phone: string;
  email: string;
};

type CheckoutFormProps = {
  profile?: CheckoutProfile;
  deliveryOptions: DeliveryOption[];
};

function formatBdt(amount: number) {
  return `BDT ${amount.toLocaleString()}`;
}

export function CheckoutForm({ profile, deliveryOptions }: CheckoutFormProps) {
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const items = useCartStoreBase((state) => state.items);
  const appliedPromoCode = useCartStoreBase((state) => state.appliedPromoCode);
  const applyPromoCode = useCartStoreBase((state) => state.applyPromoCode);
  const removePromoCode = useCartStoreBase((state) => state.removePromoCode);
  const getDiscount = useCartStoreBase((state) => state.getDiscount);

  const [promoInput, setPromoInput] = React.useState("");
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = React.useState<string | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [validatedResult, setValidatedResult] = React.useState<CheckoutValidationResult | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: profile?.fullName ?? "",
      phone: profile?.phone ?? "",
      email: profile?.email ?? "",
      address: "",
      locality: "",
      city: "",
      note: "",
    },
  });

  const selectedZone = useWatch({ control, name: "deliveryZone" });
  const clientSubtotal = getCartSubtotal(items);
  const clientLineTotals = getCartLineTotals(items);
  const clientDiscount = getDiscount();
  const selectedDeliveryOption = selectedZone
    ? getDeliveryOption(selectedZone, deliveryOptions)
    : undefined;
  const clientDelivery = selectedDeliveryOption?.chargeBdt ?? 0;

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
      setValidatedResult(null);
    } else {
      setPromoError(result.message);
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoSuccess(null);
    setPromoError(null);
    setValidatedResult(null);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setValidationError(null);
    setValidatedResult(null);

    let response: Response;
    let result: CheckoutValidationResult;
    try {
      response = await fetch("/api/checkout/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          deliveryZone: data.deliveryZone,
          promoCode: appliedPromoCode,
        }),
      });
      result = (await response.json()) as CheckoutValidationResult;
    } catch {
      setValidationError("We could not validate your cart. Check your connection and try again.");
      return;
    }

    if (!response.ok || !result.ok) {
      setValidationError(
        result.message ?? "One or more items have changed. Please review your cart.",
      );
      return;
    }

    setValidatedResult(result);

    setIsPlacingOrder(true);
    try {
      const orderResponse = await fetch("/api/checkout/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          lines: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
          promoCode: appliedPromoCode,
        }),
      });
      const orderResult = (await orderResponse.json()) as { ok: boolean; order?: OrderSummary; message?: string };

      if (!orderResponse.ok || !orderResult.ok || !orderResult.order) {
        setValidationError(orderResult.message ?? "We could not place your order. Please try again.");
        return;
      }

      sessionStorage.setItem("clothing71-last-order", JSON.stringify(orderResult.order));
      useCartStoreBase.getState().clearCart();
      router.push("/order-confirmation");
    } catch {
      setValidationError("We could not place your order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!isHydrated) {
    return <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-12"><div className="h-96 animate-pulse border border-border bg-muted/30" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-12 lg:py-24">
        <div className="flex min-h-[400px] flex-col items-center justify-center border border-dashed border-border p-8 text-center sm:p-16">
          <div className="flex size-20 items-center justify-center border border-border bg-muted/40 text-muted-foreground">
            <ShoppingBag className="size-8" />
          </div>
          <h1 className="mt-6 font-sans text-2xl font-black uppercase tracking-widest text-foreground sm:text-3xl">YOUR BAG IS EMPTY</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">Add an item to your bag before continuing to checkout.</p>
          <Link href="/shop" className="mt-8 inline-flex h-12 items-center bg-black px-8 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-neutral-800">
            Browse Catalog <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-12 lg:py-16">
      <div className="border-b border-border pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Secure Checkout</span>
        <h1 className="mt-1 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl">CHECKOUT</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-10 lg:col-span-7">
          <section aria-labelledby="contact-heading" className="space-y-5">
            <h2 id="contact-heading" className="border-b border-border pb-4 text-sm font-black uppercase tracking-wider">Contact Information</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Full Name" error={errors.fullName?.message} className="sm:col-span-2">
                <input {...register("fullName")} autoComplete="name" className={inputClass} />
              </Field>
              <Field label="Phone Number" error={errors.phone?.message}>
                <input {...register("phone")} type="tel" autoComplete="tel" className={inputClass} />
              </Field>
              <Field label="Email Address (Optional)" error={errors.email?.message}>
                <input {...register("email")} type="email" autoComplete="email" className={inputClass} placeholder="For order updates" />
              </Field>
            </div>
          </section>

          <section aria-labelledby="address-heading" className="space-y-5">
            <h2 id="address-heading" className="border-b border-border pb-4 text-sm font-black uppercase tracking-wider">Delivery Address</h2>
            <div className="space-y-5">
              <Field label="Full Address" error={errors.address?.message}>
                <textarea {...register("address")} rows={3} className={`${inputClass} h-auto py-3`} />
              </Field>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Area / Locality" error={errors.locality?.message}>
                  <input {...register("locality")} className={inputClass} />
                </Field>
                <Field label="City / District" error={errors.city?.message}>
                  <input {...register("city")} className={inputClass} />
                </Field>
              </div>
              <Field label="Delivery Note (Optional)" error={errors.note?.message}>
                <textarea {...register("note")} rows={2} className={`${inputClass} h-auto py-3`} />
              </Field>
            </div>
          </section>

          <section aria-labelledby="delivery-heading" className="space-y-5">
            <h2 id="delivery-heading" className="border-b border-border pb-4 text-sm font-black uppercase tracking-wider">Delivery Zone</h2>
            <div className="space-y-3" role="radiogroup" aria-label="Delivery zone">
              {deliveryOptions.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-start gap-3 border border-border p-4 transition-colors has-[:checked]:border-foreground has-[:checked]:bg-muted/30">
                  <input {...register("deliveryZone")} type="radio" value={option.id} className="mt-1 size-4 accent-black" />
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-wider">
                      <span>{option.label}</span><span>{formatBdt(option.chargeBdt)}</span>
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.deliveryZone && <p className="text-[11px] text-red-600">{errors.deliveryZone.message}</p>}
          </section>

          <section aria-labelledby="payment-heading" className="space-y-5">
            <h2 id="payment-heading" className="border-b border-border pb-4 text-sm font-black uppercase tracking-wider">Payment</h2>
            <div className="flex items-start gap-3 border border-foreground bg-muted/30 p-4">
              <Check className="mt-0.5 size-4 shrink-0" />
              <div><p className="text-xs font-bold uppercase tracking-wider">Cash on Delivery</p><p className="mt-1 text-xs text-muted-foreground">Pay the courier when your delivery arrives.</p></div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Online payment and international checkout are not available.{" "}
              <Link href="/shipping" className="font-semibold text-foreground underline underline-offset-4">
                International shipping details
              </Link>
            </p>
          </section>

          {validationError && <div role="alert" className="flex items-start gap-3 border border-red-600/40 bg-red-50 p-4 text-sm text-red-700"><CircleAlert className="mt-0.5 size-4 shrink-0" /><p>{validationError}</p></div>}
          {validatedResult?.ok && <div role="status" className="border border-foreground bg-muted/30 p-4 text-sm"><p className="font-bold uppercase tracking-wider">Order ready</p><p className="mt-1 text-muted-foreground">Your current catalog prices and stock are confirmed.</p></div>}

          <Button type="submit" disabled={isSubmitting || isPlacingOrder} className="h-12 w-full text-xs font-bold uppercase tracking-[0.2em]">
            <LockKeyhole className="mr-2 size-4" />
            {isSubmitting || isPlacingOrder ? "Placing Order..." : "Place COD Order"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">Your order will be confirmed as Cash on Delivery.</p>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 border border-border bg-muted/20 p-6 sm:p-8">
            <h2 className="border-b border-border pb-4 font-sans text-lg font-black uppercase tracking-wider">ORDER SUMMARY</h2>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-5">
                  <div className="relative size-20 shrink-0 overflow-hidden border border-border bg-muted/60">
                    {item.image ? <Image src={item.image} alt={item.productName} fill sizes="80px" className="object-cover" unoptimized /> : <span className="flex size-full items-center justify-center text-xs font-black text-muted-foreground">C71</span>}
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-bold uppercase tracking-wider text-foreground">{item.productName}</p>
                    <p className="mt-1 text-muted-foreground">{item.color} / {item.size} / Qty {item.quantity}</p>
                    <p className="mt-2 font-bold tabular-nums">{formatBdt(clientLineTotals.get(item.id) ?? 0)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Promo Code Section */}
            <div className="border-t border-border pt-4">
              <label htmlFor="checkout-promo-code" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                Promo Code
              </label>
              {appliedPromoCode ? (
                <div className="flex items-center justify-between border border-emerald-600/50 bg-emerald-500/10 p-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="size-4 shrink-0" />
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
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      id="checkout-promo-code"
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
                      type="button"
                      onClick={handleApplyPromo}
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
                </div>
              )}
            </div>

            {/* Totals Breakdown */}
            {(() => {
              const displaySubtotal = validatedResult?.totals?.subtotalBdt ?? clientSubtotal;
              const displayDiscount = validatedResult?.totals?.discountBdt !== undefined 
                ? validatedResult.totals.discountBdt 
                : clientDiscount;
              const displayDelivery = selectedZone ? (validatedResult?.totals?.deliveryBdt ?? clientDelivery) : 0;
              const displayTotal = validatedResult?.totals?.totalBdt ?? Math.max(0, clientSubtotal - clientDiscount + displayDelivery);

              return (
                <div className="space-y-3 border-t border-border pt-5 text-xs uppercase tracking-wider">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-bold text-foreground">{formatBdt(displaySubtotal)}</span>
                  </div>
                  {displayDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Promo Discount ({appliedPromoCode ?? "SPD10"})</span>
                      <span>- {formatBdt(displayDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span className="font-bold text-foreground">{selectedZone ? formatBdt(displayDelivery) : "Select zone"}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-4 text-sm font-black">
                    <span>Total</span>
                    <span>{formatBdt(displayTotal)}</span>
                  </div>
                </div>
              );
            })()}
            <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">Delivery is calculated from your selected domestic zone. The final amount is rechecked against current catalog data before an order is created.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}

const inputClass = "h-12 w-full border border-border bg-muted/20 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground focus:ring-1 focus:ring-foreground";

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return <div className={`space-y-1.5 ${className ?? ""}`}><label className="block text-xs font-bold uppercase tracking-wider text-foreground">{label}</label>{children}{error && <p className="text-[11px] text-red-600">{error}</p>}</div>;
}
