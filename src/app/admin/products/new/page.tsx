import Link from "next/link";
import { ProductEditor } from "@/components/admin/product-editor";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function NewAdminProductPage() {
  await requireAdminPermission("catalog.manage");
  return (
    <>
      <div className="mt-8 flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider">Catalog / New product</h2>
        <Link href="/admin/products" className="text-xs font-bold uppercase tracking-wider underline">Back to products</Link>
      </div>
      <ProductEditor />
    </>
  );
}
