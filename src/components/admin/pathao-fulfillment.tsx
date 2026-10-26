"use client";

import * as React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import type { AdminOrder, AdminPathaoShipment } from "@/types/admin";

const lookupResponseSchema = z.object({
  stores: z.array(z.object({
    id: z.number().int().positive(),
    name: z.string(),
    isDefault: z.boolean(),
  })).optional(),
  cities: z.array(z.object({ id: z.number().int().positive(), name: z.string() })).optional(),
  zones: z.array(z.object({ id: z.number().int().positive(), name: z.string() })).optional(),
  areas: z.array(z.object({
    id: z.number().int().positive(),
    name: z.string(),
    homeDeliveryAvailable: z.boolean(),
    pickupAvailable: z.boolean(),
  })).optional(),
  estimate: z.object({
    price: z.number().nonnegative(),
    discount: z.number().nonnegative(),
    promoDiscount: z.number().nonnegative(),
  }).optional(),
});

const messageSchema = z.object({
  message: z.string().optional(),
  outcomeUnknown: z.boolean().optional(),
  refreshRequired: z.boolean().optional(),
});

const bookingResponseSchema = z.object({
  ok: z.literal(true),
  consignmentId: z.string().min(1),
  courierStatus: z.string().min(1),
  estimatedCourierFee: z.number().nonnegative(),
  actualCourierFee: z.number().nonnegative().nullable(),
  amountToCollect: z.number().int().nonnegative(),
});

type LookupItem = { id: number; name: string };
type OrderForBooking = Pick<
  AdminOrder,
  | "id"
  | "orderNumber"
  | "orderStatus"
  | "paymentStatus"
  | "totalBdt"
  | "subtotalBdt"
  | "deliveryFeeBdt"
  | "customerName"
  | "customerPhone"
  | "addressLine"
  | "areaLocality"
  | "cityDistrict"
  | "deliveryNote"
  | "items"
>;

class PathaoRequestError extends Error {
  constructor(
    message: string,
    readonly outcomeUnknown: boolean,
    readonly refreshRequired: boolean,
  ) {
    super(message);
    this.name = "PathaoRequestError";
  }
}

async function readResponse(response: Response) {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }
  if (!response.ok) {
    const parsed = messageSchema.safeParse(payload);
    throw new PathaoRequestError(
      parsed.success
        ? parsed.data.message ?? "Unable to complete the Pathao request."
        : "Unable to complete the Pathao request.",
      parsed.success && parsed.data.outcomeUnknown === true,
      parsed.success && parsed.data.refreshRequired === true,
    );
  }
  return payload;
}

function money(value: number) {
  return `৳${value.toLocaleString("en-BD")}`;
}

