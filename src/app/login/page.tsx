import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In | CLOTHING71 Customer Portal",
  description: "Sign in to your Clothing71 customer account to view your profile and orders.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-12 lg:py-20 flex items-center justify-center min-h-[60vh]">
      <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse bg-muted/40 border border-border" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
