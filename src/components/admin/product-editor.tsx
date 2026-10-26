"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { productPayloadSchema } from "@/lib/admin/product-schema";
import { Button } from "@/components/ui/button";

const variantOutputSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  color_name: z.string(),
  color_hex: z.string(),
  size: z.string(),
  stock_quantity: z.number().int(),
  is_active: z.boolean(),
});

const imageOutputSchema = z.object({
  id: z.string().uuid(),
  storage_path: z.string(),
  alt_text: z.string().nullable(),
  sort_order: z.number().int(),
  image_role: z.enum(["primary", "gallery", "size_chart"]),
  color_name: z.string().nullable(),
  is_primary: z.boolean(),
});

const editorResponseSchema = z.object({
  product: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    base_sku: z.string().nullable(),
    short_description: z.string().nullable(),
    description: z.string().nullable(),
    product_type: z.string(),
    audience: z.string(),
    fit: z.string().nullable(),
    fabric_details: z.string().nullable(),
    care_instructions: z.array(z.string()),
    price_bdt: z.number().int(),
    compare_at_price_bdt: z.number().int().nullable(),
    is_new: z.boolean(),
    is_best_seller: z.boolean(),
    is_featured: z.boolean(),
    publication_status: z.enum(["draft", "published", "archived"]),
    product_variants: z.array(variantOutputSchema),
    product_images: z.array(imageOutputSchema),
    product_quantity_prices: z.array(z.object({
      bundle_quantity: z.number().int(),
      bundle_price_bdt: z.number().int(),
    })),
    product_size_guides: z.array(z.object({
      component: z.enum(["product", "top", "bottom"]),
      size: z.string(),
      waist: z.string().nullable(),
      length: z.string().nullable(),
      leg_opening: z.string().nullable(),
      thigh: z.string().nullable(),
      chest: z.string().nullable(),
      sleeve: z.string().nullable(),
      unit: z.enum(["inches", "cm"]),
    })),
    product_categories: z.array(z.object({ category_id: z.string().uuid() })),
    product_collections: z.array(z.object({ collection_id: z.string().uuid() })),
    product_audiences: z.array(z.object({ audience: z.enum(["men", "women", "kids"]) })),
  }),
  categories: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    is_active: z.boolean(),
  })),
  collections: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    is_active: z.boolean(),
  })),
  imageUrls: z.record(z.string(), z.string()),
});

const optionsResponseSchema = z.object({
  categories: editorResponseSchema.shape.categories,
  collections: editorResponseSchema.shape.collections,
});

const imageUploadResponseSchema = z.object({
  storagePath: z.string(),
  publicUrl: z.string().url(),
});

type ProductPayload = z.infer<typeof productPayloadSchema>;
type Category = z.infer<typeof editorResponseSchema.shape.categories.element>;
type Collection = z.infer<typeof editorResponseSchema.shape.collections.element>;
type ImageItem = NonNullable<ProductPayload["images"]>[number];
type VariantItem = ProductPayload["variants"][number];

const emptyDraft: ProductPayload = {
  name: "",
  slug: "",
  product_type: "tops",
  audiences: ["men"],
  care_instructions: [],
  price_bdt: 0,
  is_new: false,
  is_best_seller: false,
  is_featured: false,
  publication_status: "draft",
  category_ids: [],
  collection_ids: [],
  variants: [],
  images: [],
  quantity_prices: [],
  size_guides: [],
};

const fieldClassName = "mt-1 h-10 w-full border border-border bg-background px-3 text-sm";
const labelClassName = "block text-xs font-bold uppercase tracking-wider";

