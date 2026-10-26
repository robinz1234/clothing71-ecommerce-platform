import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({ note: z.string().trim().min(1).max(2000) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
  if (!parsed.success) return NextResponse.json({ message: "Notes must contain between 1 and 2,000 characters." }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_add_order_note", {
    p_order_id: parsedId.data,
    p_note: parsed.data.note,
  });
  if (error) {
    const status = error.message.includes("ADMIN_REQUIRED") ? 403 : 422;
    return NextResponse.json({ message: "Unable to add the internal note." }, { status });
  }
  return NextResponse.json({ id: data }, { status: 201 });
}
