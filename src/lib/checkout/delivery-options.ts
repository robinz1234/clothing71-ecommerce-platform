import type { DeliveryZone } from "@/types/checkout";

export type DeliveryRateZone = "DHAKA" | "OUTSIDE_DHAKA";

export type DeliveryOption = {
  id: DeliveryRateZone;
  label: string;
  chargeBdt: number;
  estimate: string;
  description: string;
};

export function getDeliveryOption(
  zone: DeliveryZone,
  options: readonly DeliveryOption[],
): DeliveryOption | undefined {
  const rateZone = zone === "SUB_AREA" ? "DHAKA" : zone;
  return options.find((option) => option.id === rateZone);
}
