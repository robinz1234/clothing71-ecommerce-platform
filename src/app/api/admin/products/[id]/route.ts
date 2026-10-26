import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentAdminUser, hasAdminPermission } from "@/lib/auth/admin";
import { productPayloadSchema } from "@/lib/admin/product-schema";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  isNew: z.boolean(),
  isBestSeller: z.boolean(),
  isFeatured: z.boolean(),
});

const productIdSchema = z.string().uuid();

/** Map RPC exception codes to human-readable messages for the admin UI. */
function rpcErrorMessage(rawMessage: string): string {
  if (rawMessage.includes("ADMIN_REQUIRED")) return "You do not have permission to save products.";
  if (rawMessage.includes("PUBLISHED_PRODUCT_REQUIRES_ONE_PRIMARY_IMAGE"))
    return "Published products must have exactly one primary image. Please mark one image as primary before publishing.";
  if (rawMessage.includes("PUBLISHED_PRODUCT_REQUIRES_VARIANT"))
    return "Published products must have at least one active variant. Please add a variant before publishing.";
  if (rawMessage.includes("PRODUCT_IMAGE_OBJECT_NOT_FOUND"))
    return "One or more images could not be found in storage. Re-upload the missing images and try again.";
  if (rawMessage.includes("PRODUCT_IMAGE_NOT_FOUND"))
    return "An image referenced in the form no longer exists in the database. Refresh the editor and try again.";
  if (rawMessage.includes("INVALID_PRODUCT_IMAGE"))
    return "An image has an invalid role, path, or missing alt text. Check all images and try again.";
  if (rawMessage.includes("INVALID_PRODUCT_VARIANT"))
    return "A variant has missing or invalid fields. Check SKU, color, color code (hex), size, and stock quantity.";
  if (rawMessage.includes("PRODUCT_AUDIENCES_REQUIRED"))
    return "Please select at least one audience (Men, Women, or Kids).";
  if (rawMessage.includes("INVALID_PRODUCT_AUDIENCES"))
    return "Audience must be one of: Men, Women, Kids.";
  if (rawMessage.includes("INVALID_PUBLICATION_STATUS"))
    return "Invalid publication status. Use Draft, Published, or Archived.";
  if (rawMessage.includes("INVALID_PRODUCT_DETAILS"))
    return "Product name, slug, type, or price are invalid. Check all required fields.";
  if (rawMessage.includes("PRODUCT_NOT_FOUND"))
    return "This product no longer exists. It may have been deleted.";
  if (rawMessage.includes("VARIANT_NOT_FOUND"))
    return "A variant no longer exists. Refresh the editor and try again.";
  if (rawMessage.includes("INVENTORY_PERMISSION_REQUIRED"))
    return "Changing stock quantities requires the inventory.manage permission.";
  if (rawMessage.includes("INVALID_COMPARE_AT_PRICE"))
    return "Compare-at price must be higher than the selling price.";
  if (rawMessage.includes("INVALID_QUANTITY_PRICE"))
    return "Quantity offer has an invalid quantity or price.";
  // Fallback with raw RPC message for debugging
  return `Unable to save product: ${rawMessage}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  if (
    !(await hasAdminPermission("catalog.read")) &&
    !(await hasAdminPermission("inventory.read"))
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) return NextResponse.json({ message: "Invalid product identifier." }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*), product_images(*), product_quantity_prices(*), product_size_guides(*), product_categories(category_id), product_collections(collection_id), product_audiences(audience)")
    .eq("id", parsedId.data)
    .maybeSingle();
  if (error) return NextResponse.json({ message: "Unable to load product details." }, { status: 500 });
  if (!data) return NextResponse.json({ message: "Product not found." }, { status: 404 });

  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, slug, is_active")
    .order("sort_order");
  if (categoryError) return NextResponse.json({ message: "Unable to load product categories." }, { status: 500 });

  const { data: collections, error: collectionError } = await supabase
    .from("collections")
    .select("id, name, slug, is_active")
    .order("name");
  if (collectionError) return NextResponse.json({ message: "Unable to load product collections." }, { status: 500 });

  const imageUrls = Object.fromEntries(
    (data.product_images as Array<{ storage_path: string }>).map((image) => [
      image.storage_path,
      supabase.storage.from("catalog-images").getPublicUrl(image.storage_path).data.publicUrl,
    ]),
  );
  return NextResponse.json({ product: data, categories, collections, imageUrls });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) return NextResponse.json({ message: "Invalid product identifier." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = productPayloadSchema.safeParse(body);
  if (!parsed.success) {
    // Surface Zod validation errors to the admin
    const firstIssue = parsed.error.issues[0];
    const fieldPath = firstIssue?.path.join(" → ") ?? "unknown field";
    const zodMessage = firstIssue?.message ?? "Invalid value";
    return NextResponse.json(
      { message: `Validation error at ${fieldPath}: ${zodMessage}`, issues: parsed.error.issues },
      { status: 400 },
    );
  }
  if (parsed.data.publication_status === undefined || (parsed.data.id !== undefined && parsed.data.id !== parsedId.data)) {
    return NextResponse.json({ message: "Product identifier and publication status must match the edit request." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_save_product", {
    p_payload: { ...parsed.data, id: parsedId.data },
  });
  if (error) {
    const status = error.message.includes("ADMIN_REQUIRED") ? 403 : 422;
    return NextResponse.json({ message: rpcErrorMessage(error.message) }, { status });
  }

  // Revalidate public storefront pages so publishing is immediately visible
  const slug = (parsed.data as { slug?: string }).slug;
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
  revalidatePath("/shop");
  revalidatePath("/");

  return NextResponse.json({ id: data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) return NextResponse.json({ message: "Invalid product identifier." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Invalid product flags." }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_product_flags", {
    p_product_id: parsedId.data,
    p_is_active: null,
    p_is_new: parsed.data.isNew,
    p_is_best_seller: parsed.data.isBestSeller,
    p_is_featured: parsed.data.isFeatured,
  });
  if (error) {
    const status = error.message.includes("ADMIN_REQUIRED") ? 403 : 422;
    return NextResponse.json({ message: rpcErrorMessage(error.message) }, { status });
  }
  revalidatePath("/shop");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
