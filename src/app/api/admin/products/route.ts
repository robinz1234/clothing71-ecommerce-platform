import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { productPayloadSchema } from "@/lib/admin/product-schema";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** Map RPC exception codes to human-readable messages. */
function rpcErrorMessage(rawMessage: string): string {
  if (rawMessage.includes("ADMIN_REQUIRED")) return "You do not have permission to save products.";
  if (rawMessage.includes("PUBLISHED_PRODUCT_REQUIRES_ONE_PRIMARY_IMAGE"))
    return "Published products must have exactly one primary image. Please mark one image as primary before publishing.";
  if (rawMessage.includes("PUBLISHED_PRODUCT_REQUIRES_VARIANT"))
    return "Published products must have at least one active variant. Please add a variant before publishing.";
  if (rawMessage.includes("PRODUCT_IMAGE_OBJECT_NOT_FOUND"))
    return "One or more images could not be found in storage. Re-upload the missing images and try again.";
  if (rawMessage.includes("INVALID_PRODUCT_IMAGE"))
    return "An image has an invalid role, path, or missing alt text. Check all images and try again.";
  if (rawMessage.includes("INVALID_PRODUCT_VARIANT"))
    return "A variant has missing or invalid fields. Check SKU, color, color code (hex), size, and stock quantity.";
  if (rawMessage.includes("PRODUCT_AUDIENCES_REQUIRED"))
    return "Please select at least one audience (Men, Women, or Kids).";
  if (rawMessage.includes("INVALID_PUBLICATION_STATUS"))
    return "Invalid publication status. New products must be saved as Draft.";
  if (rawMessage.includes("INVALID_PRODUCT_DETAILS"))
    return "Product name, slug, type, or price are invalid. Check all required fields.";
  return `Unable to save product: ${rawMessage}`;
}

export async function POST(request: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = productPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const fieldPath = firstIssue?.path.join(" → ") ?? "unknown field";
    const zodMessage = firstIssue?.message ?? "Invalid value";
    return NextResponse.json(
      { message: `Validation error at ${fieldPath}: ${zodMessage}`, issues: parsed.error.issues },
      { status: 400 },
    );
  }
  if (parsed.data.id !== undefined) return NextResponse.json({ message: "New products cannot include an existing product identifier." }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_save_product", { p_payload: parsed.data });
  if (error) {
    const status = error.message.includes("ADMIN_REQUIRED") ? 403 : 422;
    return NextResponse.json({ message: rpcErrorMessage(error.message) }, { status });
  }

  revalidatePath("/shop");
  revalidatePath("/");

  return NextResponse.json({ id: data }, { status: 201 });
}
