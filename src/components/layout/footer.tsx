import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Truck } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/icons";
import {
  footerShopLinks,
  footerInfoLinks,
  footerLegalLinks,
  contactInfo,
} from "@/data/navigation";
import type { SiteSettings } from "@/types/site-settings";

export function Footer({ siteSettings }: { siteSettings: SiteSettings }) {
  return (
    <footer className="w-full border-t border-border bg-background text-foreground">
      {/* Top Banner: Service Highlights */}
      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-y-0 sm:divide-x sm:divide-border">
          <div className="flex items-center gap-3.5 p-6 sm:justify-center">
            <Truck className="size-5 shrink-0 text-foreground" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em]">Nationwide Delivery</p>
              <p className="text-[11px] text-muted-foreground">Reliable delivery across Bangladesh via Pathao Courier</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-6 sm:justify-center">
            <span className="flex size-5 items-center justify-center font-bold text-xs">৳</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em]">Cash on Delivery</p>
              <p className="text-[11px] text-muted-foreground">Pay comfortably at your doorstep across BD</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-6 sm:justify-center">
            <span className="flex size-5 items-center justify-center border border-foreground text-[10px] font-bold">HQ</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em]">Own Factory Crafted</p>
              <p className="text-[11px] text-muted-foreground">Direct export-quality fashion from Dhaka</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-12 lg:py-24">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 & 2: Brand Description */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              aria-label="Clothing71 home"
              className="inline-flex bg-white"
            >
              <Image
                src="/brand/clothing71-logo.png"
                alt="Clothing71"
                width={1014}
                height={733}
                sizes="(min-width: 1024px) 144px, 128px"
                className="h-auto w-32 object-contain sm:w-36"
              />
            </Link>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              PREMIUM QUALITY STREETWEAR
            </p>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-muted-foreground">
              Clothing71 is a premium clothing brand dedicated to delivering export-quality fashion. Every piece is carefully designed and manufactured in our own factory, ensuring premium quality, superior craftsmanship, and attention to every detail.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href={siteSettings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Clothing71 on Instagram"
                className="flex size-9 items-center justify-center border border-border bg-background transition-colors hover:bg-foreground hover:text-background"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href={siteSettings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Clothing71 on Facebook"
                className="flex size-9 items-center justify-center border border-border bg-background transition-colors hover:bg-foreground hover:text-background"
              >
                <FacebookIcon className="size-4" />
              </a>
              <a
                href={siteSettings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Clothing71 on TikTok"
                className="flex h-9 px-3 items-center justify-center border border-border bg-background text-[11px] font-bold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background"
              >
                TikTok
              </a>
            </div>
          </div>

          {/* Col 3: Shop Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              Collections
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerShopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-[color,font-weight] duration-150 hover:font-bold hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:font-bold focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Customer Care */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              Customer Care
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerInfoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-[color,font-weight] duration-150 hover:font-bold hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:font-bold focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              Contact & Factory
            </h3>
            <div className="mt-4 space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <MapPin className="size-4 shrink-0 text-foreground" />
                <span>{contactInfo.location}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="size-4 shrink-0 text-foreground" />
                <div>
                  <a href={`tel:${siteSettings.supportPhone}`} className="hover:text-foreground">
                    {siteSettings.supportPhone}
                  </a>
                  <a href={`https://wa.me/${siteSettings.whatsappPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block text-[10px] text-muted-foreground hover:text-foreground">Available on WhatsApp</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="size-4 shrink-0 text-foreground" />
                <a href={`mailto:${siteSettings.supportEmail}`} className="break-all hover:text-foreground">
                  {siteSettings.supportEmail}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="border-t border-border bg-muted/20">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-12">
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} CLOTHING71. ALL RIGHTS RESERVED.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            {footerLegalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] text-muted-foreground transition-[color,font-weight] duration-150 hover:font-bold hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:font-bold focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-center gap-1 sm:items-end text-center sm:text-right">
            <p className="text-[10px] tracking-wider uppercase text-muted-foreground">
              OFFICIAL LOGISTICS: PATHAO COURIER
            </p>
            <p className="text-[10px] tracking-tight text-muted-foreground/45 select-text font-normal">
              Programmed by Tajwar Al Haque Robin
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
