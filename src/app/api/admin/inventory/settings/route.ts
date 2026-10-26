import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdminUser, hasAdminPermission } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({ lowStockThreshold: z.number().int().min(0).max(100000) });

export async function PATCH(request: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!await hasAdminPermission("inventory.manage")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Low-stock threshold is invalid." }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_inventory_threshold", {
    p_threshold: parsed.data.lowStockThreshold,
  });
  if (error) return NextResponse.json({ message: "Unable to update low-stock threshold." }, { status: 422 });
  return NextResponse.json({ ok: true });
}
