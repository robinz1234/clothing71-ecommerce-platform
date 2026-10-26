import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DeliveryOption } from "@/lib/checkout/delivery-options";

export type { DeliveryOption, DeliveryRateZone } from "@/lib/checkout/delivery-options";
export { getDeliveryOption } from "@/lib/checkout/delivery-options";

export async function getPublicDeliveryOptions(): Promise<DeliveryOption[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("shipping_rates")
    .select("zone, label, charge_bdt, delivery_estimate")
    .eq("is_active", true)
    .order("zone");
  if (error) throw new Error("Unable to load current delivery rates.");

  const rates = (data ?? []).map((rate) => {
    if (rate.zone !== "DHAKA" && rate.zone !== "OUTSIDE_DHAKA") {
      throw new Error("A delivery rate has an unsupported zone.");
    }
    return {
      id: rate.zone,
      label: rate.label,
      chargeBdt: rate.charge_bdt,
      estimate: rate.delivery_estimate,
      description: `Cash on Delivery available · Estimated delivery: ${rate.delivery_estimate}.`,
    };
  });

  if (rates.length !== 2 || new Set(rates.map((rate) => rate.id)).size !== 2) {
    throw new Error("Domestic delivery rates are incomplete.");
  }
  return rates;
}
