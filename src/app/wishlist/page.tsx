import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved Wishlist | CLOTHING71",
  description:
    "View your saved Clothing71 export-quality streetwear garments and saved favorites.",
};

export default async function WishlistPage() {
  const catalogProducts = await getProducts();
  return <WishlistView catalogProducts={catalogProducts} />;
}
