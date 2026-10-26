import { getAdminProducts } from "@/lib/admin/queries";
import { ProductManagementList } from "@/components/admin/product-management-list";
import Link from "next/link";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function AdminProductsPage() {
  await requireAdminPermission("catalog.read");
  const products = await getAdminProducts();
  return (
    <main className="mt-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">PRODUCTS</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Create, edit, publish, and archive catalog products.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center justify-center bg-foreground px-4 text-xs font-bold uppercase tracking-wider text-background"
        >
          Add product
        </Link>
      </div>
      <ProductManagementList products={products} />
    </main>
  );
}
