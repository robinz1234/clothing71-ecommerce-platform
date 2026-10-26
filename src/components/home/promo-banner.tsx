import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="w-full border-b border-border bg-black text-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="relative border border-neutral-800 p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 border border-neutral-700 bg-neutral-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-300">
                <span>CURATED EDITS &middot; COORDINATED SETS</span>
              </div>

              <h2 className="mt-4 font-sans text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl">
                ESSENTIAL COMBO SETS
                <span className="block text-neutral-400">COORDINATED STREETWEAR</span>
              </h2>

              <p className="mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-neutral-300">
                Engineered pairings of our signature drop shoulder tees and relaxed straight or baggy trousers. Curated palettes designed for complete, effortless looks.
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 lg:col-span-4 lg:items-end">
              <div className="text-left lg:text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">CATEGORY</span>
                <p className="text-2xl font-black uppercase tracking-wider sm:text-3xl">COMBO SETS</p>
              </div>

              <Button
                asChild
                size="lg"
                className="h-12 w-full bg-white text-black hover:bg-neutral-200 sm:w-auto px-8 text-xs font-bold tracking-[0.2em]"
              >
                <Link href="/collections/combo-sets">
                  EXPLORE SETS
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
