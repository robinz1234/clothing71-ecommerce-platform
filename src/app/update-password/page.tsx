import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata: Metadata = {
  title: "Update Password | CLOTHING71 Customer Portal",
  description: "Set a new password for your Clothing71 account.",
};

export default function UpdatePasswordPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-12 lg:py-20 flex items-center justify-center min-h-[60vh]">
      <UpdatePasswordForm />
    </div>
  );
}
