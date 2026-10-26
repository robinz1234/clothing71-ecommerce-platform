import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types/site-settings";

export async function getPublicSiteSettings(): Promise<SiteSettings> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("business_name, support_email, support_phone, whatsapp_phone, facebook_url, instagram_url, tiktok_url, announcement_text, support_information")
    .eq("singleton", true)
    .maybeSingle();
  if (error) throw new Error("Unable to load public Clothing71 settings.");
  if (!data) throw new Error("Public Clothing71 settings are not configured.");
  return {
    businessName: data.business_name,
    supportEmail: data.support_email,
    supportPhone: data.support_phone,
    whatsappPhone: data.whatsapp_phone,
    facebookUrl: data.facebook_url,
    instagramUrl: data.instagram_url,
    tiktokUrl: data.tiktok_url,
    announcementText: data.announcement_text,
    supportInformation: data.support_information,
  };
}
