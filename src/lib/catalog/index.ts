import { createClient } from "@supabase/supabase-js";
import type {
  Product,
  ProductCategory,
  ProductImage,
  ProductQuantityPrice,
  ProductSizeGuide,
  ProductType,
} from "@/types/product";

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  image_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CatalogCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  is_featured: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  base_sku: string | null;
  short_description: string | null;
  description: string | null;
  product_type: string;
  audience: string;
  fit: string | null;
  fabric_details: string | null;
  care_instructions: string[] | null;
  price_bdt: number;
  compare_at_price_bdt: number | null;
  is_active: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type RawDbVariant = {
  id: string;
  sku: string;
  color_name: string;
  color_hex: string;
  size: string;
  stock_quantity: number;
  is_active: boolean;
};

export type RawDbImage = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  image_role: ProductImage["role"];
  color_name: string | null;
};

export type RawDbSizeGuide = {
  component: ProductSizeGuide["component"];
  size: string;
  waist: string | null;
  length: string | null;
  leg_opening: string | null;
  thigh: string | null;
  chest: string | null;
  sleeve: string | null;
  unit: ProductSizeGuide["unit"];
};

export type RawDbQuantityPrice = {
  bundle_quantity: number;
  bundle_price_bdt: number;
};

export type RawDbProduct = {
  id: string;
  name: string;
  slug: string;
  base_sku: string | null;
  short_description: string | null;
  description: string | null;
  product_type: string;
  audience: string;
  fit: string | null;
  fabric_details: string | null;
  care_instructions: string[] | null;
  price_bdt: number;
  compare_at_price_bdt: number | null;
  is_active: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  product_variants?: RawDbVariant[] | null;
  product_images?: RawDbImage[] | null;
  product_size_guides?: RawDbSizeGuide[] | null;
  product_quantity_prices?: RawDbQuantityPrice[] | null;
  product_audiences?: { audience: ProductCategory }[] | null;
};

const PRODUCT_SELECT_FIELDS = `
  id,
  name,
  slug,
  base_sku,
  short_description,
  description,
  product_type,
  audience,
  fit,
  fabric_details,
  care_instructions,
  price_bdt,
  compare_at_price_bdt,
  is_active,
  is_new,
  is_best_seller,
  is_featured,
  created_at,
  updated_at,
  product_variants (
    id,
    sku,
    color_name,
    color_hex,
    size,
    stock_quantity,
    is_active
  ),
  product_images (
    id,
    storage_path,
    alt_text,
    sort_order,
    is_primary,
    image_role,
    color_name
  ),
  product_size_guides (
    component,
    size,
    waist,
    length,
    leg_opening,
    thigh,
    chest,
    sleeve,
    unit
  ),
  product_quantity_prices (
    bundle_quantity,
    bundle_price_bdt
  ),
  product_audiences (
    audience
  )
`;

