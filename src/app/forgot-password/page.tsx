import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | CLOTHING71 Customer Portal",
  description: "Request a password reset link for your Clothing71 account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-12 lg:py-20 flex items-center justify-center min-h-[60vh]">
      <ForgotPasswordForm />
    </div>
  );
}
