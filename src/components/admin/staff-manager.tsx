"use client";

import * as React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const roleSchema = z.enum(["owner", "catalog_manager", "order_manager", "inventory_manager", "viewer"]);
const staffSchema = z.object({
  user_id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().nullable(),
  role: roleSchema,
  is_active: z.boolean(),
  created_at: z.string(),
});
const responseSchema = z.object({ staff: z.array(staffSchema) });
type StaffMember = z.infer<typeof staffSchema>;
type StaffRole = z.infer<typeof roleSchema>;
const assignableRoles = ["catalog_manager", "order_manager", "inventory_manager", "viewer"] as const;

async function fetchStaff(signal?: AbortSignal) {
  const response = await fetch("/api/admin/staff", { signal });
  const body: unknown = await response.json();
  if (!response.ok) throw new Error("Unable to load staff accounts.");
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) throw new Error("Staff response is invalid.");
  return parsed.data.staff;
}

export function StaffManager() {
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [email, setEmail] = React.useState("");
  const [newRole, setNewRole] = React.useState<Exclude<StaffRole, "owner">>("viewer");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [savingUser, setSavingUser] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    void fetchStaff(controller.signal)
      .then((data) => setStaff(data))
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setMessage(caught instanceof Error ? caught.message : "Unable to load staff accounts.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const saveRole = async (member: StaffMember) => {
    if (member.role === "owner") return;
    setSavingUser(member.user_id);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: member.email, role: member.role, isActive: member.is_active }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const failure = z.object({ message: z.string() }).safeParse(body);
        throw new Error(failure.success ? failure.data.message : "Unable to update staff role.");
      }
      setMessage(`Updated access for ${member.email}.`);
      setStaff(await fetchStaff());
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to update staff role.");
    } finally {
      setSavingUser(null);
    }
  };

  const addStaff = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: newRole, isActive: true }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const failure = z.object({ message: z.string() }).safeParse(body);
        throw new Error(failure.success ? failure.data.message : "Unable to assign staff access.");
      }
      setEmail("");
      setMessage("Staff role assigned.");
      setStaff(await fetchStaff());
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to assign staff access.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="mt-8 text-sm text-muted-foreground">Loading staff…</p>;

  return (
    <main className="mt-8 space-y-8">
      {message && <p role="status" className="border border-border p-3 text-sm">{message}</p>}
      <section className="space-y-4">
        <div><h2 className="text-sm font-black uppercase tracking-wider">Current staff accounts</h2><p className="mt-1 text-xs text-muted-foreground">Owners cannot be demoted or deactivated in this interface.</p></div>
        {staff.map((member) => (
          <div key={member.user_id} className="grid gap-4 border border-border p-4 sm:grid-cols-[1fr_200px_140px_auto] sm:items-end">
            <div><p className="text-sm font-bold">{member.full_name || member.email}</p><p className="mt-1 text-xs text-muted-foreground">{member.email}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{member.role.replace("_", " ")} · {member.is_active ? "Active" : "Inactive"}</p></div>
            {member.role === "owner" ? (
              <p className="text-xs font-bold uppercase tracking-wider">Owner account</p>
            ) : (
              <>
                <label className="text-[10px] font-bold uppercase tracking-wider">Role<select className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm" value={member.role} onChange={(event) => setStaff((current) => current.map((item) => item.user_id === member.user_id ? { ...item, role: event.target.value as StaffRole } : item))}>{assignableRoles.map((role) => <option key={role} value={role}>{role.replace("_", " ")}</option>)}</select></label>
                <label className="flex items-center gap-2 text-xs font-bold uppercase"><input type="checkbox" checked={member.is_active} onChange={(event) => setStaff((current) => current.map((item) => item.user_id === member.user_id ? { ...item, is_active: event.target.checked } : item))} />Active</label>
                <Button type="button" variant="outline" disabled={savingUser !== null} onClick={() => void saveRole(member)}>{savingUser === member.user_id ? "Saving…" : "Save role"}</Button>
              </>
            )}
          </div>
        ))}
      </section>

      <form onSubmit={(event) => void addStaff(event)} className="grid gap-4 border-t border-border pt-8 sm:grid-cols-[1fr_220px_auto] sm:items-end">
        <div><h2 className="text-sm font-black uppercase tracking-wider">Assign staff access</h2><p className="mt-1 text-xs text-muted-foreground">The person must already have a registered Clothing71 account. Invitations are not enabled.</p></div>
        <label className="text-[10px] font-bold uppercase tracking-wider">Existing account email<input className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <div className="flex gap-2">
          <select aria-label="New staff role" className="h-10 border border-border bg-background px-3 text-sm" value={newRole} onChange={(event) => setNewRole(event.target.value as Exclude<StaffRole, "owner">)}>{assignableRoles.map((role) => <option key={role} value={role}>{role.replace("_", " ")}</option>)}</select>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Assign"}</Button>
        </div>
      </form>
    </main>
  );
}
