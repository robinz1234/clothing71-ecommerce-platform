"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, Eye, EyeOff, Smartphone, Mail, Info } from "lucide-react";
import { toast } from "sonner";
import {
  loginSchema,
  phoneLoginSchema,
  normalizeBDPhone,
  PHONE_AUTH_ENABLED,
  type LoginFormData,
  type PhoneLoginFormData,
} from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type AuthMode = "email" | "phone";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get("redirectTo");
  const redirectTo =
    requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "/account";

  const [mode, setMode] = React.useState<AuthMode>("email");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  // Email form
  const emailForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Phone form
  const phoneForm = useForm<PhoneLoginFormData>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const onEmailSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setServerError("Invalid email or password. Please check your credentials.");
        } else {
          setServerError(error.message);
        }
        return;
      }

      toast.success("Signed in successfully");
      router.push(redirectTo);
      router.refresh();
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  const onPhoneSubmit = async (data: PhoneLoginFormData) => {
    setServerError(null);
    const normalizedPhone = normalizeBDPhone(data.phone);
    if (!normalizedPhone) {
      setServerError("Please enter a valid Bangladeshi mobile number (e.g. 01700000000).");
      return;
    }

    if (!PHONE_AUTH_ENABLED) {
      setServerError(
        "Phone authentication requires active SMS gateway configuration. Please sign in with your email address.",
      );
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        phone: normalizedPhone,
        password: data.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setServerError("Invalid phone number or password. Please check your credentials.");
        } else {
          setServerError(error.message);
        }
        return;
      }

      toast.success("Signed in successfully");
      router.push(redirectTo);
      router.refresh();
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md border border-border bg-background p-8 sm:p-10">
      <div className="text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Customer Portal
        </span>
        <h1 className="mt-1 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
          SIGN IN
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Sign in to access your orders, saved addresses, and profile.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mt-6 grid grid-cols-2 gap-2 border border-border p-1 bg-muted/20">
        <button
          type="button"
          onClick={() => {
            setMode("email");
            setServerError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            mode === "email"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Sign in with Email"
        >
          <Mail className="size-3.5" />
          <span>Email</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("phone");
            setServerError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            mode === "phone"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Sign in with Phone number"
        >
          <Smartphone className="size-3.5" />
          <span>BD Phone</span>
        </button>
      </div>

      {serverError && (
        <div className="mt-6 flex items-start gap-3 border border-red-600/40 bg-red-50 p-4 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{serverError}</p>
        </div>
      )}

      {/* Email Form */}
      {mode === "email" && (
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="mt-6 space-y-5">
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
              {...emailForm.register("email")}
              className="h-12 w-full border border-border bg-muted/20 px-4 text-xs font-semibold tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
            {emailForm.formState.errors.email && (
              <p className="text-[11px] font-medium text-red-600">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="email-password"
                className="block text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="email-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...emailForm.register("password")}
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
            {emailForm.formState.errors.password && (
              <p className="text-[11px] font-medium text-red-600">
                {emailForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={emailForm.formState.isSubmitting}
            className="h-12 w-full text-xs font-bold uppercase tracking-[0.2em]"
          >
            {emailForm.formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Signing In...</span>
              </span>
            ) : (
              <span>Sign In with Email</span>
            )}
          </Button>
        </form>
      )}

      {/* Phone Form */}
      {mode === "phone" && (
        <div className="mt-6 space-y-5">
          {!PHONE_AUTH_ENABLED && (
            <div className="flex items-start gap-3 border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200">
              <Info className="size-4 shrink-0 mt-0.5 text-amber-600" />
              <div className="space-y-1">
                <p className="font-bold uppercase tracking-wider">SMS Gateway Configuration Pending</p>
                <p className="leading-relaxed text-muted-foreground">
                  Direct mobile phone authentication requires an active SMS carrier (Twilio/Vonage) connected to Supabase.
                  Please sign in with your email address while phone login is finalized.
                </p>
                <button
                  type="button"
                  onClick={() => setMode("email")}
                  className="mt-2 text-xs font-bold underline hover:text-foreground"
                >
                  Switch to Email Sign In &rarr;
                </button>
              </div>
            </div>
          )}

          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="phone"
                className="block text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Bangladeshi Mobile Number
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center border border-r-0 border-border bg-muted/40 px-3 text-xs font-bold text-muted-foreground">
                  +88
                </span>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  {...phoneForm.register("phone")}
                  className="h-12 w-full border border-border bg-muted/20 px-4 text-xs font-semibold tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Enter your 11-digit mobile number (e.g. 01712345678)
              </p>
              {phoneForm.formState.errors.phone && (
                <p className="text-[11px] font-medium text-red-600">
                  {phoneForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="phone-password"
                className="block text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="phone-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...phoneForm.register("password")}
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
              {phoneForm.formState.errors.password && (
                <p className="text-[11px] font-medium text-red-600">
                  {phoneForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={phoneForm.formState.isSubmitting}
              className="h-12 w-full text-xs font-bold uppercase tracking-[0.2em]"
            >
              {phoneForm.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Signing In...</span>
                </span>
              ) : (
                <span>Sign In with Phone</span>
              )}
            </Button>
          </form>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <span>Don&apos;t have an account? </span>
        <Link
          href="/register"
          className="font-bold uppercase tracking-wider text-foreground hover:underline"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
