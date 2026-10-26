"use client";

import * as React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const settingsSchema = z.object({
  business_name: z.string(),
  support_email: z.string().email(),
  support_phone: z.string(),
  whatsapp_phone: z.string(),
  facebook_url: z.string(),
  instagram_url: z.string(),
  tiktok_url: z.string(),
  announcement_text: z.string().nullable(),
  support_information: z.string().nullable(),
});

const ratesSchema = z.array(z.object({
  zone: z.enum(["DHAKA", "OUTSIDE_DHAKA"]),
  label: z.string(),
  charge_bdt: z.number().int(),
  delivery_estimate: z.string(),
  is_active: z.boolean(),
}));

type StoreSettings = z.infer<typeof settingsSchema>;
type ShippingRate = z.infer<typeof ratesSchema>[number];

const inputClass = "mt-1 h-10 w-full border border-border bg-background px-3 text-sm";

export function StoreSettingsEditor() {
  const [settings, setSettings] = React.useState<StoreSettings | null>(null);
  const [rates, setRates] = React.useState<ShippingRate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [savingZone, setSavingZone] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const [settingsResponse, ratesResponse] = await Promise.all([
          fetch("/api/admin/settings", { signal: controller.signal }),
          fetch("/api/admin/shipping-rates", { signal: controller.signal }),
        ]);
        const [settingsBody, ratesBody]: [unknown, unknown] = await Promise.all([
          settingsResponse.json(),
          ratesResponse.json(),
        ]);
        if (!settingsResponse.ok || !ratesResponse.ok) throw new Error("Unable to load store settings.");
        const parsedSettings = z.object({ settings: settingsSchema }).safeParse(settingsBody);
        const parsedRates = z.object({ rates: ratesSchema }).safeParse(ratesBody);
        if (!parsedSettings.success || !parsedRates.success || parsedRates.data.rates.length !== 2) {
          throw new Error("Store settings response is incomplete.");
        }
        setSettings(parsedSettings.data.settings);
        setRates(parsedRates.data.rates);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setMessage(caught instanceof Error ? caught.message : "Unable to load store settings.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const failure = z.object({ message: z.string() }).safeParse(body);
        throw new Error(failure.success ? failure.data.message : "Unable to save store settings.");
      }
      setMessage("Store settings saved.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to save store settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const saveRate = async (rate: ShippingRate) => {
    setSavingZone(rate.zone);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/shipping-rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone: rate.zone, chargeBdt: rate.charge_bdt }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const failure = z.object({ message: z.string() }).safeParse(body);
        throw new Error(failure.success ? failure.data.message : "Unable to save shipping rate.");
      }
      setMessage(`${rate.label} rate saved.`);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to save shipping rate.");
    } finally {
      setSavingZone(null);
    }
  };

  if (loading) return <p className="mt-8 text-sm text-muted-foreground">Loading store settings…</p>;
  if (!settings) return <p role="alert" className="mt-8 border border-border p-4 text-sm">{message ?? "Store settings are unavailable."}</p>;

  const updateSetting = (key: keyof StoreSettings, value: string) => {
    setSettings((current) => current ? { ...current, [key]: value || (key === "announcement_text" || key === "support_information" ? null : "") } : current);
  };

  return (
    <main className="mt-8 space-y-12">
      {message && <p role="status" className="border border-border p-3 text-sm">{message}</p>}
      <form onSubmit={(event) => void saveSettings(event)} className="space-y-6">
        <div className="border-b border-border pb-4"><h2 className="text-sm font-black uppercase tracking-wider">Store contact & display</h2><p className="mt-1 text-xs text-muted-foreground">These settings are public on the storefront.</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wider">Business name<input className={inputClass} maxLength={120} value={settings.business_name} onChange={(event) => updateSetting("business_name", event.target.value)} /></label>
          <label className="text-xs font-bold uppercase tracking-wider">Support email<input className={inputClass} type="email" maxLength={254} value={settings.support_email} onChange={(event) => updateSetting("support_email", event.target.value)} /></label>
          <label className="text-xs font-bold uppercase tracking-wider">Support phone<input className={inputClass} maxLength={32} value={settings.support_phone} onChange={(event) => updateSetting("support_phone", event.target.value)} /></label>
          <label className="text-xs font-bold uppercase tracking-wider">WhatsApp phone<input className={inputClass} maxLength={32} value={settings.whatsapp_phone} onChange={(event) => updateSetting("whatsapp_phone", event.target.value)} /></label>
          <label className="text-xs font-bold uppercase tracking-wider">Facebook URL<input className={inputClass} type="url" maxLength={500} value={settings.facebook_url} onChange={(event) => updateSetting("facebook_url", event.target.value)} /></label>
          <label className="text-xs font-bold uppercase tracking-wider">Instagram URL<input className={inputClass} type="url" maxLength={500} value={settings.instagram_url} onChange={(event) => updateSetting("instagram_url", event.target.value)} /></label>
          <label className="text-xs font-bold uppercase tracking-wider">TikTok URL<input className={inputClass} type="url" maxLength={500} value={settings.tiktok_url} onChange={(event) => updateSetting("tiktok_url", event.target.value)} /></label>
          <label className="text-xs font-bold uppercase tracking-wider">Announcement text<textarea className="mt-1 min-h-20 w-full border border-border bg-background p-3 text-sm" maxLength={240} value={settings.announcement_text ?? ""} onChange={(event) => updateSetting("announcement_text", event.target.value)} /></label>
          <label className="text-xs font-bold uppercase tracking-wider sm:col-span-2">Support information<textarea className="mt-1 min-h-24 w-full border border-border bg-background p-3 text-sm" maxLength={2000} value={settings.support_information ?? ""} onChange={(event) => updateSetting("support_information", event.target.value)} /></label>
        </div>
        <Button type="submit" disabled={savingSettings} className="h-10 px-5 text-xs font-bold uppercase tracking-wider">{savingSettings ? "Saving…" : "Save store settings"}</Button>
      </form>

      <section className="space-y-5">
        <div className="border-b border-border pb-4"><h2 className="text-sm font-black uppercase tracking-wider">Domestic delivery rates</h2><p className="mt-1 text-xs text-muted-foreground">Charges are used by shipping information, checkout validation, and order creation.</p></div>
        {rates.map((rate) => (
          <div key={rate.zone} className="grid gap-4 border border-border p-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            <div><p className="text-sm font-bold">{rate.label}</p><p className="mt-1 text-xs text-muted-foreground">Estimated delivery: {rate.delivery_estimate}</p></div>
            <label className="text-xs font-bold uppercase tracking-wider">Charge (BDT)<input className={inputClass} type="number" min={0} step={1} value={rate.charge_bdt} onChange={(event) => setRates((current) => current.map((value) => value.zone === rate.zone ? { ...value, charge_bdt: Number(event.target.value) } : value))} /></label>
            <Button type="button" variant="outline" disabled={savingZone !== null} onClick={() => void saveRate(rate)}>{savingZone === rate.zone ? "Saving…" : "Save rate"}</Button>
          </div>
        ))}
      </section>
    </main>
  );
}
