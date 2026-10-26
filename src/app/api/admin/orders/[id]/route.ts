import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  orderStatus: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "cancelled"]).optional(),
}).refine((value) => value.orderStatus || value.paymentStatus, "An order or payment status is required.");

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return NextResponse.json({ message: "Invalid order identifier." }, { status: 400 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Invalid order update." }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_update_order", {
    p_order_id: parsedId.data,
    p_order_status: parsed.data.orderStatus ?? null,
    p_payment_status: parsed.data.paymentStatus ?? null,
  });
  if (error || !data) {
    const status = error?.message.includes("ADMIN_REQUIRED") ? 403 : 422;
    return NextResponse.json({ message: "Unable to update order. Check the allowed order transition and staff permissions." }, { status });
  }
  return NextResponse.json({ ok: true, result: data });
}
