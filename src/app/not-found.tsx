import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center px-4 py-24 text-center">
      <span className="font-sans text-8xl font-black tracking-widest text-foreground/10 sm:text-9xl">
        404
      </span>
      <h1 className="mt-4 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
        PAGE NOT FOUND
      </h1>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
        The page you are looking for has been moved or does not exist. Continue exploring our latest export-quality streetwear releases.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="h-11 px-8 text-xs font-bold tracking-widest uppercase">
          <Link href="/shop">
            <ShoppingBag className="mr-2 size-4" />
            Shop Catalog
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-11 px-8 text-xs font-bold tracking-widest uppercase">
          <Link href="/">
            <ArrowLeft className="mr-2 size-4" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
