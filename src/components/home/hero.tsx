import Link from "next/link";
import Image, { getImageProps } from "next/image";
import { ArrowRight } from "lucide-react";

const desktopImage = "/homepage-view/hero/clothing71-homepage-hero-desktop.jpg";
const mobileImage = "/homepage-view/hero/clothing71-homepage-hero-mobile.jpg";

const {
  props: { srcSet: desktopImageSrcSet },
} = getImageProps({
  alt: "",
  src: desktopImage,
  width: 1672,
  height: 941,
  sizes: "100vw",
});

export function Hero() {
  return (
    <section className="relative isolate aspect-[4/5] min-h-[420px] max-h-[620px] w-full overflow-hidden bg-black text-white md:aspect-auto md:h-[min(78svh,860px)] md:min-h-[560px]">
      <picture className="absolute inset-0">
        <source
          media="(min-width: 768px)"
          srcSet={desktopImageSrcSet}
          sizes="100vw"
        />
        <Image
          src={mobileImage}
          alt="Clothing71 streetwear campaign featuring models in coordinated looks"
          fill
          sizes="100vw"
          className="object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
      </picture>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/20 md:bg-gradient-to-r md:from-black/65 md:via-black/25 md:to-transparent"
      />

      <div className="absolute inset-x-5 top-7 z-10 max-w-xl sm:inset-x-8 sm:top-10 md:inset-x-auto md:left-8 md:top-1/2 md:max-w-[44%] md:-translate-y-1/2 lg:left-12 lg:max-w-[40%]">
        <h1 className="font-sans text-[clamp(2.3rem,6.2vw,5.5rem)] font-black uppercase leading-[0.92] tracking-[-0.055em] md:text-[clamp(3.5rem,6.2vw,5.5rem)]">
          WEAR YOUR
          <span className="block">ATTITUDE</span>
        </h1>

        <div className="mt-5 sm:mt-6">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center gap-2 border border-white bg-white px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-transparent hover:text-white sm:px-6"
          >
            SHOP NOW
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
