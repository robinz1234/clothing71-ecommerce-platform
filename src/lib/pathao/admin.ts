import "server-only";

import { NextResponse } from "next/server";
import { hasAdminPermission, getCurrentAdminUser } from "@/lib/auth/admin";
import { PathaoApiError } from "@/lib/pathao/client";
import { PathaoConfigurationError } from "@/lib/pathao/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getPathaoAdminContext() {
  const user = await getCurrentAdminUser();
  if (!user) return { response: NextResponse.json({ message: "Forbidden." }, { status: 403 }) };
  if (!(await hasAdminPermission("orders.manage"))) {
    return { response: NextResponse.json({ message: "You do not have permission to manage orders." }, { status: 403 }) };
  }
  return { user, supabase: await getSupabaseServerClient() };
}

export function pathaoErrorResponse(error: unknown) {
  if (error instanceof PathaoConfigurationError) {
    return NextResponse.json(
      { message: "Pathao server configuration is incomplete or invalid." },
      { status: 503 },
    );
  }
  if (error instanceof PathaoApiError) {
    const status =
      error.category === "validation" ? 422 :
      error.category === "permission" ? 502 :
      error.category === "authentication" ? 502 :
      error.category === "not_found" ? 404 :
      error.category === "configuration" ? 503 :
      error.category === "rate_limit" ? 503 :
      502;
    return NextResponse.json(
      { message: error.message, outcomeUnknown: error.outcomeUnknown },
      { status },
    );
  }
  throw error;
}

export function normalizeBangladeshPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("880")
    ? `0${digits.slice(3)}`
    : digits;
  return /^01[3-9]\d{8}$/.test(normalized) ? normalized : null;
}
