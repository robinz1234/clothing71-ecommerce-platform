import { requireAdminPermission } from "@/lib/auth/admin";
import { redirect } from "next/navigation";

export default async function AdminShippingSettingsPage() {
  await requireAdminPermission("settings.manage");
  redirect("/admin/settings");
}