function statusLabel(status: string) {
  return status.replace(/[_.-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function PathaoFulfillment({
  order,
  initialShipment,
}: {
  order: OrderForBooking;
  initialShipment: AdminPathaoShipment | null;
}) {
  const [shipment, setShipment] = React.useState(initialShipment);
  const [stores, setStores] = React.useState<Array<LookupItem & { isDefault: boolean }>>([]);
  const [cities, setCities] = React.useState<LookupItem[]>([]);
  const [zones, setZones] = React.useState<LookupItem[]>([]);
  const [areas, setAreas] = React.useState<Array<LookupItem & { homeDeliveryAvailable: boolean }>>([]);
  const [storeId, setStoreId] = React.useState("");
  const [cityId, setCityId] = React.useState("");
  const [zoneId, setZoneId] = React.useState("");
  const [areaId, setAreaId] = React.useState("");
  const [recipientName, setRecipientName] = React.useState(order.customerName);
  const [recipientPhone, setRecipientPhone] = React.useState(order.customerPhone);
  const [recipientAddress, setRecipientAddress] = React.useState(
    [order.addressLine, order.areaLocality, order.cityDistrict].filter(Boolean).join(", "),
  );
  const [weight, setWeight] = React.useState("");
  const [specialInstruction, setSpecialInstruction] = React.useState(order.deliveryNote ?? "");
  const [estimate, setEstimate] = React.useState<number | null>(null);
  const [confirmed, setConfirmed] = React.useState(false);
  const [confirmNoConsignment, setConfirmNoConsignment] = React.useState(false);
  const [reconciliationNote, setReconciliationNote] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [now, setNow] = React.useState(0);
  const bookingInFlight = React.useRef(false);

  const quantity = order.items.reduce((total, item) => total + item.quantity, 0);
  const amountToCollect = order.paymentStatus === "pending" ? order.totalBdt : 0;
  const isEligible = order.orderStatus === "confirmed" || order.orderStatus === "processing";
  const bookingStale =
    shipment?.bookingStatus === "booking" &&
    now > 0 &&
    now - new Date(shipment.bookingStartedAt).getTime() >= 2 * 60_000;
  const requiresReconciliation =
    shipment?.bookingStatus === "unknown" || bookingStale;
  const selectedCity = cities.find((item) => String(item.id) === cityId);
  const selectedZone = zones.find((item) => String(item.id) === zoneId);
  const selectedArea = areas.find((item) => String(item.id) === areaId);
  const canSubmit =
    !busy &&
    !loading &&
    isEligible &&
    Boolean(storeId && cityId && zoneId && areaId && recipientName.trim() &&
      recipientPhone.trim() && recipientAddress.trim() && Number(weight) >= 0.5 &&
      Number(weight) <= 10 && estimate !== null && confirmed);

  React.useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const [storesResponse, citiesResponse] = await Promise.all([
          fetch("/api/admin/pathao?resource=stores", { signal: controller.signal }),
          fetch("/api/admin/pathao?resource=cities", { signal: controller.signal }),
        ]);
        const [storesPayload, citiesPayload] = await Promise.all([
          readResponse(storesResponse),
          readResponse(citiesResponse),
        ]);
        const parsedStores = lookupResponseSchema.safeParse(storesPayload);
        const parsedCities = lookupResponseSchema.safeParse(citiesPayload);
        if (!parsedStores.success || !parsedStores.data.stores || !parsedCities.success || !parsedCities.data.cities) {
          throw new Error("Pathao returned invalid store or city data.");
        }
        setStores(parsedStores.data.stores);
        setCities(parsedCities.data.cities);
        const defaultStore = parsedStores.data.stores.find((store) => store.isDefault);
        if (defaultStore) setStoreId(String(defaultStore.id));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage(error instanceof Error ? error.message : "Unable to load Pathao locations.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const timer = window.setInterval(updateNow, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const loadZones = async (nextCityId: string) => {
    setCityId(nextCityId);
    setZoneId("");
    setAreaId("");
    setZones([]);
    setAreas([]);
    setEstimate(null);
    setConfirmed(false);
    if (!nextCityId) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/pathao?resource=zones&cityId=${encodeURIComponent(nextCityId)}`);
      const payload = await readResponse(response);
      const parsed = lookupResponseSchema.safeParse(payload);
      if (!parsed.success || !parsed.data.zones) throw new Error("Pathao returned invalid zone data.");
      setZones(parsed.data.zones);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load Pathao zones.");
    } finally {
      setBusy(false);
    }
  };

  const loadAreas = async (nextZoneId: string) => {
    setZoneId(nextZoneId);
    setAreaId("");
    setAreas([]);
    setEstimate(null);
    setConfirmed(false);
    if (!nextZoneId) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/pathao?resource=areas&zoneId=${encodeURIComponent(nextZoneId)}`);
      const payload = await readResponse(response);
      const parsed = lookupResponseSchema.safeParse(payload);
      if (!parsed.success || !parsed.data.areas) throw new Error("Pathao returned invalid area data.");
      setAreas(parsed.data.areas);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load Pathao areas.");
    } finally {
      setBusy(false);
    }
  };

  const refreshEstimate = async () => {
    if (!storeId || !cityId || !zoneId || !areaId || !Number(weight)) {
      setMessage("Select a store, covered city, zone, area and parcel weight first.");
      return;
    }
    setBusy(true);
    setMessage(null);
    setEstimate(null);
    setConfirmed(false);
    try {
      const response = await fetch("/api/admin/pathao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: Number(storeId),
          cityId: Number(cityId),
          zoneId: Number(zoneId),
          areaId: Number(areaId),
          weightKg: Number(weight),
        }),
      });
      const payload = await readResponse(response);
      const parsed = lookupResponseSchema.safeParse(payload);
      if (!parsed.success || !parsed.data.estimate) throw new Error("Pathao returned an invalid price estimate.");
      setEstimate(parsed.data.estimate.price);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to estimate Pathao delivery.");
    } finally {
      setBusy(false);
    }
  };

  const book = async () => {
    if (bookingInFlight.current) return;
    bookingInFlight.current = true;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/pathao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: Number(storeId),
          cityId: Number(cityId),
          zoneId: Number(zoneId),
          areaId: Number(areaId),
          recipientName,
          recipientPhone,
          recipientAddress,
          weightKg: Number(weight),
          specialInstruction: specialInstruction.trim() || null,
        }),
      });
      const payload = await readResponse(response);
      const parsed = bookingResponseSchema.safeParse(payload);
      if (!parsed.success) throw new Error("Pathao booking response was invalid; reconcile before retrying.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Pathao booking failed. Check shipment status before retrying.");
      if (
        error instanceof PathaoRequestError &&
        (error.outcomeUnknown || error.refreshRequired)
      ) {
        window.location.reload();
      }
      setShipment((current) => {
        if (!current) return current;
        return current.bookingStatus === "booking"
          ? { ...current, bookingStatus: "unknown" }
          : current;
      });
    } finally {
      bookingInFlight.current = false;
      setBusy(false);
    }
  };

  const refreshStatus = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/pathao/refresh`, { method: "POST" });
      await readResponse(response);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to refresh the Pathao status.");
    } finally {
      setBusy(false);
    }
  };

  const reconcileAbsent = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/pathao/reconcile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmNoConsignmentFound: confirmNoConsignment,
          note: reconciliationNote,
        }),
      });
      await readResponse(response);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reconcile the Pathao attempt.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-5 border border-border p-5">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider">Pathao fulfillment</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Courier booking is manual and requires staff confirmation. Customer order details are not changed by this form.
        </p>
      </div>

      {shipment && (
        <div className="space-y-3 border-y border-border py-4 text-xs">
          <p className="font-bold uppercase">Booking: {statusLabel(shipment.bookingStatus)}</p>
          <p>Merchant reference: {shipment.merchantOrderReference}</p>
          <p>Pickup store ID: {shipment.storeId}</p>
          {shipment.consignmentId && <p>Consignment ID: <span className="font-bold">{shipment.consignmentId}</span></p>}
          {shipment.courierStatus && <p>Delivery status: {statusLabel(shipment.courierStatus)}</p>}
          {shipment.bookedAt && <p>Booked: {new Date(shipment.bookedAt).toLocaleString()}</p>}
          <p>Last synchronized: {shipment.lastSyncAt ? new Date(shipment.lastSyncAt).toLocaleString() : "Not synchronized yet"}</p>
          {shipment.estimatedCourierFee !== null && <p>Pathao estimate: {money(shipment.estimatedCourierFee)}</p>}
          {shipment.actualCourierFee !== null && <p>Courier fee returned: {money(shipment.actualCourierFee)}</p>}
          {shipment.lastErrorCategory && (
            <p role="alert" className="font-semibold text-destructive">
              {shipment.bookingStatus === "unknown" ? "Outcome unknown — reconciliation required." : `Last error: ${statusLabel(shipment.lastErrorCategory)}`}
            </p>
          )}

          {shipment.bookingStatus === "booked" && (
            <Button type="button" variant="outline" disabled={busy} onClick={() => void refreshStatus()}>
              {busy ? "Refreshing..." : "Refresh Pathao status"}
            </Button>
          )}

          {requiresReconciliation && (
            <div className="space-y-3 border border-destructive/50 p-3">
              <p className="font-bold">Reconciliation required before another booking.</p>
              <p>
                Search the Pathao Merchant Dashboard for merchant reference{" "}
                <span className="font-bold">{shipment.merchantOrderReference}</span>.
                If a consignment exists, do not retry; contact support because automatic lookup by merchant reference is not verified.
              </p>
              <label className="block">
                Reconciliation note
                <textarea
                  className="mt-2 min-h-20 w-full border border-border bg-background p-2"
                  maxLength={1000}
                  value={reconciliationNote}
                  onChange={(event) => setReconciliationNote(event.target.value)}
                  placeholder="Record where and how the merchant dashboard was checked."
                />
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={confirmNoConsignment}
                  onChange={(event) => setConfirmNoConsignment(event.target.checked)}
                />
                <span>I checked Pathao and confirm no consignment exists for this order.</span>
              </label>
              <Button
                type="button"
                variant="outline"
                disabled={busy || !confirmNoConsignment || reconciliationNote.trim().length < 10}
                onClick={() => void reconcileAbsent()}
              >
                Confirm no consignment found
              </Button>
            </div>
          )}

          {shipment.events.length > 0 && (
            <ol aria-label="Pathao shipment history" className="space-y-2">
              {shipment.events.map((event) => (
                <li key={event.id} className="border-l-2 border-border pl-3">
                  <span className="font-semibold">{statusLabel(event.courierStatus)}</span>
                  <time className="ml-2 text-muted-foreground" dateTime={event.reportedAt}>
                    {new Date(event.reportedAt).toLocaleString()}
                  </time>
                </li>
              ))}
            </ol>
          )}

          {shipment.attempts.length > 1 && (
            <details>
              <summary className="cursor-pointer font-semibold">Booking and reconciliation audit</summary>
              <ol className="mt-2 space-y-2">
                {shipment.attempts.map((attempt) => (
                  <li key={attempt.id} className="border-t border-border pt-2">
                    {statusLabel(attempt.action)}: {statusLabel(attempt.outcome)}
                    {attempt.errorCategory && ` (${statusLabel(attempt.errorCategory)})`}
                    {attempt.reconciliationNote && <p>{attempt.reconciliationNote}</p>}
                    <time className="block text-muted-foreground" dateTime={attempt.startedAt}>
                      {new Date(attempt.startedAt).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>
      )}

      {!shipment || shipment.bookingStatus === "failed" ? (
        <div className="space-y-4">
          {!isEligible && (
            <p className="text-xs text-muted-foreground">
              Confirm or process this COD order before booking a courier.
            </p>
          )}
          {loading ? (
            <p role="status" className="text-xs text-muted-foreground">Loading Pathao stores and locations...</p>
          ) : (
            <>
              <label className="block text-[10px] font-bold uppercase tracking-wider">
                Pickup store
                <select className="mt-2 h-10 w-full border border-border bg-background px-3 text-sm" value={storeId} onChange={(event) => { setStoreId(event.target.value); setEstimate(null); setConfirmed(false); }}>
                  <option value="">Select a Pathao pickup store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}{store.isDefault ? " — current default" : ""}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider">
                  City
                  <select className="mt-2 h-10 w-full border border-border bg-background px-2 text-xs" value={cityId} onChange={(event) => void loadZones(event.target.value)}>
                    <option value="">Select city</option>
                    {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                  </select>
                </label>
                <label className="block text-[10px] font-bold uppercase tracking-wider">
                  Zone
                  <select className="mt-2 h-10 w-full border border-border bg-background px-2 text-xs" value={zoneId} disabled={!cityId || busy} onChange={(event) => void loadAreas(event.target.value)}>
                    <option value="">Select zone</option>
                    {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
                  </select>
                </label>
                <label className="block text-[10px] font-bold uppercase tracking-wider">
                  Area
                  <select className="mt-2 h-10 w-full border border-border bg-background px-2 text-xs" value={areaId} disabled={!zoneId || busy} onChange={(event) => { setAreaId(event.target.value); setEstimate(null); setConfirmed(false); }}>
                    <option value="">Select area</option>
                    {areas.filter((area) => area.homeDeliveryAvailable).map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
                  </select>
                </label>
              </div>
              {areas.length > 0 && !areas.some((area) => area.homeDeliveryAvailable) && (
                <p role="alert" className="text-xs text-destructive">Pathao has no home-delivery coverage in this zone.</p>
              )}

              <label className="block text-[10px] font-bold uppercase tracking-wider">
                Customer name
                <input className="mt-2 h-10 w-full border border-border bg-background px-3 text-sm" maxLength={100} value={recipientName} onChange={(event) => setRecipientName(event.target.value)} />
              </label>
              <label className="block text-[10px] font-bold uppercase tracking-wider">
                Delivery phone
                <input className="mt-2 h-10 w-full border border-border bg-background px-3 text-sm" autoComplete="tel" maxLength={30} value={recipientPhone} onChange={(event) => setRecipientPhone(event.target.value)} />
              </label>
              <label className="block text-[10px] font-bold uppercase tracking-wider">
                Full delivery address
                <textarea className="mt-2 min-h-20 w-full border border-border bg-background p-3 text-sm" maxLength={220} value={recipientAddress} onChange={(event) => setRecipientAddress(event.target.value)} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider">
                  Parcel weight (kg)
                  <input className="mt-2 h-10 w-full border border-border bg-background px-3 text-sm" type="number" min="0.5" max="10" step="0.1" value={weight} onChange={(event) => { setWeight(event.target.value); setEstimate(null); setConfirmed(false); }} />
                </label>
                <label className="block text-[10px] font-bold uppercase tracking-wider">
                  Special delivery instructions
                  <input className="mt-2 h-10 w-full border border-border bg-background px-3 text-sm" maxLength={500} value={specialInstruction} onChange={(event) => setSpecialInstruction(event.target.value)} />
                </label>
              </div>

              <div className="space-y-1 border-y border-border py-3 text-xs">
                <p>Clothing71 order: <span className="font-bold">{order.orderNumber}</span></p>
                <p>Order subtotal: {money(order.subtotalBdt)}</p>
                <p>Customer delivery fee: {money(order.deliveryFeeBdt)} <span className="text-muted-foreground">(already included in order total)</span></p>
                <p>Order total: {money(order.totalBdt)}</p>
                <p>COD to collect: <span className="font-bold">{money(amountToCollect)}</span></p>
                <p>Package quantity: {quantity}</p>
                {selectedCity && selectedZone && selectedArea && (
                  <p>Coverage: {selectedCity.name} / {selectedZone.name} / {selectedArea.name}</p>
                )}
                {estimate !== null && <p>Pathao courier estimate: <span className="font-bold">{money(estimate)}</span> (separate from the customer delivery fee)</p>}
              </div>

              <Button type="button" variant="outline" disabled={busy || loading || !storeId || !cityId || !zoneId || !areaId || !Number(weight)} onClick={() => void refreshEstimate()}>
                {busy ? "Checking..." : "Get Pathao estimate"}
              </Button>

              {estimate !== null && (
                <label className="flex items-start gap-2 text-xs">
                  <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
                  <span>I confirm the recipient, address, Pathao locations, pickup store, parcel weight and COD collection amount shown above.</span>
                </label>
              )}
              <Button type="button" disabled={!canSubmit} onClick={() => void book()} className="h-11 w-full text-xs font-bold uppercase tracking-wider">
                {busy ? "Booking..." : "Book with Pathao"}
              </Button>
            </>
          )}
        </div>
      ) : null}

      {message && <p role="alert" className="text-xs text-destructive">{message}</p>}
    </section>
  );
}
