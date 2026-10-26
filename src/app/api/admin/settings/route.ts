import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAdminPermission, getCurrentAdminUser } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const settingsSchema = z.object({
  business_name: z.string().trim().min(1).max(120),
  support_email: z.string().trim().email().max(254),
  support_phone: z.string().trim().min(6).max(32),
  whatsapp_phone: z.string().trim().min(6).max(32),
  facebook_url: z.string().trim().url().max(500).or(z.literal("")),
  instagram_url: z.string().trim().url().max(500).or(z.literal("")),
  tiktok_url: z.string().trim().url().max(500).or(z.literal("")),
  announcement_text: z.string().trim().max(240).nullable(),
  support_information: z.string().trim().max(2000).nullable(),
});

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!await hasAdminPermission("settings.manage")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("store_settings").select("*").eq("singleton", true).maybeSingle();
  if (error) return NextResponse.json({ message: "Unable to load store settings." }, { status: 500 });
  if (!data) return NextResponse.json({ message: "Store settings are not configured." }, { status: 503 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(request: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!await hasAdminPermission("settings.manage")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Store settings are invalid." }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("admin_update_store_settings", { p_settings: parsed.data });
  if (error) return NextResponse.json({ message: "Unable to update store settings." }, { status: 422 });
  return NextResponse.json({ ok: true });
}
