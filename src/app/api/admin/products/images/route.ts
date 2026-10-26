import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const productIdSchema = z.string().uuid();
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function hasValidImageSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return bytes.length >= 8
      && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
      && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  }
  return mimeType === "image/webp"
    && bytes.length >= 12
    && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
}

export async function POST(request: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "Upload must use multipart form data." }, { status: 400 });
  }
  const parsedId = productIdSchema.safeParse(formData.get("productId"));
  const file = formData.get("file");
  if (!parsedId.success || !(file instanceof File)) {
    return NextResponse.json({ message: "A valid product and image file are required." }, { status: 400 });
  }
  if (!MIME_TYPES.has(file.type) || file.size < 1 || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ message: "Choose a JPEG, PNG, or WebP image up to 5 MB." }, { status: 400 });
  }
  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!hasValidImageSignature(signature, file.type)) {
    return NextResponse.json({ message: "The uploaded file does not match its image type." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("id", parsedId.data)
    .maybeSingle();
  if (productError) {
    return NextResponse.json({ message: "Unable to verify the product before upload." }, { status: 500 });
  }
  if (!product) return NextResponse.json({ message: "Product not found." }, { status: 404 });

  const extension = file.type === "image/jpeg" ? "jpg" : file.type.slice("image/".length);
  const storagePath = `${admin.id}/products/${parsedId.data}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("catalog-images")
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    return NextResponse.json({ message: `Image upload failed: ${uploadError.message}` }, { status: 422 });
  }

  const { data: publicUrl } = supabase.storage.from("catalog-images").getPublicUrl(storagePath);
  return NextResponse.json({ storagePath, publicUrl: publicUrl.publicUrl }, { status: 201 });
}

export async function DELETE(request: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = z.object({ storagePath: z.string().trim().min(1).max(500) }).safeParse(body);
  if (!parsed.success || !parsed.data.storagePath.startsWith(`${admin.id}/`)) {
    return NextResponse.json({ message: "Only your own uploaded image can be removed." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { data: linkedImage, error: linkedImageError } = await supabase
    .from("product_images")
    .select("id")
    .eq("storage_path", parsed.data.storagePath)
    .limit(1)
    .maybeSingle();
  if (linkedImageError) {
    return NextResponse.json({ message: "Unable to verify image references." }, { status: 500 });
  }
  if (linkedImage) {
    return NextResponse.json({ message: "Save the product changes before removing this file." }, { status: 409 });
  }

  const { error } = await supabase.storage.from("catalog-images").remove([parsed.data.storagePath]);
  if (error) return NextResponse.json({ message: "Unable to remove the unlinked image." }, { status: 422 });
  return NextResponse.json({ ok: true });
}
