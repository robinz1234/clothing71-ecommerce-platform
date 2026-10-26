import type { MetadataRoute } from "next";
import {
  getActiveCategories,
  getProducts,
  getCollectionBySlug,
} from "@/lib/catalog";

const siteUrl = "https://www.clothing71bd.com";
const staticPaths = [
  "/",
  "/shop",
  "/collections",
  "/about",
  "/contact",
  "/shipping",
  "/returns-exchanges",
  "/privacy",
  "/terms",
  "/collections/tops",
  "/collections/bottoms",
  "/collections/men",
  "/collections/mens-t-shirts",
  "/collections/mens-drop-shoulder-t-shirts",
  "/collections/mens-shorts",
  "/collections/mens-trousers",
  "/collections/mens-baggy-pants",
  "/collections/women",
  "/collections/kids",
  "/collections/combo-sets",
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const dbCollections = await Promise.all(
    ["men", "women", "kids", "combo-sets"].map((slug) =>
      getCollectionBySlug(slug),
    ),
  );
  const collectionPaths = dbCollections.filter((collection): collection is NonNullable<typeof collection> => Boolean(collection)).map((collection) => `/collections/${collection.slug}`);
  const categories = await getActiveCategories();
  const categoryPaths = categories.map((category) => `/collections/${category.slug}`);
  const paths = [...new Set([...staticPaths, ...collectionPaths, ...categoryPaths])];
  return [...paths.map((path) => ({ url: `${siteUrl}${path}`, lastModified: new Date() })), ...products.map((product) => ({ url: `${siteUrl}/products/${product.slug}`, lastModified: new Date() }))];
}
