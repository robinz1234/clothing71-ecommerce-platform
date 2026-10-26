import { Factory, ShieldCheck, Shirt, Truck } from "lucide-react";

export function WhyClothing71() {
  const pillars = [
    {
      icon: Factory,
      title: "IN-HOUSE FACTORY",
      description:
        "Every garment is designed, cut, and stitched in our own Dhaka facility. Direct from source with end-to-end quality control.",
    },
    {
      icon: ShieldCheck,
      title: "EXPORT QUALITY",
      description:
        "Export-grade finishing, premium fabric selection, and meticulous stitching built for lasting comfort and durability.",
    },
    {
      icon: Shirt,
      title: "STREETWEAR SILHOUETTES",
      description:
        "Engineered drop shoulder, relaxed baggy, and clean straight cuts styled for modern, confident everyday expression.",
    },
    {
      icon: Truck,
      title: "NATIONWIDE PATHAO DELIVERY",
      description:
        "Nationwide delivery via Pathao Courier with reliable Cash on Delivery available at your doorstep across Bangladesh.",
    },
  ];

  return (
    <section className="w-full border-b border-border bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            The Clothing71 Standard
          </span>
          <h2 className="mt-2 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            WHY CLOTHING71
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
            We operate at the intersection of export-grade factory manufacturing and contemporary streetwear culture.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex flex-col border border-border bg-muted/30 p-6 sm:p-8 transition-colors hover:border-foreground"
              >
                <div className="flex size-10 items-center justify-center border border-border bg-background text-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
