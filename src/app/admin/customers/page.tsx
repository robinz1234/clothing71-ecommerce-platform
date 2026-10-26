import { CustomerSearch } from "@/components/admin/customer-search";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function AdminCustomersPage() {
  await requireAdminPermission("customers.read");
  return (
    <>
      <div className="mt-8 border-b border-border pb-6">
        <h2 className="text-xl font-black uppercase tracking-tight">CUSTOMERS</h2>
        <p className="mt-1 text-xs text-muted-foreground">Find customers from their order history. No customer records are modified here.</p>
      </div>
      <CustomerSearch />
    </>
  );
}
