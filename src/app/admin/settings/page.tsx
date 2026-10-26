import { StoreSettingsEditor } from "@/components/admin/store-settings-editor";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function AdminSettingsPage() {
  await requireAdminPermission("settings.manage");
  return (
    <>
      <div className="mt-8 border-b border-border pb-6">
        <h2 className="text-xl font-black uppercase tracking-tight">STORE SETTINGS</h2>
        <p className="mt-1 text-xs text-muted-foreground">Manage public contact details and domestic delivery charges.</p>
      </div>
      <StoreSettingsEditor />
    </>
  );
}
