import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdminUser, hasAdminPermission } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().trim().max(2000).nullable(),
  sortOrder: z.number().int().min(0),
  imagePath: z.string().trim().max(500).nullable(),
  isActive: z.boolean(),
});

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!await hasAdminPermission("catalog.read")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("categories").select("id, name, slug, description, sort_order, image_path, is_active").order("sort_order");
  if (error) return NextResponse.json({ message: "Unable to load categories." }, { status: 500 });
  return NextResponse.json({ categories: data });
}

async function saveCategory(request: Request, expectedId?: string) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!await hasAdminPermission("catalog.manage")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Category details are invalid." }, { status: 400 });
  if (expectedId && parsed.data.id !== undefined && parsed.data.id !== expectedId) {
    return NextResponse.json({ message: "Category identifier does not match the request." }, { status: 400 });
  }
  if (!expectedId && (parsed.data.id !== undefined || parsed.data.slug === undefined)) {
    return NextResponse.json({ message: "A new category requires a new identifier and URL slug." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_upsert_category", {
    p_id: expectedId ?? null,
    p_name: parsed.data.name,
    p_slug: expectedId ? null : parsed.data.slug ?? null,
    p_description: parsed.data.description,
    p_sort_order: parsed.data.sortOrder,
    p_image_path: parsed.data.imagePath,
    p_is_active: parsed.data.isActive,
  });
  if (error) return NextResponse.json({ message: "Unable to save category." }, { status: 422 });
  return NextResponse.json({ id: data }, { status: expectedId ? 200 : 201 });
}

export async function POST(request: Request) {
  return saveCategory(request);
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const id = z.string().uuid().safeParse(url.searchParams.get("id"));
  if (!id.success) return NextResponse.json({ message: "A valid category identifier is required." }, { status: 400 });
  return saveCategory(request, id.data);
}