export function mapDbProductToUiProduct(dbProduct: RawDbProduct): Product {
  const activeVariants = (dbProduct.product_variants || []).filter(
    (v) => v.is_active !== false
  );

  const colorMap = new Map<string, { name: string; hex: string }>();
  activeVariants.forEach((v) => {
    if (
      v.stock_quantity > 0 &&
      v.color_name &&
      v.color_hex &&
      !colorMap.has(v.color_name)
    ) {
      colorMap.set(v.color_name, { name: v.color_name, hex: v.color_hex });
    }
  });
  const colors = Array.from(colorMap.values());

  const sizeSet = new Set<string>();
  activeVariants.forEach((v) => {
    if (v.size) sizeSet.add(v.size);
  });
  const sizes = Array.from(sizeSet);

  const inStock = activeVariants.some(
    (v) => (v.stock_quantity ?? 0) > 0
  );

  const sortedImages = (dbProduct.product_images || [])
    .slice()
    .sort((a, b) => {
      const roleOrder = (left: RawDbImage) =>
        left.image_role === "primary" ? 0 : left.image_role === "gallery" ? 1 : 2;
      return roleOrder(a) - roleOrder(b) || a.sort_order - b.sort_order;
    });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const productImages: ProductImage[] = sortedImages.flatMap((image) => {
    if (!image.storage_path) return [];
    const url = image.storage_path.startsWith("http://") || image.storage_path.startsWith("https://")
      ? image.storage_path
      : `${supabaseUrl}/storage/v1/object/public/catalog-images/${image.storage_path}`;
    return [{
      url,
      altText: image.alt_text || dbProduct.name,
      role: image.image_role,
      color: image.color_name,
      sortOrder: image.sort_order,
    }];
  });
  const galleryImages = productImages.filter(
    (image) => image.role === "primary" || image.role === "gallery",
  );
  const audiences = Array.from(
    new Set(
      (dbProduct.product_audiences ?? [])
        .map((row) => row.audience)
        .filter((audience): audience is ProductCategory =>
          ["men", "women", "kids"].includes(audience),
        ),
    ),
  );

  const price = dbProduct.price_bdt ?? 0;
  const compareAtPrice = dbProduct.compare_at_price_bdt ?? undefined;
  const isSale = compareAtPrice ? compareAtPrice > price : false;

  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    sku: dbProduct.base_sku || "",
    name: dbProduct.name,
    category: audiences[0] || (dbProduct.audience as ProductCategory) || "men",
    gender: audiences.length > 1 ? "unisex" : audiences[0] || "unisex",
    audiences: audiences.length > 0 ? audiences : ["men"],
    description: dbProduct.description || dbProduct.short_description || "",
    details: dbProduct.short_description ? [dbProduct.short_description] : [],
    price,
    compareAtPrice,
    quantityPrices: (dbProduct.product_quantity_prices ?? []).map(
      (tier): ProductQuantityPrice => ({
        bundleQuantity: tier.bundle_quantity,
        bundlePriceBdt: tier.bundle_price_bdt,
      }),
    ),
    colors,
    sizes,
    variants: activeVariants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      color: { name: variant.color_name, hex: variant.color_hex },
      size: variant.size,
      stockQuantity: variant.stock_quantity,
      isActive: variant.is_active,
    })),
    fit: dbProduct.fit || "Regular",
    fabric: dbProduct.fabric_details || "",
    careInstructions: dbProduct.care_instructions || [],
    inStock,
    isNew: !!dbProduct.is_new,
    isBestSeller: !!dbProduct.is_best_seller,
    isSale,
    images: galleryImages.map((image) => image.url),
    productImages,
    sizeGuides: (dbProduct.product_size_guides ?? []).map((guide) => ({
      component: guide.component,
      size: guide.size,
      waist: guide.waist,
      length: guide.length,
      legOpening: guide.leg_opening,
      thigh: guide.thigh,
      chest: guide.chest,
      sleeve: guide.sleeve,
      unit: guide.unit,
    })),
    productType: (dbProduct.product_type as ProductType) || "t-shirts",
  };
}

async function getPublicCatalogClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase server configuration. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await getPublicCatalogClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .order("base_sku", { ascending: true });

    if (error) {
      console.error("[Catalog] Error fetching products:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as RawDbProduct[]).map(mapDbProductToUiProduct);
  } catch (err) {
    console.error("[Catalog] Failed to load products:", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await getPublicCatalogClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("[Catalog] Error fetching product by slug:", error.message);
      return null;
    }

    if (!data) return null;
    return mapDbProductToUiProduct(data as unknown as RawDbProduct);
  } catch (err) {
    console.error("[Catalog] Failed to load product by slug:", err);
    return null;
  }
}

export async function getCollectionBySlug(
  slug: string,
): Promise<CatalogCollection | null> {
  try {
    const supabase = await getPublicCatalogClient();

    const { data, error } = await supabase
      .from("collections")
      .select(
        "id, name, slug, description, is_active, is_featured, starts_at, ends_at, created_at, updated_at",
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("[Catalog] Error fetching collection by slug:", error.message);
      return null;
    }

    return (data ?? null) as CatalogCollection | null;
  } catch (err) {
    console.error("[Catalog] Failed to load collection by slug:", err);
    return null;
  }
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CatalogCategory | null> {
  try {
    const supabase = await getPublicCatalogClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, sort_order, image_path, is_active, created_at, updated_at")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("[Catalog] Error fetching category by slug:", error.message);
      return null;
    }

    return (data ?? null) as CatalogCategory | null;
  } catch (err) {
    console.error("[Catalog] Failed to load category by slug:", err);
    return null;
  }
}

