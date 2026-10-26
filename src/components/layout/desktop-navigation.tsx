"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavigation, menNavigation } from "@/data/navigation";

function isCurrentPath(pathname: string, href: string) {
  if (href.includes("#")) return false;
  if (pathname === href) return true;
  return href === "/collections/men" && pathname.startsWith("/collections/mens-");
}

const linkStyles =
  "text-[11px] font-medium uppercase tracking-[0.12em] transition-[color,font-weight] duration-150 hover:font-bold hover:text-black hover:underline hover:underline-offset-4 focus-visible:rounded-none focus-visible:font-bold focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground";

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden xl:flex xl:items-center xl:gap-3 2xl:gap-4"
      aria-label="Main navigation"
    >
      {mainNavigation.map((item) => {
        if (item.label === "Men") {
          const isMenPage =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            pathname.startsWith("/collections/mens-");

          return (
            <details key={item.href} className="group relative">
              <summary
                aria-current={isMenPage ? "page" : undefined}
                className={`${linkStyles} cursor-pointer list-none [&::-webkit-details-marker]:hidden ${
                  isMenPage ? "font-bold underline underline-offset-4" : ""
                }`}
              >
                Men
              </summary>
              <div className="absolute left-0 top-full z-50 hidden min-w-56 border border-border bg-background py-2 group-open:block group-hover:block group-focus-within:block">
                {menNavigation.map((subitem) => {
                  const active = isCurrentPath(pathname, subitem.href);
                  return (
                    <Link
                      key={subitem.href}
                      href={subitem.href}
                      aria-current={active ? "page" : undefined}
                      className={`block px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-[color,font-weight] duration-150 hover:bg-muted hover:font-bold hover:text-black hover:underline hover:underline-offset-4 focus-visible:font-bold focus-visible:underline focus-visible:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-foreground ${
                        active ? "font-bold underline underline-offset-4" : ""
                      }`}
                    >
                      {subitem.label}
                    </Link>
                  );
                })}
              </div>
            </details>
          );
        }

        const active = isCurrentPath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${linkStyles} ${
              active ? "font-bold underline underline-offset-4" : ""
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
