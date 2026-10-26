import type { Metadata } from "next";
import Link from "next/link";
import { mainNavigation } from "@/data/navigation";
import { getActiveCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Collections | CLOTHING71",
  description: "Browse Clothing71's core collections and published categories.",
  alternates: { canonical: "/collections" },
};

const curatedCollections = mainNavigation.filter(
  ({ label }) =>
    label !== "Shop" && label !== "Featured" && label !== "All Collections",
);

const curatedSlugs = new Set(
  curatedCollections.map(({ href }) => href.slice(href.lastIndexOf("/") + 1)),
);

export default async function AllCollectionsPage() {
  const categories = await getActiveCategories();
  const additionalCategories = categories.filter(
    (category) => !curatedSlugs.has(category.slug),
  );

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 lg:px-12 lg:py-20">
      <header className="border-b border-border pb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          CLOTHING71
        </p>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">
          All Collections
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Explore our core edits and the latest published collections.
        </p>
      </header>

      <section aria-label="Core collections" className="py-8">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {curatedCollections.map((collection) => (
            <li key={collection.href}>
              <Link
                href={collection.href}
                className="flex min-h-24 items-center justify-between border border-border p-5 text-sm font-bold uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
              >
                {collection.label}
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {additionalCategories.length > 0 && (
        <section aria-labelledby="published-categories-heading" className="border-t border-border pt-8">
          <h2
            id="published-categories-heading"
            className="text-lg font-black uppercase tracking-tight"
          >
            Published Categories
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {additionalCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/collections/${category.slug}`}
                  className="group flex min-h-24 flex-col justify-center border border-border p-5 transition-colors hover:bg-foreground hover:text-background"
                >
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {category.name}
                  </span>
                  {category.description && (
                    <span className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground group-hover:text-background">
                      {category.description}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