export async function getActiveCategories(): Promise<CatalogCategory[]> {
  try {
    const supabase = await getPublicCatalogClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, sort_order, image_path, is_active, created_at, updated_at")
      .eq("is_active", true)
      .order("sort_order")
      .order("name");

    if (error) {
      console.error("[Catalog] Error fetching categories:", error.message);
      return [];
    }

    return (data ?? []) as CatalogCategory[];
  } catch (err) {
    console.error("[Catalog] Failed to load categories:", err);
    return [];
  }
}

export async function getCategoryProducts(categoryId: string): Promise<Product[]> {
  try {
    const supabase = await getPublicCatalogClient();
    const { data: assignments, error: assignmentError } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", categoryId);

    if (assignmentError) {
      console.error("[Catalog] Error fetching category assignments:", assignmentError.message);
      return [];
    }

    const productIds = Array.from(
      new Set((assignments ?? []).map((assignment) => assignment.product_id)),
    );
    if (productIds.length === 0) return [];

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .in("id", productIds)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .order("base_sku", { ascending: true });

    if (error) {
      console.error("[Catalog] Error fetching category products:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as RawDbProduct[]).map(mapDbProductToUiProduct);
  } catch (err) {
    console.error("[Catalog] Failed to load category products:", err);
    return [];
  }
}

export async function getCollectionProducts(
  collectionSlug: string,
): Promise<Product[]> {
  try {
    const supabase = await getPublicCatalogClient();
    const slug = collectionSlug.toLowerCase();

    if (slug === "tops" || slug === "bottoms") {
      const productTypes =
        slug === "tops" ? ["t-shirts"] : ["trousers", "short-pants"];
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT_FIELDS)
        .eq("is_active", true)
        .in("product_type", productTypes)
        .order("created_at", { ascending: false })
        .order("base_sku", { ascending: true });

      if (error) {
        console.error(`[Catalog] Error fetching ${slug} products:`, error.message);
        return [];
      }

      return ((data ?? []) as unknown as RawDbProduct[]).map(mapDbProductToUiProduct);
    }

    const menSubcategories: Record<
      string,
      { productTypes: string[]; fit?: string }
    > = {
      "mens-t-shirts": { productTypes: ["t-shirts"] },
      "mens-drop-shoulder-t-shirts": {
        productTypes: ["t-shirts"],
        fit: "Drop Shoulder",
      },
      "mens-shorts": { productTypes: ["short-pants"] },
      "mens-trousers": { productTypes: ["trousers"] },
      "mens-baggy-pants": { productTypes: ["trousers"], fit: "Baggy" },
    };
    const menSubcategory = menSubcategories[slug];
    if (menSubcategory) {
      const { data: audienceRows, error: audienceError } = await supabase
        .from("product_audiences")
        .select("product_id")
        .eq("audience", "men");

      if (audienceError) {
        console.error(
          "[Catalog] Error fetching men's audience products:",
          audienceError.message,
        );
        return [];
      }

      const productIds = Array.from(
        new Set((audienceRows ?? []).map((row) => row.product_id as string)),
      );
      if (productIds.length === 0) return [];

      let query = supabase
        .from("products")
        .select(PRODUCT_SELECT_FIELDS)
        .in("id", productIds)
        .eq("is_active", true)
        .in("product_type", menSubcategory.productTypes);
      if (menSubcategory.fit) query = query.eq("fit", menSubcategory.fit);

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .order("base_sku", { ascending: true });
      if (error) {
        console.error(
          `[Catalog] Error fetching ${slug} products:`,
          error.message,
        );
        return [];
      }

      return ((data ?? []) as unknown as RawDbProduct[]).map(mapDbProductToUiProduct);
    }

    // Handle virtual collection routes
    if (slug === "men" || slug === "women" || slug === "kids") {
      const { data: audienceRows, error: audienceError } = await supabase
        .from("product_audiences")
        .select("product_id")
        .eq("audience", slug);

      if (audienceError) {
        console.error("[Catalog] Error fetching audience products:", audienceError.message);
        return [];
      }

      const productIds = Array.from(
        new Set((audienceRows ?? []).map((row) => row.product_id as string)),
      );
      if (productIds.length === 0) return [];

      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT_FIELDS)
        .in("id", productIds)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .order("base_sku", { ascending: true });

      if (error) {
        console.error("[Catalog] Error fetching category products:", error.message);
        return [];
      }
      return ((data ?? []) as unknown as RawDbProduct[]).map(mapDbProductToUiProduct);
    }

    if (slug === "sale") {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT_FIELDS)
        .eq("is_active", true)
        .not("compare_at_price_bdt", "is", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Catalog] Error fetching sale products:", error.message);
        return [];
      }
      return ((data ?? []) as unknown as RawDbProduct[])
        .filter((p) => p.compare_at_price_bdt && p.compare_at_price_bdt > p.price_bdt)
        .map(mapDbProductToUiProduct);
    }

    if (slug === "combo-sets") {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT_FIELDS)
        .eq("is_active", true)
        .in("product_type", ["combo-sets", "top-bottom-sets"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Catalog] Error fetching combo sets:", error.message);
        return [];
      }
      return ((data ?? []) as unknown as RawDbProduct[]).map(mapDbProductToUiProduct);
    }

    // Database collection lookup
    const { data, error } = await supabase
      .from("product_collections")
      .select(
        `product_id, collections!inner (id, slug, name, is_active), products!inner (${PRODUCT_SELECT_FIELDS})`,
      )
      .eq("collections.slug", slug)
      .eq("products.is_active", true);

    if (error) {
      console.error("[Catalog] Error fetching collection products:", error.message);
      return [];
    }

    return (data ?? []).map((entry) =>
      mapDbProductToUiProduct(
        (entry as unknown as { products: RawDbProduct }).products
      )
    );
  } catch (err) {
    console.error("[Catalog] Failed to load collection products:", err);
    return [];
  }
}

