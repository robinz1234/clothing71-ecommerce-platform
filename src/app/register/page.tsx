import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account | CLOTHING71 Customer Portal",
  description: "Create a Clothing71 customer account for fast checkout, order tracking, and drop updates.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-12 lg:py-20 flex items-center justify-center min-h-[60vh]">
      <RegisterForm />
    </div>
  );
}
