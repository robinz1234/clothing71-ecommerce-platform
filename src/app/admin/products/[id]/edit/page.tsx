import Link from "next/link";
import { ProductEditor } from "@/components/admin/product-editor";
import { requireAdminPermission } from "@/lib/auth/admin";

export default async function EditAdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPermission("catalog.manage");
  const { id } = await params;
  return (
    <>
      <div className="mt-8 flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider">Catalog / Edit product</h2>
        <Link href="/admin/products" className="text-xs font-bold uppercase tracking-wider underline">Back to products</Link>
      </div>
      <ProductEditor productId={id} />
    </>
  );
}
