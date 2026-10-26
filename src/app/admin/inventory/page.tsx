import { getAdminInventory, getAdminLowStockThreshold } from "@/lib/admin/queries";
import { InventoryManagementList } from "@/components/admin/inventory-management-list";
import { requireAdminPermission } from "@/lib/auth/admin";
import { hasAdminPermission } from "@/lib/auth/admin";

export default async function AdminInventoryPage() {
  await requireAdminPermission("inventory.read");
  const [inventory, canManage, lowStockThreshold] = await Promise.all([
    getAdminInventory(),
    hasAdminPermission("inventory.manage"),
    getAdminLowStockThreshold(),
  ]);
  return (
    <main className="mt-8">
      <div className="border-b border-border pb-6">
        <h2 className="text-xl font-black uppercase tracking-tight">INVENTORY</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Review stock levels and audit every manual adjustment.
        </p>
      </div>
      <InventoryManagementList
        items={inventory}
        canManage={canManage}
        lowStockThreshold={lowStockThreshold}
      />
    </main>
  );
}
