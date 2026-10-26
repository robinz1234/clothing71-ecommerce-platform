import { NextResponse } from "next/server";
import { getCurrentAdminUser, hasAdminPermission } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!await hasAdminPermission("customers.read")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const search = new URL(request.url).searchParams.get("search")?.trim().slice(0, 100) ?? "";
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_search_customers", { p_search: search });
  if (error) return NextResponse.json({ message: "Unable to load customer orders." }, { status: 500 });
  return NextResponse.json({ customers: data });
}
