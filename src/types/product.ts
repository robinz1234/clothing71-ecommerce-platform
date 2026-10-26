/**
 * Product type definitions for Clothing71 catalog.
 */

export type ProductColor = {
  name: string;
  hex: string;
  image?: string;
};

export type ProductVariant = {
  id: string;
  sku: string;
  color: ProductColor;
  size: string;
  stockQuantity: number;
  isActive: boolean;
};

export type ProductImage = {
  url: string;
  altText: string;
  role: "primary" | "gallery" | "size_chart";
  color: string | null;
  sortOrder: number;
};

export type ProductSizeGuide = {
  component: "product" | "top" | "bottom";
  size: string;
  waist: string | null;
  length: string | null;
  legOpening: string | null;
  thigh: string | null;
  chest: string | null;
  sleeve: string | null;
  unit: "inches" | "cm";
};

export type ProductQuantityPrice = {
  bundleQuantity: number;
  bundlePriceBdt: number;
};

export type ProductCategory = "men" | "women" | "kids";

export type ProductType =
  | "t-shirts"
  | "trousers"
  | "short-pants"
  | "combo-sets"
  | "top-bottom-sets";

export type ProductFit =
  | "Baggy"
  | "Loose Fit"
  | "Drop Shoulder"
  | "Straight Fit"
  | "Regular";

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: ProductCategory;
  gender: "men" | "women" | "kids" | "unisex";
  audiences?: ProductCategory[];
  collection?: string | string[];
  description: string;
  details: string[];
  price: number;
  compareAtPrice?: number;
  quantityPrices?: ProductQuantityPrice[];
  colors: ProductColor[];
  sizes: string[];
  variants?: ProductVariant[];
  fit: ProductFit | string;
  fabric: string;
  careInstructions: string[];
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isSale?: boolean;
  images: string[];
  productImages?: ProductImage[];
  sizeGuides?: ProductSizeGuide[];
  relatedProductIds?: string[];
  completeTheLookIds?: string[];
  productType: ProductType;
};
