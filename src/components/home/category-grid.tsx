import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface CategoryItem {
  title: string;
  href: string;
  image: string;
  alt: string;
}

const categories: CategoryItem[] = [
  {
    title: "Tops",
    href: "/collections/tops",
    image: "/homepage-view/categories/clothing71-homepage-category-tops.jpg",
    alt: "Clothing71 streetwear tops modeled in the city",
  },
  {
    title: "Bottoms",
    href: "/collections/bottoms",
    image: "/homepage-view/categories/clothing71-homepage-category-bottoms.jpg",
    alt: "Clothing71 streetwear bottoms modeled in the city",
  },
  {
    title: "Kids",
    href: "/collections/kids",
    image: "/homepage-view/categories/clothing71-homepage-category-kids.jpg",
    alt: "Clothing71 kids collection modeled by three children",
  },
];

export function CategoryGrid() {
  return (
    <section aria-label="Shop by category" className="w-full">
      <div className="grid grid-cols-2 gap-px bg-background md:grid-cols-3">
        {categories.map((cat, index) => (
          <Link
            key={cat.title}
            href={cat.href}
            className={`group relative isolate flex aspect-[3/4] min-w-0 flex-col justify-end overflow-hidden bg-muted text-white focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white ${
              index === categories.length - 1
                ? "col-span-2 aspect-[16/9] md:col-span-1 md:aspect-[4/5]"
                : "md:aspect-[4/5]"
            }`}
          >
            <Image
              src={cat.image}
              alt={cat.alt}
              fill
              sizes="(max-width: 767px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
            />
            <div className="relative z-10 flex items-center justify-between gap-2 p-4 sm:p-6">
              <h2 className="font-sans text-2xl font-black uppercase tracking-tight text-white sm:text-3xl lg:text-4xl">
                {cat.title}
              </h2>
              <span className="flex size-9 shrink-0 items-center justify-center border border-white text-white transition-colors group-hover:bg-white group-hover:text-black sm:size-10">
                <ArrowRight aria-hidden="true" className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
