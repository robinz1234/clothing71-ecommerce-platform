"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${origin}/update-password`,
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      setSuccessMessage(
        `If an account exists for ${data.email}, password recovery instructions have been sent.`
      );
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md border border-border bg-background p-8 sm:p-10">
      <div className="text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Password Recovery
        </span>
        <h1 className="mt-1 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
          FORGOT PASSWORD
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Enter your account email address to receive a secure password reset link.
        </p>
      </div>

      {serverError && (
        <div className="mt-6 flex items-start gap-3 border border-red-600/40 bg-red-50 p-4 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{serverError}</p>
        </div>
      )}

      {successMessage ? (
        <div className="mt-6 space-y-4 border border-emerald-600/40 bg-emerald-50 p-6 text-center text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <div className="flex justify-center">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <p className="font-semibold leading-relaxed">{successMessage}</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 mt-2 font-bold uppercase tracking-wider text-foreground hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-foreground"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="NAME@EXAMPLE.COM"
              {...register("email")}
              className="h-12 w-full border border-border bg-muted/20 px-4 text-xs font-semibold tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
            {errors.email && (
              <p className="text-[11px] font-medium text-red-600">
                {errors.email.message}
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
                <span>Sending Request...</span>
              </span>
            ) : (
              <span>Send Reset Link</span>
            )}
          </Button>
        </form>
      )}

      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-foreground hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
