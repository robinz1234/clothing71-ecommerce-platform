"use client";

import * as React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  sort_order: z.number().int(),
  image_path: z.string().nullable(),
  is_active: z.boolean(),
});

const responseSchema = z.object({ categories: z.array(categorySchema) });
type Category = z.infer<typeof categorySchema>;

export function CategoryManager() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [newCategory, setNewCategory] = React.useState({ name: "", slug: "", description: "", sortOrder: 0, imagePath: "", isActive: false });
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [savingNew, setSavingNew] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch("/api/admin/categories", { signal: controller.signal });
        const body: unknown = await response.json();
        if (!response.ok) throw new Error("Unable to load categories.");
        const parsed = responseSchema.safeParse(body);
        if (!parsed.success) throw new Error("Category response is invalid.");
        setCategories(parsed.data.categories);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setMessage(caught instanceof Error ? caught.message : "Unable to load categories.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  const save = async (category: {
    id?: string;
    name: string;
    slug?: string;
    description: string | null;
    sortOrder: number;
    imagePath: string | null;
    isActive: boolean;
  }) => {
    const isNew = !category.id;
    setSavingNew(isNew);
    setSavingId(category.id ?? null);
    setMessage(null);
    try {
      const response = await fetch(isNew ? "/api/admin/categories" : `/api/admin/categories?id=${category.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const failure = z.object({ message: z.string() }).safeParse(body);
        throw new Error(failure.success ? failure.data.message : "Unable to save category.");
      }
      const refreshed = await fetch("/api/admin/categories");
      const refreshedBody: unknown = await refreshed.json();
      const parsed = responseSchema.safeParse(refreshedBody);
      if (!refreshed.ok || !parsed.success) throw new Error("Category saved, but the list could not be refreshed.");
      setCategories(parsed.data.categories);
      if (isNew) setNewCategory({ name: "", slug: "", description: "", sortOrder: parsed.data.categories.length, imagePath: "", isActive: false });
      setMessage("Category saved.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to save category.");
    } finally {
      setSavingNew(false);
      setSavingId(null);
    }
  };

  if (loading) return <p className="mt-8 text-sm text-muted-foreground">Loading categories…</p>;

  return (
    <main className="mt-8 space-y-8">
      {message && <p role="status" className="border border-border p-3 text-sm">{message}</p>}
      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider">Existing categories</h2>
        {categories.length === 0 && <p className="border border-dashed border-border p-8 text-sm text-muted-foreground">No categories exist.</p>}
        {categories.map((category, index) => (
          <div key={category.id} className="grid gap-4 border border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-[10px] font-bold uppercase tracking-wider">Name<input className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm" value={category.name} onChange={(event) => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, name: event.target.value } : item))} /></label>
            <label className="text-[10px] font-bold uppercase tracking-wider">Slug (immutable)<input className="mt-1 h-10 w-full border border-border bg-muted px-3 text-sm" value={category.slug} readOnly /></label>
            <label className="text-[10px] font-bold uppercase tracking-wider">Sort order<input className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm" type="number" min={0} value={category.sort_order} onChange={(event) => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, sort_order: Number(event.target.value) } : item))} /></label>
            <label className="text-[10px] font-bold uppercase tracking-wider">Image path<input className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm" value={category.image_path ?? ""} onChange={(event) => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, image_path: event.target.value || null } : item))} /></label>
            <label className="text-[10px] font-bold uppercase tracking-wider sm:col-span-2">Description<textarea className="mt-1 min-h-16 w-full border border-border bg-background p-3 text-sm" maxLength={2000} value={category.description ?? ""} onChange={(event) => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, description: event.target.value || null } : item))} /></label>
            <label className="flex items-center gap-2 text-xs font-bold uppercase"><input type="checkbox" checked={category.is_active} onChange={(event) => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, is_active: event.target.checked } : item))} />Active</label>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-muted-foreground">Position {index + 1}</span>
              <Button type="button" variant="outline" disabled={savingId !== null} onClick={() => void save({ id: category.id, name: category.name, description: category.description, sortOrder: category.sort_order, imagePath: category.image_path, isActive: category.is_active })}>{savingId === category.id ? "Saving…" : "Save"}</Button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-sm font-black uppercase tracking-wider">Create category</h2>
        <div className="grid gap-4 border border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-[10px] font-bold uppercase tracking-wider">Name<input className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm" value={newCategory.name} onChange={(event) => setNewCategory((current) => ({ ...current, name: event.target.value, slug: current.slug || event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }))} /></label>
          <label className="text-[10px] font-bold uppercase tracking-wider">Slug<input className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm" value={newCategory.slug} onChange={(event) => setNewCategory((current) => ({ ...current, slug: event.target.value.toLowerCase() }))} /></label>
          <label className="text-[10px] font-bold uppercase tracking-wider">Sort order<input className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm" type="number" min={0} value={newCategory.sortOrder} onChange={(event) => setNewCategory((current) => ({ ...current, sortOrder: Number(event.target.value) }))} /></label>
          <label className="text-[10px] font-bold uppercase tracking-wider">Image path<input className="mt-1 h-10 w-full border border-border bg-background px-3 text-sm" value={newCategory.imagePath} onChange={(event) => setNewCategory((current) => ({ ...current, imagePath: event.target.value }))} /></label>
          <label className="text-[10px] font-bold uppercase tracking-wider sm:col-span-2">Description<textarea className="mt-1 min-h-16 w-full border border-border bg-background p-3 text-sm" maxLength={2000} value={newCategory.description} onChange={(event) => setNewCategory((current) => ({ ...current, description: event.target.value }))} /></label>
          <label className="flex items-center gap-2 text-xs font-bold uppercase"><input type="checkbox" checked={newCategory.isActive} onChange={(event) => setNewCategory((current) => ({ ...current, isActive: event.target.checked }))} />Active</label>
          <div className="flex items-center justify-end"><Button type="button" disabled={savingNew} onClick={() => void save({ ...newCategory, description: newCategory.description || null, imagePath: newCategory.imagePath || null })}>{savingNew ? "Saving…" : "Create category"}</Button></div>
        </div>
      </section>
    </main>
  );
}
