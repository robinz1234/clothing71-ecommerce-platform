import { CategoryManager } from "@/components/admin/category-manager";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function AdminCategoriesPage() {
  await requireAdminPermission("catalog.manage");
  return (
    <>
      <div className="mt-8 border-b border-border pb-6">
        <h2 className="text-xl font-black uppercase tracking-tight">CATEGORIES</h2>
        <p className="mt-1 text-xs text-muted-foreground">Manage storefront category names, ordering, and visibility.</p>
      </div>
      <CategoryManager />
    </>
  );
}
