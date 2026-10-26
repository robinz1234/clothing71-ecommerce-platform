import { StaffManager } from "@/components/admin/staff-manager";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function AdminStaffPage() {
  await requireAdminPermission("staff.manage");
  return (
    <>
      <div className="mt-8 border-b border-border pb-6">
        <h2 className="text-xl font-black uppercase tracking-tight">STAFF ACCESS</h2>
        <p className="mt-1 text-xs text-muted-foreground">Grant the minimum role required for existing accounts.</p>
      </div>
      <StaffManager />
    </>
  );
}
