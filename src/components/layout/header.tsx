import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "@/components/layout/mobile-nav";
import { HeaderActions } from "@/components/layout/header-actions";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import type { SiteSettings } from "@/types/site-settings";

export function Header({ siteSettings }: { siteSettings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm transition-all">
      <div className="mx-auto grid h-14 max-w-[1440px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-4 sm:px-6 lg:h-16 lg:px-10">
        <div className="flex min-w-0 items-center justify-self-start gap-5">
          <MobileNav siteSettings={siteSettings} />
          <DesktopNavigation />
        </div>

        <div className="flex items-center justify-self-center">
          <Link
            href="/"
            aria-label="Clothing71 home"
            className="flex items-center justify-center bg-white transition-opacity hover:opacity-80"
          >
            <Image
              src="/brand/clothing71-logo.png"
              alt="Clothing71 - Premium Quality Streetwear"
              width={1014}
              height={733}
              sizes="(min-width: 1024px) 78px, 72px"
              loading="eager"
              className="h-10 w-auto object-contain sm:h-11 lg:h-12"
            />
          </Link>
        </div>

        <div className="justify-self-end">
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