function toEditorDraft(product: z.infer<typeof editorResponseSchema>["product"]): ProductPayload {
  const audiences = product.product_audiences.map(({ audience }) => audience);
  return productPayloadSchema.parse({
    id: product.id,
    name: product.name,
    slug: product.slug,
    base_sku: product.base_sku,
    short_description: product.short_description,
    description: product.description,
    product_type: product.product_type,
    audiences: audiences.length > 0
      ? audiences
      : product.audience.replace(/\s*&\s*/g, ",").split(/\s*,\s*/).map((value) => value.toLowerCase()),
    fit: product.fit,
    fabric_details: product.fabric_details,
    care_instructions: product.care_instructions,
    price_bdt: product.price_bdt,
    compare_at_price_bdt: product.compare_at_price_bdt,
    is_new: product.is_new,
    is_best_seller: product.is_best_seller,
    is_featured: product.is_featured,
    publication_status: product.publication_status,
    variants: product.product_variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      color_name: variant.color_name,
      color_hex: variant.color_hex,
      size: variant.size,
      stock_quantity: variant.stock_quantity,
      is_active: variant.is_active,
    })),
    images: [...product.product_images]
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((image) => ({
        id: image.id,
        storage_path: image.storage_path,
        alt_text: image.alt_text ?? product.name,
        sort_order: image.sort_order,
        image_role: image.image_role,
        color_name: image.color_name,
      })),
    quantity_prices: product.product_quantity_prices.map((tier) => ({
      bundle_quantity: tier.bundle_quantity,
      bundle_price_bdt: tier.bundle_price_bdt,
    })),
    size_guides: product.product_size_guides.map((guide) => ({
      component: guide.component,
      size: guide.size,
      waist: guide.waist,
      length: guide.length,
      leg_opening: guide.leg_opening,
      thigh: guide.thigh,
      chest: guide.chest,
      sleeve: guide.sleeve,
      unit: guide.unit,
    })),
    category_ids: product.product_categories.map(({ category_id }) => category_id),
    collection_ids: product.product_collections.map(({ collection_id }) => collection_id),
  });
}

