import { NextResponse } from "next/server";
import { getCurrentAdminUser, hasAdminPermission } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!await hasAdminPermission("inventory.read")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const supabase = await getSupabaseServerClient();
  const [movements, settings] = await Promise.all([
    supabase
      .from("inventory_movements")
      .select("id, stock_before, stock_after, stock_delta, reason, created_at, product_variants!inner(sku, color_name, size, products!inner(name))")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("inventory_settings").select("low_stock_threshold").eq("singleton", true).maybeSingle(),
  ]);
  if (movements.error || settings.error) {
    return NextResponse.json({ message: "Unable to load stock movement history." }, { status: 500 });
  }
  if (!settings.data) return NextResponse.json({ message: "Inventory settings are not configured." }, { status: 503 });
  return NextResponse.json({ movements: movements.data, lowStockThreshold: settings.data.low_stock_threshold });
}
