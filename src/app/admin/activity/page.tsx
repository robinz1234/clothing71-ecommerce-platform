import { requireAdminPermission } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminActivityPage() {
  await requireAdminPermission("activity.read");
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("admin_activity_log")
    .select("id, actor_user_id, action, entity_type, entity_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Unable to load the admin activity log.");

  return (
    <main className="mt-8">
      <div className="border-b border-border pb-6">
        <h2 className="text-xl font-black uppercase tracking-tight">ADMIN ACTIVITY</h2>
        <p className="mt-1 text-xs text-muted-foreground">Latest 100 audited administrative changes.</p>
      </div>
      {data.length === 0 ? (
        <p className="mt-8 border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No admin activity has been recorded.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border-y border-border">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-3 py-4">Date</th><th className="px-3 py-4">Actor</th><th className="px-3 py-4">Action</th><th className="px-3 py-4">Record</th><th className="px-3 py-4">Details</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-3 py-4 text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</td>
                  <td className="px-3 py-4 font-mono">{entry.actor_user_id ?? "System"}</td>
                  <td className="px-3 py-4 font-bold">{entry.action}</td>
                  <td className="px-3 py-4">{entry.entity_type}{entry.entity_id ? ` / ${entry.entity_id}` : ""}</td>
                  <td className="max-w-sm whitespace-pre-wrap break-words px-3 py-4 font-mono text-[10px]">{JSON.stringify(entry.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
