"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { profileSchema, type ProfileFormData } from "@/lib/validations/auth";
import type { CustomerProfile } from "@/lib/auth/profile";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  profile: CustomerProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.full_name || "",
      phone: profile.phone || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setServerError(null);
    try {
      const supabase = getSupabaseBrowserClient();

      // Update RLS-protected profiles table
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          full_name: data.fullName,
          phone: data.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (dbError) {
        setServerError(dbError.message);
        return;
      }

      // Also sync full_name metadata in auth.users
      await supabase.auth.updateUser({
        data: { full_name: data.fullName },
      });

      toast.success("Profile updated successfully");
      router.push("/account");
      router.refresh();
    } catch {
      setServerError("An unexpected error occurred while updating your profile.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md border border-border bg-background p-8 sm:p-10">
      <div className="text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Customer Portal
        </span>
        <h1 className="mt-1 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
          EDIT PROFILE
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Update your account details and contact information.
        </p>
      </div>

      {serverError && (
        <div className="mt-6 flex items-start gap-3 border border-red-600/40 bg-red-50 p-4 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {/* Email Address (Read Only) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Email Address (Primary Identity)
          </label>
          <input
            type="email"
            disabled
            value={profile.email || ""}
            autoComplete="email"
            className="h-12 w-full border border-border bg-muted/40 px-4 text-xs font-semibold tracking-wider text-muted-foreground cursor-not-allowed"
          />
        </div>

        {/* Full Name Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="fullName"
            className="block text-xs font-bold uppercase tracking-wider text-foreground"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="FIRST & LAST NAME"
            {...register("fullName")}
            className="h-12 w-full border border-border bg-muted/20 px-4 text-xs font-semibold tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
          {errors.fullName && (
            <p className="text-[11px] font-medium text-red-600">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Phone Number Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="phone"
            className="block text-xs font-bold uppercase tracking-wider text-foreground"
          >
            Phone Number (For Delivery Confirmation)
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+880 1700-000000"
            {...register("phone")}
            className="h-12 w-full border border-border bg-muted/20 px-4 text-xs font-semibold tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
          {errors.phone && (
            <p className="text-[11px] font-medium text-red-600">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="h-12 w-full text-xs font-bold uppercase tracking-[0.2em]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Saving Changes...</span>
              </span>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>

          <Link
            href="/account"
            className="flex h-11 w-full items-center justify-center border border-border text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>

      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <Link
          href="/account"
          className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-foreground hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Account Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
