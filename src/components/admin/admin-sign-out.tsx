"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminSignOut() {
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const signOut = async () => {
    setSigningOut(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw new Error("Unable to sign out. Please try again.");
      router.replace("/login");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <Button type="button" variant="outline" disabled={signingOut} onClick={() => void signOut()} className="h-9 px-3 text-[10px] font-bold uppercase tracking-wider">
        <LogOut className="mr-2 size-3.5" />
        {signingOut ? "Signing out…" : "Sign out"}
      </Button>
    </div>
  );
}
