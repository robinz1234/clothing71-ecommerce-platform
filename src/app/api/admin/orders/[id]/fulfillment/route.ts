import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  courier: z.enum(["Pathao", "Steadfast", "Other"]).nullable(),
  bookingStatus: z.enum(["not_booked", "booked", "failed", "cancelled"]),
  trackingNumber: z.string().trim().max(120).nullable(),
  dispatched: z.boolean(),
  note: z.string().trim().max(2000).optional(),
});

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
  if (!parsed.success) return NextResponse.json({ message: "Invalid fulfillment details." }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("admin_update_order_fulfillment", {
    p_order_id: parsedId.data,
    p_courier: parsed.data.courier,
    p_booking_status: parsed.data.bookingStatus,
    p_tracking_number: parsed.data.trackingNumber,
    p_dispatched: parsed.data.dispatched,
    p_note: parsed.data.note ?? null,
  });
  if (error) {
    const status = error.message.includes("ADMIN_REQUIRED") ? 403 : 422;
    return NextResponse.json({ message: "Unable to save fulfillment details. Check staff permissions and order status." }, { status });
  }
  return NextResponse.json({ ok: true });
}
