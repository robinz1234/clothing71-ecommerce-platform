import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCustomerProfile } from "@/lib/auth/profile";
import { ProfileForm } from "@/components/account/profile-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Profile | CLOTHING71 Customer Portal",
  description: "Update your Clothing71 customer profile and contact details.",
};

export default async function EditProfilePage() {
  const profile = await getCurrentCustomerProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-12 lg:py-20 flex items-center justify-center min-h-[60vh]">
      <ProfileForm profile={profile} />
    </div>
  );
}
