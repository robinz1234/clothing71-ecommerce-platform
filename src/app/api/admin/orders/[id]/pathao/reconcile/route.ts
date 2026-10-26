import { NextResponse } from "next/server";
import { z } from "zod";
import { getPathaoAdminContext } from "@/lib/pathao/admin";

const idSchema = z.string().uuid();
const requestSchema = z.strictObject({
  confirmNoConsignmentFound: z.literal(true),
  note: z.string().trim().min(10).max(1000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getPathaoAdminContext();
  if ("response" in context) return context.response;
  const { id } = await params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ message: "Invalid order identifier." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Confirm that the Pathao dashboard has no matching consignment and record the verification." },
      { status: 400 },
    );
  }

  const { error } = await context.supabase.rpc("admin_confirm_pathao_absent", {
    p_order_id: id,
    p_confirmation: "NO_CONSIGNMENT_FOUND",
    p_reconciliation_note: parsed.data.note,
  });
  if (error) {
    if (error.message.includes("ADMIN_REQUIRED")) {
      return NextResponse.json({ message: "You do not have permission to reconcile this booking." }, { status: 403 });
    }
    if (error.message.includes("PATHAO_BOOKING_STILL_ACTIVE")) {
      return NextResponse.json({ message: "Wait for the current booking attempt to settle before reconciliation." }, { status: 409 });
    }
    return NextResponse.json({ message: "Unable to complete Pathao reconciliation." }, { status: 422 });
  }
  return NextResponse.json({ ok: true });
}
