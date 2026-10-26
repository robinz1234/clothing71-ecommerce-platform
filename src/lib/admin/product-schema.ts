import { z } from "zod";

const uuidSchema = z.string().uuid();

const variantSchema = z.object({
  id: uuidSchema.optional(),
  sku: z.string().trim().min(1).max(120),
  color_name: z.string().trim().min(1).max(80),
  color_hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  size: z.string().trim().min(1).max(40),
  stock_quantity: z.number().int().min(0),
  is_active: z.boolean().default(true),
});

const imageSchema = z.object({
  id: uuidSchema.optional(),
  storage_path: z.string().trim().min(1).max(500),
  alt_text: z.string().trim().min(1).max(300),
  sort_order: z.number().int().min(0),
  image_role: z.enum(["primary", "gallery", "size_chart"]),
  color_name: z.string().trim().max(80).nullable().optional(),
});

const sizeGuideSchema = z.object({
  component: z.enum(["product", "top", "bottom"]),
  size: z.string().trim().min(1).max(40),
  waist: z.string().trim().max(30).nullable().optional(),
  length: z.string().trim().max(30).nullable().optional(),
  leg_opening: z.string().trim().max(30).nullable().optional(),
  thigh: z.string().trim().max(30).nullable().optional(),
  chest: z.string().trim().max(30).nullable().optional(),
  sleeve: z.string().trim().max(30).nullable().optional(),
  unit: z.enum(["inches", "cm"]).default("inches"),
});

export const productPayloadSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().trim().min(1).max(160),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  base_sku: z.string().trim().max(120).nullable().optional(),
  short_description: z.string().trim().max(500).nullable().optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  product_type: z.string().trim().min(1).max(80),
  audiences: z.array(z.enum(["men", "women", "kids"])).min(1),
  fit: z.string().trim().max(120).nullable().optional(),
  fabric_details: z.string().trim().max(500).nullable().optional(),
  care_instructions: z.array(z.string().trim().min(1).max(300)).default([]),
  price_bdt: z.number().int().min(0).max(999999999),
  compare_at_price_bdt: z.number().int().min(0).max(999999999).nullable().optional(),
  is_new: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  publication_status: z.enum(["draft", "published", "archived"]).optional(),
  category_ids: z.array(uuidSchema).default([]),
  collection_ids: z.array(uuidSchema).default([]),
  variants: z.array(variantSchema),
  images: z.array(imageSchema).optional(),
  quantity_prices: z.array(z.object({
    bundle_quantity: z.number().int().min(2).max(100),
    bundle_price_bdt: z.number().int().min(0).max(999999999),
  })).optional(),
  size_guides: z.array(sizeGuideSchema).optional(),
}).strict();
