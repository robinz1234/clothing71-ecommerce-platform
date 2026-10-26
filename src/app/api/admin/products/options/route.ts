import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const supabase = await getSupabaseServerClient();
  const [categoriesResult, collectionsResult] = await Promise.all([
    supabase.from("categories").select("id, name, slug, is_active").order("sort_order"),
    supabase.from("collections").select("id, name, slug, is_active").order("name"),
  ]);
  if (categoriesResult.error || collectionsResult.error) {
    return NextResponse.json({ message: "Unable to load catalog options." }, { status: 500 });
  }
  return NextResponse.json({ categories: categoriesResult.data, collections: collectionsResult.data });
}
