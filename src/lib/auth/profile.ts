import { getSupabaseServerClient } from "@/lib/supabase/server";

export type CustomerProfile = {
  id: string;
  email?: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export async function getCurrentCustomerProfile(): Promise<CustomerProfile | null> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return null;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[Profile] Error fetching profile:", error.message);
    }

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || null,
      phone: profile?.phone || null,
      created_at: profile?.created_at || user.created_at,
      updated_at: profile?.updated_at || user.updated_at || user.created_at,
    };
  } catch (err) {
    console.error("[Profile] Failed to fetch current profile:", err);
    return null;
  }
}
