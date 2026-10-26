import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getCategoryBySlug,
  getCategoryProducts,
  getCollectionBySlug,
  getCollectionProducts,
} from "@/lib/catalog";
import { CatalogView } from "@/components/catalog/catalog-view";

export const dynamic = "force-dynamic";

const collectionMeta: Record<
  string,
  { title: string; description: string; fixedCategory?: string }
> = {
  tops: {
    title: "TOPS",
    description: "Explore Clothing71 T-shirts and streetwear tops.",
  },
  bottoms: {
    title: "BOTTOMS",
    description: "Explore Clothing71 trousers and shorts.",
  },
  men: {
    title: "MEN'S COLLECTION",
    description:
      "Oversized drop-shoulder tees, straight trousers, and baggy cargos engineered in our Dhaka factory.",
    fixedCategory: "men",
  },
  "mens-t-shirts": {
    title: "MEN'S T-SHIRTS",
    description: "Shop men's T-shirts from the verified Clothing71 catalog.",
  },
  "mens-drop-shoulder-t-shirts": {
    title: "MEN'S DROP SHOULDER T-SHIRTS",
    description:
      "Shop men's Drop Shoulder T-shirts filtered by verified product fit.",
  },
  "mens-shorts": {
    title: "MEN'S SHORTS",
    description: "Shop men's shorts from the verified Clothing71 catalog.",
  },
  "mens-trousers": {
    title: "MEN'S TROUSERS",
    description: "Shop men's trousers from the verified Clothing71 catalog.",
  },
  "mens-baggy-pants": {
    title: "MEN'S BAGGY PANTS",
    description: "Shop verified Baggy-fit men's trousers from Clothing71.",
  },
  women: {
    title: "WOMEN'S COLLECTION",
    description:
      "Relaxed minimal tees and wide-leg trousers tailored with modern streetwear drape.",
    fixedCategory: "women",
  },
  kids: {
    title: "KIDS' COLLECTION",
    description:
      "Street-inspired drop-shoulder tees, urban trousers, and matching sets built for everyday comfort.",
    fixedCategory: "kids",
  },
  sale: {
    title: "SALE & VALUE SETS",
    description:
      "Special seasonal edits and curated combo sets offering direct-from-factory value.",
  },
  "combo-sets": {
    title: "ESSENTIAL COMBO SETS",
    description:
      "Matching top-and-bottom pairings designed for coordinated tone-on-tone dressing.",
  },
};

export async function generateStaticParams() {
  return [
    { slug: "tops" },
    { slug: "bottoms" },
    { slug: "men" },
    { slug: "mens-t-shirts" },
    { slug: "mens-drop-shoulder-t-shirts" },
    { slug: "mens-shorts" },
    { slug: "mens-trousers" },
    { slug: "mens-baggy-pants" },
    { slug: "women" },
    { slug: "kids" },
    { slug: "new-arrivals" },
    { slug: "sale" },
    { slug: "combo-sets" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  if (normalizedSlug === "new-arrivals") {
    return {
      title: "Shop All | CLOTHING71 Catalog",
      alternates: { canonical: "/shop" },
    };
  }
  const info = collectionMeta[normalizedSlug];

  if (info) {
    return {
      title: info.title,
      description: info.description,
      alternates: { canonical: `/collections/${normalizedSlug}` },
    };
  }

  const dbCategory = await getCategoryBySlug(normalizedSlug);
  if (dbCategory) {
    return {
      title: dbCategory.name.toUpperCase(),
      description:
        dbCategory.description ||
        `Explore ${dbCategory.name} from Clothing71.`,
      alternates: { canonical: `/collections/${dbCategory.slug}` },
    };
  }

  const dbCollection = await getCollectionBySlug(normalizedSlug);
  if (dbCollection) {
    return {
      title: dbCollection.name.toUpperCase(),
      description:
        dbCollection.description ||
        `Explore ${dbCollection.name} from Clothing71.`,
      alternates: { canonical: `/collections/${dbCollection.slug}` },
    };
  }

  return {
    title: `${slug.replace("-", " ").toUpperCase()} | CLOTHING71`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  if (normalizedSlug === "new-arrivals") redirect("/shop");
  const info = collectionMeta[normalizedSlug];

  let title = info?.title;
  let description = info?.description;
  let categoryId: string | null = null;

  if (!info) {
    const dbCategory = await getCategoryBySlug(normalizedSlug);
    if (dbCategory) {
      categoryId = dbCategory.id;
      title = dbCategory.name.toUpperCase();
      description =
        dbCategory.description ||
        `Curated garments and essentials from our in-house Dhaka factory.`;
    } else {
      const dbCollection = await getCollectionBySlug(normalizedSlug);
      if (!dbCollection) {
        notFound();
      }
      title = dbCollection.name.toUpperCase();
      description =
        dbCollection.description ||
        `Curated garments and essentials from our in-house Dhaka factory.`;
    }
  }

  const products = categoryId
    ? await getCategoryProducts(categoryId)
    : await getCollectionProducts(normalizedSlug);
  if (normalizedSlug === "sale" && products.length === 0) redirect("/shop");

  return (
    <CatalogView
      title={
        title || `${normalizedSlug.replace("-", " ").toUpperCase()} COLLECTION`
      }
      description={description}
      initialProducts={products}
      fixedCategory={info?.fixedCategory}
      collectionSlug={normalizedSlug}
    />
  );
}
