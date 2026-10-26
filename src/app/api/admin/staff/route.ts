import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdminUser, hasAdminPermission } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const staffChangeSchema = z.object({
  email: z.string().trim().email().max(254),
  role: z.enum(["catalog_manager", "order_manager", "inventory_manager", "viewer"]),
  isActive: z.boolean(),
});

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!await hasAdminPermission("staff.manage")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_list_staff");
  if (error) return NextResponse.json({ message: "Unable to load staff accounts." }, { status: 500 });
  return NextResponse.json({ staff: data });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (!await hasAdminPermission("staff.manage")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = staffChangeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Provide a valid email, staff role, and active status." }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { data: candidates, error: candidateError } = await supabase.rpc("admin_find_staff_candidate", {
    p_email: parsed.data.email,
  });
  if (candidateError) return NextResponse.json({ message: "Unable to verify the existing account." }, { status: 422 });
  const candidate = candidates?.[0];
  if (!candidate) return NextResponse.json({ message: "No registered account exists for this email. Account invitations are not enabled." }, { status: 404 });
  if (candidate.user_id === admin.id) return NextResponse.json({ message: "You cannot change your own staff role." }, { status: 400 });

  const { error } = await supabase.rpc("admin_assign_staff_role", {
    p_user_id: candidate.user_id,
    p_role: parsed.data.role,
    p_is_active: parsed.data.isActive,
  });
  if (error) return NextResponse.json({ message: "Unable to update this staff role." }, { status: 422 });
  return NextResponse.json({ ok: true }, { status: 200 });
}
