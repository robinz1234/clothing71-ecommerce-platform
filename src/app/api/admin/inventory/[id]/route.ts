import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  stockQuantity: z.number().int().min(0),
  reason: z.string().trim().min(3).max(500),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return NextResponse.json({ message: "Invalid variant identifier." }, { status: 400 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Provide a non-negative whole number and an adjustment reason." }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("admin_adjust_variant_stock", {
    p_variant_id: parsedId.data,
    p_stock_quantity: parsed.data.stockQuantity,
    p_reason: parsed.data.reason,
  });
  if (error) {
    const status = error.message.includes("ADMIN_REQUIRED") ? 403 : 422;
    return NextResponse.json({ message: "Unable to update this variant. Check the adjustment reason and staff permissions." }, { status });
  }
  return NextResponse.json({ ok: true });
}
