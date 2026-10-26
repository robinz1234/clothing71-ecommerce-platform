import { requireAdmin } from "@/lib/auth/admin";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOut } from "@/components/admin/admin-sign-out";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-12 lg:py-12"><div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-6"><div><span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Clothing71 Operations</span><h1 className="mt-1 text-2xl font-black uppercase tracking-tight">ADMIN</h1></div><AdminSignOut /></div><AdminNav />{children}</div>;
}
