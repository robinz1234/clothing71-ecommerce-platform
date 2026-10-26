import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const catalogImageBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/catalog-images`;

export function EditorialFeature() {
  const specs = [
    "In-House Dhaka Factory Production",
    "Export-Quality Craftsmanship",
    "Streetwear Silhouettes & Fits",
    "Nationwide Pathao Delivery & COD",
  ];

  return (
    <section className="w-full border-b border-border bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* A real catalog campaign image replaces the monogram placeholder. */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[500px] overflow-hidden border border-border bg-muted">
              <Image
                src={`${catalogImageBaseUrl}/products/C71-DNM-BG-CRG-001/gallery/C71-DNM-BG-CRG-001_primary_navy_01.webp`}
                alt="Clothing71 Denim Baggy Cargo in navy"
                fill
                sizes="(max-width: 1023px) 100vw, 40vw"
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Narrative Column */}
          <div className="flex flex-col items-start lg:col-span-7">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Editorial Campaign
            </span>
            <h2 className="mt-3 font-sans text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              MANUFACTURED IN OUR OWN FACTORY.
              <span className="block text-muted-foreground">ZERO COMPROMISE.</span>
            </h2>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Clothing71 is a premium clothing brand dedicated to delivering export-quality fashion. Every piece is carefully designed and manufactured in our own factory, ensuring premium quality, superior craftsmanship, and attention to every detail.
            </p>

            <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {specs.map((spec) => (
                <div key={spec} className="flex items-center gap-2.5 border border-border bg-muted/40 p-3">
                  <div className="flex size-4 shrink-0 items-center justify-center bg-black text-white dark:bg-white dark:text-black">
                    <Check className="size-2.5" />
                  </div>
                  <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
                    {spec}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4">
              <Button asChild size="lg" className="h-12 px-8 text-xs font-bold tracking-[0.2em]">
                <Link href="/about">
                  ABOUT OUR FACTORY
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
