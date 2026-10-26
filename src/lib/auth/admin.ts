import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentAdminUser() {
  const supabase = await getSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError?.name === "AuthSessionMissingError") return null;
  if (authError) throw new Error("Unable to verify the current admin session.");
  if (!authData.user) return null;

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) throw new Error("Unable to verify Clothing71 staff access.");
  if (isAdmin !== true) return null;
  return authData.user;
}

export async function requireAdmin() {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect("/login?redirectTo=%2Fadmin");
    redirect("/not-found");
  }
  return admin;
}

export async function requireAdminPermission(permission: string) {
  const admin = await requireAdmin();
  const allowed = await hasAdminPermission(permission);
  if (!allowed) redirect("/admin");
  return admin;
}

export async function hasAdminPermission(permission: string) {
  const supabase = await getSupabaseServerClient();
  const { data: isAllowed, error } = await supabase.rpc("has_admin_permission", {
    p_permission: permission,
  });
  if (error) throw new Error("Unable to verify the required admin permission.");
  return isAllowed === true;
}
