"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ArrowRight, Phone, MapPin, Mail } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/icons";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { mainNavigation, menNavigation, footerInfoLinks, contactInfo } from "@/data/navigation";
import type { SiteSettings } from "@/types/site-settings";

export function MobileNav({ siteSettings }: { siteSettings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const [menExpanded, setMenExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 xl:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[85vw] max-w-sm flex-col justify-between border-r border-border bg-background p-0 sm:max-w-md"
      >
        <div className="flex flex-1 flex-col overflow-y-auto">
          <SheetHeader className="border-b border-border p-6 text-left">
            <SheetTitle className="sr-only">Clothing71 navigation</SheetTitle>
            <Link href="/" aria-label="Clothing71 home" onClick={() => setOpen(false)}>
              <Image
                src="/brand/clothing71-logo.png"
                alt="Clothing71 - Premium Quality Streetwear"
                width={1014}
                height={733}
                className="h-12 w-auto object-contain"
              />
            </Link>
          </SheetHeader>

          {/* Primary Navigation */}
          <nav className="flex flex-col border-b border-border px-6 py-4" aria-label="Mobile Navigation">
            {mainNavigation.map((item) => {
              if (item.label === "Men") {
                const isMenPage =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`) ||
                  pathname.startsWith("/collections/mens-");
                return (
                  <div key={item.href} className="border-t border-border/60">
                    <button
                      type="button"
                      aria-expanded={menExpanded}
                      onClick={() => setMenExpanded((expanded) => !expanded)}
                      className={`flex min-h-12 w-full items-center justify-between text-sm uppercase tracking-[0.15em] transition-[color,font-weight] duration-150 hover:font-bold hover:text-black hover:underline hover:underline-offset-4 focus-visible:font-bold focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                        isMenPage ? "font-bold underline underline-offset-4" : "font-semibold"
                      }`}
                    >
                      <span>Men</span>
                      <ArrowRight className={`size-4 opacity-40 transition-transform ${menExpanded ? "rotate-90" : ""}`} />
                    </button>
                    {menExpanded && (
                      <div className="grid gap-1 border-l border-border pb-2 pl-4">
                        {menNavigation.map((subitem) => {
                          const active =
                            !subitem.href.includes("#") &&
                            pathname === subitem.href;

                          return (
                            <SheetClose asChild key={subitem.href}>
                              <Link
                                href={subitem.href}
                                aria-current={active ? "page" : undefined}
                                className={`flex min-h-11 items-center text-xs uppercase tracking-wider text-muted-foreground transition-[color,font-weight] duration-150 hover:font-bold hover:text-black hover:underline hover:underline-offset-4 focus-visible:font-bold focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                                  active
                                    ? "font-bold text-foreground underline underline-offset-4"
                                    : "font-medium"
                                }`}
                              >
                                {subitem.label}
                              </Link>
                            </SheetClose>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const active =
                !item.href.includes("#") && pathname === item.href;

              return (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center justify-between text-sm uppercase tracking-[0.15em] transition-[color,font-weight] duration-150 hover:font-bold hover:text-black hover:underline hover:underline-offset-4 focus-visible:font-bold focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                      active
                        ? "font-bold underline underline-offset-4"
                        : "font-semibold"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="size-4 opacity-40" />
                  </Link>
                </SheetClose>
              );
            })}
            <SheetClose asChild>
              <Link
                href="/account"
                className="mt-1 flex items-center justify-between border-t border-border/60 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-foreground transition-[color,font-weight] duration-150 hover:font-bold hover:text-black hover:underline hover:underline-offset-4 focus-visible:font-bold focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <span>My Account</span>
                <ArrowRight className="size-4 opacity-40" />
              </Link>
            </SheetClose>
          </nav>

          {/* Secondary Info Links */}
          <div className="flex flex-col px-6 py-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Customer Care
            </p>
            <div className="grid grid-cols-1 gap-2">
              {footerInfoLinks.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className="py-1 text-xs text-muted-foreground transition-[color,font-weight] duration-150 hover:font-bold hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:font-bold focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Contact & Social */}
        <div className="border-t border-border bg-muted/40 p-6">
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-foreground" />
              <span>{contactInfo.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-3.5 text-foreground" />
              <a href={`tel:${siteSettings.supportPhone}`} className="hover:text-foreground">
                {siteSettings.supportPhone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-3.5 text-foreground" />
              <a href={`mailto:${siteSettings.supportEmail}`} className="hover:text-foreground">
                {siteSettings.supportEmail}
              </a>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
            <a
              href={siteSettings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex size-8 items-center justify-center border border-border bg-background transition-colors hover:bg-foreground hover:text-background"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={siteSettings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex size-8 items-center justify-center border border-border bg-background transition-colors hover:bg-foreground hover:text-background"
            >
              <FacebookIcon className="size-4" />
            </a>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              @clothing.71bd
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
