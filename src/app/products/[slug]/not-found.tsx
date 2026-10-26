import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <span className="text-6xl font-black tracking-widest text-foreground/10 sm:text-7xl">
        C71
      </span>
      <h1 className="mt-4 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
        PRODUCT NOT FOUND
      </h1>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
        The garment you are looking for may have been archived, renamed, or is temporarily unavailable in our catalog.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="h-11 px-6 text-xs font-bold tracking-widest uppercase">
          <Link href="/shop">
            <ShoppingBag className="mr-2 size-4" />
            Browse Full Catalog
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-11 px-6 text-xs font-bold tracking-widest uppercase">
          <Link href="/">
            <ArrowLeft className="mr-2 size-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
