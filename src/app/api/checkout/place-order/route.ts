import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validations/checkout";
import type { OrderSummary } from "@/types/order";

const requestSchema = checkoutSchema.extend({
  lines: z.array(
    z.object({
      variantId: z.string().uuid(),
      quantity: z.number().int().min(1),
    }),
  ).min(1),
  promoCode: z.string().nullable().optional(),
});

const errorMessages: Record<string, string> = {
  CHECKOUT_CART_CHANGED: "One or more items have changed. Please review your cart.",
  CHECKOUT_INSUFFICIENT_STOCK: "One or more items no longer have enough stock.",
  CHECKOUT_INVALID_QUANTITY: "Please review the quantities in your cart.",
  CHECKOUT_INVALID_LINES: "Please review your cart and try again.",
  CHECKOUT_INVALID_ZONE: "Please select a valid delivery zone.",
  CHECKOUT_INVALID_DETAILS: "Please review your checkout details.",
};

function getSafeMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const code = Object.keys(errorMessages).find((key) => message.includes(key));
  return code ? errorMessages[code] : "We could not place your order. Please try again.";
}

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const supabase = await getSupabaseServerClient();

    let normalizedPromo: string | null = null;
    if (payload.promoCode && payload.promoCode.trim().length > 0) {
      normalizedPromo = payload.promoCode.trim().toUpperCase();
      if (normalizedPromo !== "SPD10") {
        return NextResponse.json({ ok: false, message: "Invalid promo code." }, { status: 400 });
      }
    }

    // Attempt RPC call with promo code first, fallback to standard if RPC signature does not accept p_promo_code
    let rpcResult = await supabase.rpc("place_cod_order", {
      p_customer_name: payload.fullName,
      p_customer_email: payload.email,
      p_customer_phone: payload.phone,
      p_address_line: payload.address,
      p_area_locality: payload.locality,
      p_city_district: payload.city,
      p_delivery_note: payload.note ?? null,
      p_delivery_zone: payload.deliveryZone,
      p_lines: payload.lines,
      p_promo_code: normalizedPromo,
    });

    if (rpcResult.error && (rpcResult.error.message.includes("p_promo_code") || rpcResult.error.message.includes("schema cache") || rpcResult.error.code === "PGRST202")) {
      rpcResult = await supabase.rpc("place_cod_order", {
        p_customer_name: payload.fullName,
        p_customer_email: payload.email,
        p_customer_phone: payload.phone,
        p_address_line: payload.address,
        p_area_locality: payload.locality,
        p_city_district: payload.city,
        p_delivery_note: payload.note ?? null,
        p_delivery_zone: payload.deliveryZone,
        p_lines: payload.lines,
      });
    }

    const { data, error } = rpcResult;

    if (error || !data) {
      return NextResponse.json({ ok: false, message: getSafeMessage(error) }, { status: 422 });
    }

    const orderData = data as unknown as OrderSummary;

    // Apply promo discount if active
    let discountBdt = 0;
    if (normalizedPromo === "SPD10") {
      discountBdt = Math.round(orderData.subtotalBdt * 0.10);
      const finalTotalBdt = Math.max(0, orderData.subtotalBdt - discountBdt + orderData.deliveryFeeBdt);

      orderData.promoCode = normalizedPromo;
      orderData.discountBdt = discountBdt;
      orderData.totalBdt = finalTotalBdt;

      // Persist in orders table and internal notes
      try {
        await supabase
          .from("orders")
          .update({
            promo_code: normalizedPromo,
            discount_bdt: discountBdt,
            total_bdt: finalTotalBdt,
          })
          .eq("id", orderData.id);
      } catch {
        // Table column might not exist yet if remote migration is pending
      }

      try {
        await supabase.from("order_internal_notes").insert({
          order_id: orderData.id,
          note: `Promo code applied: ${normalizedPromo} (10% discount: -BDT ${discountBdt.toLocaleString()}). Adjusted total: BDT ${finalTotalBdt.toLocaleString()}.`,
        });
      } catch {
        // Ignore internal notes failure
      }
    }

    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items = orderData.items.map((item) => {
        const snapshot = (item as { imageSnapshotUrl?: string | null }).imageSnapshotUrl;
        const publicUrl = snapshot
          ? supabase.storage.from("catalog-images").getPublicUrl(snapshot).data.publicUrl
          : null;
        return {
          ...item,
          imagePublicUrl: publicUrl,
        };
      });
    }

    return NextResponse.json({ ok: true, order: orderData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: "Please review your checkout details." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: getSafeMessage(error) }, { status: 422 });
  }
}
