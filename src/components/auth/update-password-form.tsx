"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { updatePasswordSchema, type UpdatePasswordFormData } from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setServerError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      toast.success("Password updated successfully");
      router.push("/account");
      router.refresh();
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md border border-border bg-background p-8 sm:p-10">
      <div className="text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Account Security
        </span>
        <h1 className="mt-1 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
          SET NEW PASSWORD
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Enter your new account password below.
        </p>
      </div>

      {serverError && (
        <div className="mt-6 flex items-start gap-3 border border-red-600/40 bg-red-50 p-4 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {/* New Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-bold uppercase tracking-wider text-foreground"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="AT LEAST 6 CHARACTERS"
              {...register("password")}
              className="h-12 w-full border border-border bg-muted/20 pl-4 pr-10 text-xs font-semibold tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] font-medium text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-bold uppercase tracking-wider text-foreground"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="RE-ENTER NEW PASSWORD"
            {...register("confirmPassword")}
            className="h-12 w-full border border-border bg-muted/20 px-4 text-xs font-semibold tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
          {errors.confirmPassword && (
            <p className="text-[11px] font-medium text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full text-xs font-bold uppercase tracking-[0.2em]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span>Updating Password...</span>
            </span>
          ) : (
            <span>Update Password</span>
          )}
        </Button>
      </form>
    </div>
  );
}