export async function getLatestActiveProducts(limit: number = 4): Promise<Product[]> {
  try {
    const supabase = await getPublicCatalogClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Catalog] Error fetching latest active products:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as RawDbProduct[]).map(mapDbProductToUiProduct);
  } catch (err) {
    console.error("[Catalog] Failed to load latest active products:", err);
    return [];
  }
}

export async function getBestSellers(limit: number = 4): Promise<Product[]> {
  try {
    const supabase = await getPublicCatalogClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("is_active", true)
      .eq("is_best_seller", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Catalog] Error fetching best sellers:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as RawDbProduct[]).map(mapDbProductToUiProduct);
  } catch (err) {
    console.error("[Catalog] Failed to load best sellers:", err);
    return [];
  }
}

export async function getRelatedProducts(
  product: Product,
  limit: number = 4
): Promise<Product[]> {
  try {
    const supabase = await getPublicCatalogClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("is_active", true)
      .eq("audience", product.category)
      .neq("id", product.id)
      .limit(limit);

    if (error) {
      console.error("[Catalog] Error fetching related products:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as RawDbProduct[]).map(mapDbProductToUiProduct);
  } catch (err) {
    console.error("[Catalog] Failed to load related products:", err);
    return [];
  }
}

export async function getCompleteTheLookProducts(
  product: Product
): Promise<Product[]> {
  try {
    const supabase = await getPublicCatalogClient();

    const targetType = product.productType === "t-shirts" ? "trousers" : "t-shirts";

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("is_active", true)
      .eq("product_type", targetType)
      .neq("id", product.id)
      .limit(2);

    if (error) {
      console.error("[Catalog] Error fetching complete the look products:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as RawDbProduct[]).map(mapDbProductToUiProduct);
  } catch (err) {
    console.error("[Catalog] Failed to load complete the look products:", err);
    return [];
  }
}

export async function searchProductsCatalog(query: string): Promise<Product[]> {
  if (!query || query.trim() === "") return [];

  try {
    const supabase = await getPublicCatalogClient();
    const cleanQuery = query.trim().replace(/[(),]/g, " ");

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("is_active", true)
      .or(
        `name.ilike.%${cleanQuery}%,short_description.ilike.%${cleanQuery}%,product_type.ilike.%${cleanQuery}%,audience.ilike.%${cleanQuery}%,fit.ilike.%${cleanQuery}%`,
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("[Catalog] Error searching catalog:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as RawDbProduct[]).map(mapDbProductToUiProduct);
  } catch (err) {
    console.error("[Catalog] Failed to search catalog:", err);
    return [];
  }
}

export async function getCategories(): Promise<CatalogCategory[]> {
  try {
    const supabase = await getPublicCatalogClient();

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, sort_order, is_active, created_at, updated_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[Catalog] Error fetching categories:", error.message);
      return [];
    }

    return (data ?? []) as CatalogCategory[];
  } catch (err) {
    console.error("[Catalog] Failed to load categories:", err);
    return [];
  }
}
