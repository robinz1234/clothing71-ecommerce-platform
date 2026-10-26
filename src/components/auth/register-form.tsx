"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Smartphone, Mail, Info } from "lucide-react";
import { toast } from "sonner";
import {
  registerSchema,
  phoneRegisterSchema,
  normalizeBDPhone,
  PHONE_AUTH_ENABLED,
  type RegisterFormData,
  type PhoneRegisterFormData,
} from "@/lib/validations/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type AuthMode = "email" | "phone";

export function RegisterForm() {
  const router = useRouter();
  const [mode, setMode] = React.useState<AuthMode>("email");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  // Email form
  const emailForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Phone form
  const phoneForm = useForm<PhoneRegisterFormData>({
    resolver: zodResolver(phoneRegisterSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onEmailSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          setServerError("An account with this email address already exists.");
        } else {
          setServerError(error.message);
        }
        return;
      }

      if (authData.session) {
        toast.success("Account created successfully!");
        router.push("/account");
        router.refresh();
      } else {
        setSuccessMessage(
          "Account created successfully! Please check your email to confirm your subscription before signing in."
        );
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  const onPhoneSubmit = async (data: PhoneRegisterFormData) => {
    setServerError(null);
    setSuccessMessage(null);

    const normalizedPhone = normalizeBDPhone(data.phone);
    if (!normalizedPhone) {
      setServerError("Please enter a valid Bangladeshi mobile number (e.g. 01700000000).");
      return;
    }

    if (!PHONE_AUTH_ENABLED) {
      setServerError(
        "Phone account registration requires active SMS carrier configuration. Please register with your email address.",
      );
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: authData, error } = await supabase.auth.signUp({
        phone: normalizedPhone,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          setServerError("An account with this phone number already exists.");
        } else {
          setServerError(error.message);
        }
        return;
      }

      if (authData.session) {
        toast.success("Account created successfully!");
        router.push("/account");
        router.refresh();
      } else {
        setSuccessMessage(
          "Account created! An SMS verification code was sent to your phone. Please verify your number to sign in."
        );
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md border border-border bg-background p-8 sm:p-10">
      <div className="text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Join Clothing71
        </span>
        <h1 className="mt-1 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
          CREATE ACCOUNT
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Register for exclusive drop updates, fast checkout, and order tracking.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mt-6 grid grid-cols-2 gap-2 border border-border p-1 bg-muted/20">
        <button
          type="button"
          onClick={() => {
            setMode("email");
            setServerError(null);
            setSuccessMessage(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            mode === "email"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Register with Email"
        >
          <Mail className="size-3.5" />
          <span>Email</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("phone");
            setServerError(null);
            setSuccessMessage(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            mode === "phone"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Register with Phone number"
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

      {successMessage ? (
        <div className="mt-6 space-y-4 border border-emerald-600/40 bg-emerald-50 p-6 text-center text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <div className="flex justify-center">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <p className="font-semibold leading-relaxed">{successMessage}</p>
          <Link
            href="/login"
            className="inline-block mt-2 font-bold uppercase tracking-wider underline text-foreground"
          >
            Go to Sign In &rarr;
          </Link>
        </div>
      ) : mode === "email" ? (
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="mt-6 space-y-5">
          {/* Full Name Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="email-fullName"
              className="block text-xs font-bold uppercase tracking-wider text-foreground"
            >
              Full Name
            </label>
            <input
              id="email-fullName"
              type="text"
              autoComplete="name"
              placeholder="FIRST & LAST NAME"
              {...emailForm.register("fullName")}
              className="h-12 w-full border border-border bg-muted/20 px-4 text-xs font-semibold tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
            {emailForm.formState.errors.fullName && (
              <p className="text-[11px] font-medium text-red-600">
                {emailForm.formState.errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-email"
              className="block text-xs font-bold uppercase tracking-wider text-foreground"
            >
              Email Address
            </label>
            <input
              id="register-email"
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

          {/* Password Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-password"
              className="block text-xs font-bold uppercase tracking-wider text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="AT LEAST 6 CHARACTERS"
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

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-confirmPassword"
              className="block text-xs font-bold uppercase tracking-wider text-foreground"
            >
              Confirm Password
            </label>
            <input
              id="register-confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="RE-ENTER PASSWORD"
              {...emailForm.register("confirmPassword")}
              className="h-12 w-full border border-border bg-muted/20 px-4 text-xs font-semibold tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
            {emailForm.formState.errors.confirmPassword && (
              <p className="text-[11px] font-medium text-red-600">
                {emailForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={emailForm.formState.isSubmitting}
            className="h-12 w-full text-xs font-bold uppercase tracking-[0.2em]"
          >
            {emailForm.formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Creating Account...</span>
              </span>
            ) : (
              <span>Create Account</span>
            )}
          </Button>
        </form>
      ) : (
        <div className="mt-6 space-y-5">
          {!PHONE_AUTH_ENABLED && (
            <div className="flex items-start gap-3 border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200">
              <Info className="size-4 shrink-0 mt-0.5 text-amber-600" />
              <div className="space-y-1">
                <p className="font-bold uppercase tracking-wider">SMS Gateway Configuration Pending</p>
                <p className="leading-relaxed text-muted-foreground">
                  Direct mobile phone registration requires an active SMS carrier (Twilio/Vonage) connected to Supabase to verify phone numbers.
                  Please register with your email address while SMS verification is enabled.
                </p>
                <button
                  type="button"
                  onClick={() => setMode("email")}
                  className="mt-2 text-xs font-bold underline hover:text-foreground"
                >
                  Switch to Email Registration &rarr;
                </button>
              </div>
            </div>
          )}

          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="phone-fullName"
                className="block text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Full Name
              </label>
              <input
                id="phone-fullName"
                type="text"
                autoComplete="name"
                placeholder="FIRST & LAST NAME"
                {...phoneForm.register("fullName")}
                className="h-12 w-full border border-border bg-muted/20 px-4 text-xs font-semibold tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
              {phoneForm.formState.errors.fullName && (
                <p className="text-[11px] font-medium text-red-600">
                  {phoneForm.formState.errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-phone"
                className="block text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Bangladeshi Mobile Number
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center border border-r-0 border-border bg-muted/40 px-3 text-xs font-bold text-muted-foreground">
                  +88
                </span>
                <input
                  id="register-phone"
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

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-phone-password"
                className="block text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="register-phone-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="AT LEAST 6 CHARACTERS"
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-phone-confirmPassword"
                className="block text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Confirm Password
              </label>
              <input
                id="register-phone-confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="RE-ENTER PASSWORD"
                {...phoneForm.register("confirmPassword")}
                className="h-12 w-full border border-border bg-muted/20 px-4 text-xs font-semibold tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
              {phoneForm.formState.errors.confirmPassword && (
                <p className="text-[11px] font-medium text-red-600">
                  {phoneForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={phoneForm.formState.isSubmitting}
              className="h-12 w-full text-xs font-bold uppercase tracking-[0.2em]"
            >
              {phoneForm.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Creating Account...</span>
                </span>
              ) : (
                <span>Register with Phone</span>
              )}
            </Button>
          </form>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <span>Already have an account? </span>
        <Link
          href="/login"
          className="font-bold uppercase tracking-wider text-foreground hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
