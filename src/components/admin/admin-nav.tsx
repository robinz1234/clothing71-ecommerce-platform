import Link from "next/link";
import { hasAdminPermission } from "@/lib/auth/admin";

export async function AdminNav() {
  const [canReadOrders, canReadInventory, canReadCatalog, canManageCatalog, canReadCustomers, canManageSettings, canManageStaff, canReadActivity] = await Promise.all([
    hasAdminPermission("orders.read"),
    hasAdminPermission("inventory.read"),
    hasAdminPermission("catalog.read"),
    hasAdminPermission("catalog.manage"),
    hasAdminPermission("customers.read"),
    hasAdminPermission("settings.manage"),
    hasAdminPermission("staff.manage"),
    hasAdminPermission("activity.read"),
  ]);
  return <nav aria-label="Admin navigation" className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border pb-5 text-xs font-bold uppercase tracking-wider"><Link href="/admin" className="hover:underline">Dashboard</Link>{canReadOrders && <Link href="/admin/orders" className="hover:underline">Orders</Link>}{canReadCustomers && <Link href="/admin/customers" className="hover:underline">Customers</Link>}{canReadInventory && <Link href="/admin/inventory" className="hover:underline">Inventory</Link>}{canReadCatalog && <Link href="/admin/products" className="hover:underline">Products</Link>}{canManageCatalog && <Link href="/admin/categories" className="hover:underline">Categories</Link>}{canManageSettings && <Link href="/admin/settings" className="hover:underline">Settings</Link>}{canManageStaff && <Link href="/admin/staff" className="hover:underline">Staff</Link>}{canReadActivity && <Link href="/admin/activity" className="hover:underline">Activity</Link>}<Link href="/" className="ml-auto text-muted-foreground hover:text-foreground hover:underline">Storefront</Link></nav>;
}