function createVariantSku(existingSkus: readonly string[]) {
  const existingSkuSet = new Set(existingSkus);
  let sku: string;
  do {
    sku = `C71-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
  } while (existingSkuSet.has(sku));
  return sku;
}

export function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<ProductPayload>(emptyDraft);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [imageUrls, setImageUrls] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (productId) {
          const response = await fetch(`/api/admin/products/${productId}`, { signal: controller.signal });
          const body: unknown = await response.json();
          if (!response.ok) throw new Error("Unable to load the product editor.");
          const parsed = editorResponseSchema.safeParse(body);
          if (!parsed.success) throw new Error("The product response is incomplete. Refresh or contact support.");
          setDraft(toEditorDraft(parsed.data.product));
          setCategories(parsed.data.categories);
          setCollections(parsed.data.collections);
          setImageUrls(parsed.data.imageUrls);
        } else {
          const response = await fetch("/api/admin/products/options", { signal: controller.signal });
          const body: unknown = await response.json();
          if (!response.ok) throw new Error("Unable to load product categories and collections.");
          const parsed = optionsResponseSchema.safeParse(body);
          if (!parsed.success) throw new Error("Catalog options are incomplete. Refresh or contact support.");
          setCategories(parsed.data.categories);
          setCollections(parsed.data.collections);
        }
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught.message : "Unable to load product details.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [productId]);

  const update = <Key extends keyof ProductPayload>(key: Key, value: ProductPayload[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateVariant = (index: number, change: Partial<VariantItem>) => {
    update("variants", (draft.variants ?? []).map((variant, currentIndex) =>
      currentIndex === index ? { ...variant, ...change } : variant,
    ));
  };

  const updateImage = (index: number, change: Partial<ImageItem>) => {
    update("images", (draft.images ?? []).map((image, currentIndex) =>
      currentIndex === index ? { ...image, ...change } : image,
    ));
  };

  const saveProduct = async () => {
    setError(null);
    setNotice(null);
    if (!productId && draft.publication_status !== "draft") {
      setError("Create the product as a draft first, then publish or archive it.");
      return;
    }
    const parsed = productPayloadSchema.safeParse({ ...draft, images: draft.images ?? [] });
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const path = firstIssue?.path.join(" → ") || "product";
      setError(`Validation error at ${path}: ${firstIssue?.message || "Check the required product details."}`);
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(
        productId ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: productId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      const body: unknown = await response.json();
      const result = z.object({ id: z.string().uuid(), message: z.string().optional() }).safeParse(body);
      if (!response.ok || !result.success) {
        const serverMessage = z.object({ message: z.string() }).safeParse(body);
        throw new Error(serverMessage.success ? serverMessage.data.message : "Unable to save product.");
      }
      setNotice("Product saved.");
      if (!productId) {
        router.replace(`/admin/products/${result.data.id}/edit`);
      } else {
        router.refresh();
        const reload = await fetch(`/api/admin/products/${result.data.id}`);
        const reloadBody: unknown = await reload.json();
        const editorData = editorResponseSchema.safeParse(reloadBody);
        if (reload.ok && editorData.success) {
          setDraft(toEditorDraft(editorData.data.product));
          setImageUrls(editorData.data.imageUrls);
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length || !productId) return;
    const newFiles = Array.from(files);
    setUploading(true);
    setError(null);
    setNotice(null);
    try {
      let uploadedImages = [...(draft.images ?? [])];
      for (const file of newFiles) {
        const formData = new FormData();
        formData.set("productId", productId);
        formData.set("file", file);
        const response = await fetch("/api/admin/products/images", { method: "POST", body: formData });
        const body: unknown = await response.json();
        const parsed = imageUploadResponseSchema.safeParse(body);
        if (!response.ok || !parsed.success) {
          const serverMessage = z.object({ message: z.string() }).safeParse(body);
          throw new Error(serverMessage.success ? serverMessage.data.message : "Image upload failed.");
        }
        const role = uploadedImages.some((image) => image.image_role === "primary") ? "gallery" : "primary";
        const newImage: ImageItem = {
          storage_path: parsed.data.storagePath,
          alt_text: draft.name || file.name,
          sort_order: uploadedImages.length,
          image_role: role,
          color_name: null,
        };
        uploadedImages = [...uploadedImages, newImage];
        setDraft((current) => ({ ...current, images: uploadedImages }));
        setImageUrls((current) => ({ ...current, [parsed.data.storagePath]: parsed.data.publicUrl }));
      }
      setNotice("Images uploaded. Save the product to attach them to the catalog.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const moveImage = (index: number, offset: -1 | 1) => {
    const images = [...(draft.images ?? [])];
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    [images[index], images[nextIndex]] = [images[nextIndex], images[index]];
    update("images", images.map((image, sortOrder) => ({ ...image, sort_order: sortOrder })));
  };

  const setPrimaryImage = (index: number) => {
    update("images", (draft.images ?? []).map((image, currentIndex) => ({
      ...image,
      image_role: currentIndex === index ? "primary" : image.image_role === "primary" ? "gallery" : image.image_role,
    })));
  };

  const toggleId = (key: "category_ids" | "collection_ids", id: string) => {
    const ids = draft[key] ?? [];
    update(key, ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]);
  };

  if (loading) return <p className="mt-8 text-sm text-muted-foreground">Loading product editor…</p>;

  return (
    <main className="mt-8 space-y-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">{productId ? "Edit product" : "Create product"}</h2>
          <p className="mt-1 text-xs text-muted-foreground">New products begin as drafts. Inventory is managed separately.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {productId && (
            <Link href={`/products/${draft.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center border border-border px-4 text-xs font-bold uppercase tracking-wider">
              View storefront
            </Link>
          )}
          <Button type="button" onClick={() => void saveProduct()} disabled={saving || uploading} className="h-10 px-5 text-xs font-bold uppercase tracking-wider">
            {saving ? "Saving…" : draft.publication_status === "published" ? "Save & publish" : draft.publication_status === "archived" ? "Save archive" : "Save draft"}
          </Button>
        </div>
      </header>

      {error && <p role="alert" className="border border-red-800 p-3 text-sm">{error}</p>}
      {notice && <p role="status" className="border border-border p-3 text-sm">{notice}</p>}

      <section className="grid gap-5 md:grid-cols-2">
        <label className={labelClassName}>Product name
          <input className={fieldClassName} value={draft.name} maxLength={160} onChange={(event) => update("name", event.target.value)} required />
        </label>
        <label className={labelClassName}>URL slug
          <input className={fieldClassName} value={draft.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))} required />
        </label>
        <label className={labelClassName}>Base SKU
          <input className={fieldClassName} value={draft.base_sku ?? ""} onChange={(event) => update("base_sku", event.target.value || null)} />
        </label>
        <label className={labelClassName}>Product type
          <input className={fieldClassName} value={draft.product_type} onChange={(event) => update("product_type", event.target.value)} required />
        </label>
        <label className={labelClassName}>Price (BDT)
          <input className={fieldClassName} type="number" min={0} step={1} value={draft.price_bdt} onChange={(event) => update("price_bdt", Number(event.target.value))} required />
        </label>
        <label className={labelClassName}>Compare-at price (BDT)
          <input className={fieldClassName} type="number" min={0} step={1} value={draft.compare_at_price_bdt ?? ""} onChange={(event) => update("compare_at_price_bdt", event.target.value ? Number(event.target.value) : null)} />
        </label>
        <label className={labelClassName}>Publication
          <select className={fieldClassName} value={draft.publication_status} onChange={(event) => update("publication_status", event.target.value as ProductPayload["publication_status"])}>
            <option value="draft">Draft</option>
            <option value="published" disabled={!productId}>Published</option>
            <option value="archived" disabled={!productId}>Archived</option>
          </select>
        </label>
        <label className={labelClassName}>Fit
          <input className={fieldClassName} value={draft.fit ?? ""} onChange={(event) => update("fit", event.target.value || null)} />
        </label>
        <label className={`${labelClassName} md:col-span-2`}>Short description
          <textarea className="mt-1 min-h-20 w-full border border-border bg-background p-3 text-sm" maxLength={500} value={draft.short_description ?? ""} onChange={(event) => update("short_description", event.target.value || null)} />
        </label>
        <label className={`${labelClassName} md:col-span-2`}>Full description
          <textarea className="mt-1 min-h-32 w-full border border-border bg-background p-3 text-sm" maxLength={10000} value={draft.description ?? ""} onChange={(event) => update("description", event.target.value || null)} />
        </label>
        <label className={labelClassName}>Fabric details
          <input className={fieldClassName} value={draft.fabric_details ?? ""} onChange={(event) => update("fabric_details", event.target.value || null)} />
        </label>
        <label className={labelClassName}>Care instructions (one per line)
          <textarea className="mt-1 min-h-20 w-full border border-border bg-background p-3 text-sm" value={(draft.care_instructions ?? []).join("\n")} onChange={(event) => update("care_instructions", event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} />
        </label>
      </section>

      <section className="grid gap-6 border-y border-border py-6 md:grid-cols-3">
        <fieldset>
          <legend className={labelClassName}>Audience</legend>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            {(["men", "women", "kids"] as const).map((audience) => (
              <label key={audience} className="flex items-center gap-2 capitalize">
                <input type="checkbox" checked={draft.audiences.includes(audience)} onChange={() => update("audiences", draft.audiences.includes(audience) ? draft.audiences.filter((value) => value !== audience) : [...draft.audiences, audience])} />
                {audience}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className={labelClassName}>Merchandising</legend>
          <div className="mt-3 space-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={draft.is_new} onChange={(event) => update("is_new", event.target.checked)} />New</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={draft.is_best_seller} onChange={(event) => update("is_best_seller", event.target.checked)} />Best seller</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={draft.is_featured} onChange={(event) => update("is_featured", event.target.checked)} />Featured</label>
          </div>
        </fieldset>
        <div>
          <h3 className={labelClassName}>Category</h3>
          <div className="mt-3 space-y-2 text-sm">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2">
                <input type="checkbox" checked={(draft.category_ids ?? []).includes(category.id)} onChange={() => toggleId("category_ids", category.id)} />
                <span>{category.name}</span>{!category.is_active && <span className="text-[10px] text-muted-foreground">(inactive)</span>}
              </label>
            ))}
            {categories.length === 0 && <p className="text-xs text-muted-foreground">No categories are available.</p>}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div><h3 className="text-sm font-black uppercase tracking-wider">Variants</h3><p className="mt-1 text-xs text-muted-foreground">Color, size, SKU, and active status. Review generated SKUs before saving. Change stock on the Inventory page.</p></div>
          <Button type="button" variant="outline" onClick={() => update("variants", [...draft.variants, { sku: createVariantSku(draft.variants.map((variant) => variant.sku)), color_name: "", color_hex: "#000000", size: "", stock_quantity: 0, is_active: true }])}>Add variant</Button>
        </div>
        {draft.variants.map((variant, index) => (
          <div key={variant.id ?? `new-${index}`} className="grid gap-3 border border-border p-4 sm:grid-cols-2 lg:grid-cols-6">
            <label className={labelClassName}>SKU<input className={fieldClassName} value={variant.sku} onChange={(event) => updateVariant(index, { sku: event.target.value })} /></label>
            <label className={labelClassName}>Color<input className={fieldClassName} value={variant.color_name} onChange={(event) => updateVariant(index, { color_name: event.target.value })} /></label>
            <label className={labelClassName}>Color code<input className="mt-1 h-10 w-full border border-border bg-background p-1" type="color" value={variant.color_hex} onChange={(event) => updateVariant(index, { color_hex: event.target.value })} /></label>
            <label className={labelClassName}>Size<input className={fieldClassName} value={variant.size} onChange={(event) => updateVariant(index, { size: event.target.value })} /></label>
            <label className={labelClassName}>Stock<input className={fieldClassName} type="number" value={variant.stock_quantity} readOnly aria-readonly="true" /></label>
            <div className="flex items-end justify-between gap-3">
              <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase"><input type="checkbox" checked={variant.is_active} onChange={(event) => updateVariant(index, { is_active: event.target.checked })} />Active</label>
              <Button type="button" variant="outline" aria-label={`Remove ${variant.sku || "variant"}`} onClick={() => update("variants", draft.variants.filter((_, currentIndex) => currentIndex !== index))}>Remove</Button>
            </div>
          </div>
        ))}
        {draft.variants.length === 0 && <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Add at least one variant before publishing.</p>}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="text-sm font-black uppercase tracking-wider">Product images</h3><p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, or WebP; maximum 5 MB per image. Upload additional images across multiple sessions.</p></div>
          <label className="inline-flex cursor-pointer items-center justify-center border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider">
            {uploading ? "Uploading…" : "Upload images"}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={!productId || uploading} onChange={(event) => void uploadImages(event.target.files)} />
          </label>
        </div>
        {!productId && <p className="text-xs text-muted-foreground">Save this product as a draft before uploading images.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(draft.images ?? []).map((image, index) => (
            <article key={image.id ?? image.storage_path} className="border border-border p-3">
              {imageUrls[image.storage_path] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrls[image.storage_path]} alt={image.alt_text ?? ""} className="aspect-square w-full object-cover" />
              ) : <div className="aspect-square bg-muted" aria-label="Image preview unavailable" />}
              <label className={`${labelClassName} mt-3`}>Alt text
                <input className={fieldClassName} value={image.alt_text ?? ""} onChange={(event) => updateImage(index, { alt_text: event.target.value })} />
              </label>
              <label className={`${labelClassName} mt-3`}>Color label
                <input className={fieldClassName} value={image.color_name ?? ""} onChange={(event) => updateImage(index, { color_name: event.target.value || null })} />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button type="button" variant={image.image_role === "primary" ? "default" : "outline"} onClick={() => setPrimaryImage(index)}>{image.image_role === "primary" ? "Primary" : "Make primary"}</Button>
                <Button type="button" variant="outline" aria-label="Move image earlier" disabled={index === 0} onClick={() => moveImage(index, -1)}>↑</Button>
                <Button type="button" variant="outline" aria-label="Move image later" disabled={index === (draft.images?.length ?? 0) - 1} onClick={() => moveImage(index, 1)}>↓</Button>
                <Button type="button" variant="outline" onClick={() => update("images", (draft.images ?? []).filter((_, currentIndex) => currentIndex !== index).map((item, sortOrder) => ({ ...item, sort_order: sortOrder })))}>Remove</Button>
              </div>
              <p className="mt-2 break-all text-[10px] text-muted-foreground">{image.image_role === "size_chart" ? "Size chart" : image.storage_path}</p>
            </article>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Removing an image detaches it from this product; stored image files are not automatically deleted.</p>
      </section>

      <section className="grid gap-8 border-t border-border pt-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div><h3 className="text-sm font-black uppercase tracking-wider">Quantity offers</h3><p className="mt-1 text-xs text-muted-foreground">Set the total BDT price for the stated quantity.</p></div>
            <Button type="button" variant="outline" onClick={() => update("quantity_prices", [...(draft.quantity_prices ?? []), { bundle_quantity: 2, bundle_price_bdt: 0 }])}>Add offer</Button>
          </div>
          {(draft.quantity_prices ?? []).map((tier, index) => (
            <div key={`tier-${index}`} className="flex items-end gap-3">
              <label className={`${labelClassName} flex-1`}>Quantity<input className={fieldClassName} type="number" min={2} value={tier.bundle_quantity} onChange={(event) => update("quantity_prices", (draft.quantity_prices ?? []).map((value, currentIndex) => currentIndex === index ? { ...value, bundle_quantity: Number(event.target.value) } : value))} /></label>
              <label className={`${labelClassName} flex-1`}>Total price (BDT)<input className={fieldClassName} type="number" min={0} value={tier.bundle_price_bdt} onChange={(event) => update("quantity_prices", (draft.quantity_prices ?? []).map((value, currentIndex) => currentIndex === index ? { ...value, bundle_price_bdt: Number(event.target.value) } : value))} /></label>
              <Button type="button" variant="outline" onClick={() => update("quantity_prices", (draft.quantity_prices ?? []).filter((_, currentIndex) => currentIndex !== index))}>Remove</Button>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div><h3 className="text-sm font-black uppercase tracking-wider">Size guide</h3><p className="mt-1 text-xs text-muted-foreground">Measurements can be supplied as inches or centimeters.</p></div>
            <Button type="button" variant="outline" onClick={() => update("size_guides", [...(draft.size_guides ?? []), { component: "product", size: "", unit: "inches" }])}>Add row</Button>
          </div>
          {(draft.size_guides ?? []).map((guide, index) => (
            <div key={`guide-${index}`} className="grid gap-3 sm:grid-cols-3">
              <label className={labelClassName}>Component<select className={fieldClassName} value={guide.component} onChange={(event) => update("size_guides", (draft.size_guides ?? []).map((value, currentIndex) => currentIndex === index ? { ...value, component: event.target.value as "product" | "top" | "bottom" } : value))}><option value="product">Product</option><option value="top">Top</option><option value="bottom">Bottom</option></select></label>
              <label className={labelClassName}>Size<input className={fieldClassName} value={guide.size} onChange={(event) => update("size_guides", (draft.size_guides ?? []).map((value, currentIndex) => currentIndex === index ? { ...value, size: event.target.value } : value))} /></label>
              <label className={labelClassName}>Unit<select className={fieldClassName} value={guide.unit} onChange={(event) => update("size_guides", (draft.size_guides ?? []).map((value, currentIndex) => currentIndex === index ? { ...value, unit: event.target.value as "inches" | "cm" } : value))}><option value="inches">Inches</option><option value="cm">Centimeters</option></select></label>
              {(["waist", "length", "leg_opening", "thigh", "chest", "sleeve"] as const).map((measurement) => (
                <label key={measurement} className={labelClassName}>{measurement.replace("_", " ")}<input className={fieldClassName} value={guide[measurement] ?? ""} onChange={(event) => update("size_guides", (draft.size_guides ?? []).map((value, currentIndex) => currentIndex === index ? { ...value, [measurement]: event.target.value || null } : value))} /></label>
              ))}
              <Button type="button" variant="outline" onClick={() => update("size_guides", (draft.size_guides ?? []).filter((_, currentIndex) => currentIndex !== index))}>Remove size row</Button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border pt-6">
        <h3 className="text-sm font-black uppercase tracking-wider">Collections</h3>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {collections.map((collection) => (
            <label key={collection.id} className="flex items-center gap-2">
              <input type="checkbox" checked={(draft.collection_ids ?? []).includes(collection.id)} onChange={() => toggleId("collection_ids", collection.id)} />
              {collection.name}{!collection.is_active && <span className="text-[10px] text-muted-foreground">(inactive)</span>}
            </label>
          ))}
          {collections.length === 0 && <p className="text-xs text-muted-foreground">No collections are available.</p>}
        </div>
      </section>

      <div className="flex justify-end border-t border-border pt-6">
        <Button type="button" onClick={() => void saveProduct()} disabled={saving || uploading} className="h-11 px-6 text-xs font-bold uppercase tracking-wider">
          {saving ? "Saving…" : draft.publication_status === "published" ? "Save & publish" : draft.publication_status === "archived" ? "Save archive" : "Save draft"}
        </Button>
      </div>
    </main>
  );
}
