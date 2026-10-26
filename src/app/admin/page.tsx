import { getAdminDashboardStats } from "@/lib/admin/queries";
import { requireAdminPermission } from "@/lib/auth/admin";

const metrics = [
  ["Pending Orders", "pending"], ["Confirmed Orders", "confirmed"], ["Processing Orders", "processing"], ["Shipped Orders", "shipped"], ["Delivered Orders", "delivered"], ["Total Orders", "total"], ["Low-stock Variants", "lowStock"], ["Active Products", "activeProducts"],
] as const;

export default async function AdminPage() {
  await requireAdminPermission("dashboard.read");
  const stats = await getAdminDashboardStats();
  return <main className="mt-8"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, key]) => <div key={key} className="border border-border p-5"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-black tabular-nums">{stats[key] ?? "—"}</p></div>)}</div><div className="mt-10 border border-border bg-muted/20 p-6"><h2 className="text-sm font-black uppercase tracking-wider">Operations Overview</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Use the tools available to your assigned role. Order, catalog, and inventory counts are only shown to staff authorized to view them.</p></div></main>;
}
