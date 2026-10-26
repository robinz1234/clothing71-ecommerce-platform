import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAdminPermission, getCurrentAdminUser } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  zone: z.enum(["DHAKA", "OUTSIDE_DHAKA"]),
  chargeBdt: z.number().int().min(0).max(100000),
});

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!await hasAdminPermission("settings.manage")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("shipping_rates").select("zone, label, charge_bdt, delivery_estimate, is_active, updated_at").order("zone");
  if (error) return NextResponse.json({ message: "Unable to load shipping rates." }, { status: 500 });
  return NextResponse.json({ rates: data });
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
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Shipping rate is invalid." }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("admin_update_shipping_rate", {
    p_zone: parsed.data.zone,
    p_charge_bdt: parsed.data.chargeBdt,
  });
  if (error) return NextResponse.json({ message: "Unable to update the shipping rate." }, { status: 422 });
  return NextResponse.json({ ok: true });
}
