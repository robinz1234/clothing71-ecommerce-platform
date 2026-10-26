import { NextResponse } from "next/server";
import { z } from "zod";
import { getPathaoAdminContext, pathaoErrorResponse } from "@/lib/pathao/admin";
import { PathaoApiError, getPathaoClient } from "@/lib/pathao/client";
import { getPathaoConfig } from "@/lib/pathao/config";

const idSchema = z.number().int().positive().safe();
const estimateSchema = z.strictObject({
  storeId: idSchema,
  cityId: idSchema,
  zoneId: idSchema,
  areaId: idSchema,
  weightKg: z.number().finite().min(0.5).max(10),
});

async function validateCoverage(
  client: ReturnType<typeof getPathaoClient>,
  input: z.infer<typeof estimateSchema>,
) {
  const [stores, cities] = await Promise.all([
    client.getStores(),
    client.getCities(),
  ]);
  const store = stores.find((entry) => entry.id === input.storeId);
  if (!store) {
    throw new PathaoApiError("Select an active pickup store from Pathao.", "validation");
  }
  const city = cities.find((entry) => entry.id === input.cityId);
  if (!city) {
    throw new PathaoApiError("Select a valid Pathao city.", "validation");
  }
  const zones = await client.getZones(city.id);
  const zone = zones.find((entry) => entry.id === input.zoneId);
  if (!zone) {
    throw new PathaoApiError("The selected Pathao zone does not belong to this city.", "validation");
  }
  const areas = await client.getAreas(zone.id);
  const area = areas.find((entry) => entry.id === input.areaId);
  if (!area || !area.homeDeliveryAvailable) {
    throw new PathaoApiError("Pathao does not offer home delivery to the selected area.", "validation");
  }
  return { store, city, zone, area };
}

export async function GET(request: Request) {
  const context = await getPathaoAdminContext();
  if ("response" in context) return context.response;

  try {
    const client = getPathaoClient(getPathaoConfig());
    const url = new URL(request.url);
    const resource = url.searchParams.get("resource");
    if (resource === "stores") {
      const [stores, config] = await Promise.all([
        client.getStores(),
        Promise.resolve(getPathaoConfig()),
      ]);
      const defaultStoreId = Number(config.storeId);
      return NextResponse.json({
        stores: stores.map((store) => ({
          ...store,
          isDefault: store.id === defaultStoreId || store.isDefault,
        })),
      });
    }
    if (resource === "cities") {
      return NextResponse.json({ cities: await client.getCities() });
    }
    if (resource === "zones" || resource === "areas") {
      const id = Number(url.searchParams.get(resource === "zones" ? "cityId" : "zoneId"));
      if (!Number.isSafeInteger(id) || id < 1) {
        return NextResponse.json({ message: "A valid parent location is required." }, { status: 400 });
      }
      return resource === "zones"
        ? NextResponse.json({ zones: await client.getZones(id) })
        : NextResponse.json({ areas: await client.getAreas(id) });
    }
    return NextResponse.json({ message: "Unknown Pathao lookup resource." }, { status: 400 });
  } catch (error) {
    return pathaoErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const context = await getPathaoAdminContext();
  if ("response" in context) return context.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = estimateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Choose a pickup store, covered location and parcel weight." }, { status: 400 });
  }

  try {
    const client = getPathaoClient(getPathaoConfig());
    const location = await validateCoverage(client, parsed.data);
    const estimate = await client.estimatePrice({
      storeId: location.store.id,
      cityId: location.city.id,
      zoneId: location.zone.id,
      weightKg: parsed.data.weightKg,
    });
    return NextResponse.json({ estimate });
  } catch (error) {
    return pathaoErrorResponse(error);
  }
}

