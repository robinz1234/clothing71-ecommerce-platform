/**
 * Mock product data for UI development.
 *
 * TEMPORARY — This data is placeholder only and does not represent
 * real Clothing71 inventory, pricing, or product details.
 * It will be replaced by Supabase data in Milestone 3.
 */

import type { Product } from "@/types/product";

export const mockProducts: Product[] = [
  {
    id: "p1",
    sku: "C71-TS-M01",
    name: "Essential Crew Neck Tee",
    slug: "essential-crew-neck-tee",
    price: 990,
    category: "men",
    gender: "men",
    productType: "t-shirts",
    collection: ["essentials", "new-arrivals"],
    description:
      "A timeless daily staple cut with modern proportions. Designed and produced in our Dhaka factory using premium combed cotton for breathable, lasting comfort.",
    details: [
      "Ribbed crew neckline that retains shape",
      "Reinforced shoulder-to-shoulder tape",
      "Clean double-needle sleeve and bottom hems",
      "Tagless interior collar for comfort",
    ],
    fabric: "100% Combed Cotton",
    careInstructions: [
      "Machine wash cold with like colors",
      "Do not bleach",
      "Tumble dry low or line dry in shade",
      "Warm iron inside out if needed",
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Navy", hex: "#1B2A4A" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    isNew: true,
    fit: "Regular",
    images: ["/placeholder-front.jpg", "/placeholder-back.jpg", "/placeholder-detail.jpg"],
    relatedProductIds: ["p2", "p3", "p4", "p7"],
    completeTheLookIds: ["p3", "p4"],
  },
  {
    id: "p2",
    sku: "C71-TS-M02",
    name: "Oversized Drop Shoulder Tee",
    slug: "oversized-drop-shoulder-tee",
    price: 1290,
    category: "men",
    gender: "men",
    productType: "t-shirts",
    collection: ["streetwear", "new-arrivals"],
    description:
      "Engineered with an exaggerated shoulder drop and relaxed boxy torso. Delivers an effortless streetwear drape that pairs seamlessly with baggy trousers.",
    details: [
      "Wide drop shoulder construction",
      "Subtle boxy silhouette with relaxed drape",
      "Thick neck ribbing for structured collar",
      "Pre-shrunk fabric to prevent post-wash distortion",
    ],
    fabric: "100% Premium Cotton",
    careInstructions: [
      "Machine wash cold gentle cycle",
      "Wash inside out",
      "Do not tumble dry",
      "Iron low temperature",
    ],
    colors: [
      { name: "Charcoal", hex: "#36454F" },
      { name: "Olive", hex: "#556B2F" },
      { name: "Black", hex: "#000000" },
    ],
    sizes: ["M", "L", "XL", "XXL"],
    inStock: true,
    isNew: true,
    fit: "Drop Shoulder",
    images: ["/placeholder-front.jpg", "/placeholder-back.jpg", "/placeholder-detail.jpg"],
    relatedProductIds: ["p1", "p4", "p7", "p11"],
    completeTheLookIds: ["p4", "p3"],
  },
  {
    id: "p3",
    sku: "C71-TR-M01",
    name: "Classic Straight Fit Trouser",
    slug: "classic-straight-fit-trouser",
    price: 1690,
    compareAtPrice: 1990,
    category: "men",
    gender: "men",
    productType: "trousers",
    collection: ["essentials", "sale"],
    description:
      "Clean-cut straight trousers offering structured versatility from street to casual occasions. Tailored in-house with deep pockets and reinforced seam construction.",
    details: [
      "Mid-rise straight leg cut",
      "Heavy-duty zip fly with secure button closure",
      "Deep slant side pockets and welt back pockets",
      "Belt loops with reinforced bar-tacking",
    ],
    fabric: "Cotton Twill Blend",
    careInstructions: [
      "Machine wash cold with similar colors",
      "Do not bleach",
      "Hang dry",
      "Warm iron if needed",
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Khaki", hex: "#C3B091" },
    ],
    sizes: ["30", "32", "34", "36"],
    inStock: true,
    isBestSeller: true,
    isSale: true,
    fit: "Straight Fit",
    images: ["/placeholder-front.jpg", "/placeholder-back.jpg", "/placeholder-detail.jpg"],
    relatedProductIds: ["p1", "p2", "p4", "p7"],
    completeTheLookIds: ["p1", "p2"],
  },
  {
    id: "p4",
    sku: "C71-TR-M02",
    name: "Premium Baggy Cargo",
    slug: "premium-baggy-cargo",
    price: 1890,
    category: "men",
    gender: "men",
    productType: "trousers",
    collection: ["streetwear", "new-arrivals"],
    description:
      "A streetwear staple engineered with generous volume through the thigh and leg. Features multiple functional utility pockets with tonal topstitching.",
    details: [
      "Relaxed baggy silhouette with slight taper at hem",
      "Dual cargo side pockets with secure flap closures",
      "Elasticated waistband with tonal internal drawcord",
      "Durable reinforced knee paneling",
    ],
    fabric: "Durable Cotton Canvas",
    careInstructions: [
      "Machine wash cold inside out",
      "Do not bleach",
      "Line dry in shade",
      "Medium iron",
    ],
    colors: [
      { name: "Olive", hex: "#556B2F" },
      { name: "Black", hex: "#000000" },
    ],
    sizes: ["30", "32", "34", "36"],
    inStock: true,
    isNew: true,
    isBestSeller: true,
    fit: "Baggy",
    images: ["/placeholder-front.jpg", "/placeholder-back.jpg", "/placeholder-detail.jpg"],
    relatedProductIds: ["p2", "p3", "p7", "p11"],
    completeTheLookIds: ["p2", "p11"],
  },
  {
    id: "p5",
    sku: "C71-TS-W01",
    name: "Minimal Logo Tee",
    slug: "minimal-logo-tee",
    price: 990,
    category: "women",
    gender: "women",
    productType: "t-shirts",
    collection: ["essentials", "new-arrivals"],
    description:
      "A refined minimal tee for everyday ease. Cut from soft combed cotton with a relaxed feminine silhouette that styles effortlessly with wide trousers or denim.",
    details: [
      "Crew neckline with delicate ribbing",
      "Subtle blind-stitched hem finish",
      "Lightweight yet opaque premium knit",
      "Pre-shrunk fabric construction",
    ],
    fabric: "100% Combed Cotton",
    careInstructions: [
      "Machine wash cold gentle",
      "Wash with like colors",
      "Do not bleach",
      "Iron low on reverse",
    ],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Blush", hex: "#DE9E9E" },
      { name: "Black", hex: "#000000" },
    ],
    sizes: ["XS", "S", "M", "L"],
    inStock: true,
    isNew: true,
    fit: "Regular",
    images: ["/placeholder-front.jpg", "/placeholder-back.jpg", "/placeholder-detail.jpg"],
    relatedProductIds: ["p6", "p9", "p1"],
    completeTheLookIds: ["p6"],
  },
  {
    id: "p6",
    sku: "C71-TR-W01",
    name: "Relaxed Wide Leg Trouser",
    slug: "relaxed-wide-leg-trouser",
    price: 1590,
    category: "women",
    gender: "women",
    productType: "trousers",
    collection: ["streetwear", "essentials"],
    description:
      "High-rise wide leg trousers designed with fluid drape and tailored pleating. The ultimate cross-functional pant for elevated streetwear style.",
    details: [
      "High-rise fit with relaxed wide leg cut",
      "Front pleat detailing for enhanced drape",
      "Side slant pockets and rear faux welt pockets",
      "Clean concealed hook and zip fastening",
    ],
    fabric: "Cotton Poly Blend",
    careInstructions: [
      "Machine wash cold gentle cycle",
      "Hang to dry",
      "Do not tumble dry",
      "Iron low heat",
    ],
    colors: [
      { name: "Beige", hex: "#D2B48C" },
      { name: "Black", hex: "#000000" },
    ],
    sizes: ["26", "28", "30", "32"],
    inStock: true,
    isBestSeller: true,
    fit: "Loose Fit",
    images: ["/placeholder-front.jpg", "/placeholder-back.jpg", "/placeholder-detail.jpg"],
    relatedProductIds: ["p5", "p9", "p3"],
    completeTheLookIds: ["p5", "p9"],
  },
  {
    id: "p7",
    sku: "C71-CB-M01",
    name: "Essential Combo Set",
    slug: "essential-combo-set",
    price: 2490,
    compareAtPrice: 2980,
    category: "men",
    gender: "men",
    productType: "combo-sets",
    collection: ["combo-sets", "sale"],
    description:
      "Our signature Drop Shoulder Tee matched with Classic Straight Trousers. Curated for effortless tone-on-tone dressing with immediate styling harmony.",
    details: [
      "Includes 1 Drop Shoulder Tee and 1 Straight Trouser",
      "Color-matched tonal or complementary pairing",
      "In-house factory precision construction",
      "Discounted bundle value compared to individual pieces",
    ],
    fabric: "Combed Cotton & Cotton Twill",
    careInstructions: [
      "Follow individual care tags on tee and trouser",
      "Wash dark colors separately",
      "Line dry in shade",
    ],
    colors: [
      { name: "Black + White", hex: "#000000" },
      { name: "Navy + Grey", hex: "#1B2A4A" },
    ],
    sizes: ["M", "L", "XL"],
    inStock: true,
    isBestSeller: true,
    isSale: true,
    fit: "Regular",
    images: ["/placeholder-front.jpg", "/placeholder-back.jpg", "/placeholder-detail.jpg"],
    relatedProductIds: ["p1", "p2", "p3", "p12"],
    completeTheLookIds: ["p1", "p4"],
  },
  {
    id: "p8",
    sku: "C71-TS-K01",
    name: "Street Drop Shoulder Tee",
    slug: "street-drop-shoulder-tee",
    price: 890,
    category: "kids",
    gender: "kids",
    productType: "t-shirts",
    collection: ["kids-street", "new-arrivals"],
    description:
      "A streetwear-inspired tee for kids. Cut with a comfortable drop shoulder fit using durable, breathable cotton that withstands active daily play.",
    details: [
      "Drop shoulder relaxed cut",
      "Durable neck ribbing with soft touch seam",
      "Colorfast dye treatment",
      "Skin-friendly breathable cotton",
    ],
    fabric: "100% Combed Cotton",
    careInstructions: [
      "Machine wash warm with like colors",
      "Tumble dry low",
      "Do not bleach",
    ],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Sky Blue", hex: "#87CEEB" },
    ],
    sizes: ["4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    inStock: true,
    isNew: true,
    fit: "Drop Shoulder",
    images: ["/placeholder-front.jpg", "/placeholder-back.jpg", "/placeholder-detail.jpg"],
    relatedProductIds: ["p10", "p12"],
    completeTheLookIds: ["p10"],
  },
  {
    id: "p9",
    sku: "C71-TS-W02",
    name: "Classic Cotton Tee",
    slug: "classic-cotton-tee",
    price: 890,
    category: "women",
    gender: "women",
    productType: "t-shirts",
    collection: ["essentials"],
    description:
      "Everyday basic tee with a balanced cut and premium soft handfeel. Designed for layering or wearing on its own.",
    details: [
      "Standard fit with flattering shoulder line",
      "Fine ribbed crew collar",
      "Durable twin-needle hem",
      "Breathable lightweight knit",
    ],
    fabric: "100% Combed Cotton",
    careInstructions: [
      "Machine wash cold gentle",
      "Do not bleach",
      "Tumble dry low",
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Sage", hex: "#9CAF88" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    inStock: true,
    isBestSeller: true,
    fit: "Regular",
    images: ["/placeholder-front.jpg", "/placeholder-back.jpg", "/placeholder-detail.jpg"],
    relatedProductIds: ["p5", "p6", "p1"],
    completeTheLookIds: ["p6"],
  },
  {
    id: "p10",
    sku: "C71-TR-K01",
    name: "Urban Loose Fit Trouser",
    slug: "urban-loose-fit-trouser",
    price: 1490,
    category: "kids",
    gender: "kids",
    productType: "trousers",
    collection: ["kids-street"],
    description:
      "Comfortable loose fit pants for kids with an elastic waistband and drawstring for easy pull-on dressing. Made from resilient cotton twill.",
    details: [
      "Elasticated waistband with functional cord",
      "Generous loose leg cut for mobility",
      "Side pockets and cargo accent pocket",
      "Reinforced knee seam for durability",
    ],
    fabric: "Cotton Twill",
    careInstructions: [
      "Machine wash cold",
      "Wash inside out",
      "Tumble dry low",
    ],
    colors: [
      { name: "Grey", hex: "#808080" },
      { name: "Navy", hex: "#1B2A4A" },
    ],
    sizes: ["6-7Y", "8-9Y", "10-11Y", "12-13Y"],
    inStock: false, // demonstrates Sold Out state
    isNew: true,
    fit: "Loose Fit",
    images: ["/placeholder-front.jpg", "/placeholder-back.jpg", "/placeholder-detail.jpg"],
    relatedProductIds: ["p8", "p12"],
    completeTheLookIds: ["p8"],
  },
  {
    id: "p11",
    sku: "C71-TS-M03",
    name: "Premium Loose Fit Tee",
    slug: "premium-loose-fit-tee",
    price: 1190,
    category: "men",
    gender: "men",
    productType: "t-shirts",
    collection: ["streetwear"],
    description:
      "Roomy boxy silhouette with clean shoulder cut. Crafted from heavyweight combed cotton for structured drape without bulk.",
    details: [
      "Relaxed loose fit body with drop sleeve",
      "Chunky ribbed collar",
      "Reinforced neckline band",
      "High density fabric with smooth finish",
    ],
    fabric: "100% Combed Cotton",
    careInstructions: [
      "Machine wash cold gentle cycle",
      "Do not bleach",
      "Hang dry recommended",
    ],
    colors: [
      { name: "Stone", hex: "#928E85" },
      { name: "Black", hex: "#000000" },
    ],
    sizes: ["M", "L", "XL", "XXL"],
    inStock: true,
    isBestSeller: true,
    fit: "Loose Fit",
    images: ["/placeholder-front.jpg", "/placeholder-back.jpg", "/placeholder-detail.jpg"],
    relatedProductIds: ["p1", "p2", "p4", "p7"],
    completeTheLookIds: ["p4", "p3"],
  },
  {
    id: "p12",
    sku: "C71-TB-K01",
    name: "Kids Top Bottom Set",
    slug: "kids-top-bottom-set",
    price: 1690,
    compareAtPrice: 1880,
    category: "kids",
    gender: "kids",
    productType: "top-bottom-sets",
    collection: ["kids-street", "sale"],
    description:
      "A complete matching two-piece set featuring a breathable cotton tee and coordinating pull-on bottoms. Designed for everyday comfort and style.",
    details: [
      "Two-piece coordinated set",
      "Easy pull-on elastic bottom",
      "Soft crewneck tee with reinforced stitching",
      "Export grade cotton construction",
    ],
    fabric: "100% Cotton",
    careInstructions: [
      "Machine wash warm",
      "Tumble dry low",
      "Wash with like colors",
    ],
    colors: [
      { name: "Navy + White", hex: "#1B2A4A" },
      { name: "Black + Grey", hex: "#000000" },
    ],
    sizes: ["4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    inStock: true,
    isSale: true,
    isBestSeller: true,
    fit: "Regular",
    images: ["/placeholder-front.jpg", "/placeholder-back.jpg", "/placeholder-detail.jpg"],
    relatedProductIds: ["p8", "p10"],
    completeTheLookIds: ["p8", "p10"],
  },
];

// --- Query & Filter Helpers ---

export function getAllProducts(): Product[] {
  return mockProducts;
}

export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export function getNewArrivals(): Product[] {
  return mockProducts.filter((p) => p.isNew);
}

export function getBestSellers(): Product[] {
  return mockProducts.filter((p) => p.isBestSeller);
}

export function getSaleProducts(): Product[] {
  return mockProducts.filter((p) => p.isSale || (p.compareAtPrice && p.compareAtPrice > p.price));
}

export function getProductsByCategory(category: string): Product[] {
  const cat = category.toLowerCase();
  return mockProducts.filter((p) => p.category.toLowerCase() === cat);
}

export function getProductsByCollection(collectionSlug: string): Product[] {
  const slug = collectionSlug.toLowerCase();
  if (slug === "men" || slug === "women" || slug === "kids") {
    return getProductsByCategory(slug);
  }
  if (slug === "new-arrivals") {
    return getNewArrivals();
  }
  if (slug === "sale") {
    return getSaleProducts();
  }
  if (slug === "combo-sets") {
    return mockProducts.filter((p) => p.productType === "combo-sets" || p.productType === "top-bottom-sets");
  }
  // Generic collection lookup
  return mockProducts.filter((p) => {
    if (!p.collection) return false;
    if (Array.isArray(p.collection)) {
      return p.collection.some((c) => c.toLowerCase() === slug);
    }
    return p.collection.toLowerCase() === slug;
  });
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  if (product.relatedProductIds && product.relatedProductIds.length > 0) {
    const related = mockProducts.filter((p) => product.relatedProductIds?.includes(p.id));
    if (related.length >= limit) return related.slice(0, limit);
  }
  // Fallback to same category
  return mockProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export function getCompleteTheLookProducts(product: Product): Product[] {
  if (product.completeTheLookIds && product.completeTheLookIds.length > 0) {
    return mockProducts.filter((p) => product.completeTheLookIds?.includes(p.id));
  }
  // If product is a T-Shirt, complete with a Trouser, and vice versa
  if (product.productType === "t-shirts") {
    return mockProducts.filter((p) => p.category === product.category && p.productType === "trousers").slice(0, 2);
  }
  if (product.productType === "trousers") {
    return mockProducts.filter((p) => p.category === product.category && p.productType === "t-shirts").slice(0, 2);
  }
  return [];
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return mockProducts.filter((p) => {
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.productType.toLowerCase().includes(q) ||
      (typeof p.fit === "string" && p.fit.toLowerCase().includes(q)) ||
      p.colors.some((c) => c.name.toLowerCase().includes(q)) ||
      (Array.isArray(p.collection)
        ? p.collection.some((col) => col.toLowerCase().includes(q))
        : p.collection?.toLowerCase().includes(q))
    );
  });
}
