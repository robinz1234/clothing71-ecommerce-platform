import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "cn";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { Analytics } from "@/components/analytics";
import { SiteStructuredData } from "@/components/seo/site-structured-data";
import { getPublicSiteSettings } from "@/lib/site-settings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "CLOTHING71 — Wear Your Attitude | Export-Quality Fashion",
    template: "%s | CLOTHING71",
  },
  description:
    "Clothing71 is a premium Bangladeshi clothing brand delivering export-quality streetwear and fashion. Designed and manufactured in our own factory in Dhaka.",
  keywords: [
    "Clothing71",
    "Clothing71 Bangladesh",
    "streetwear Dhaka",
    "export quality clothing",
    "premium t-shirts BD",
    "baggy trousers",
    "combo sets BD",
    "wear your attitude",
  ],
  authors: [{ name: "Clothing71" }],
  creator: "Clothing71",
  publisher: "Clothing71",
  metadataBase: new URL("https://www.clothing71bd.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "CLOTHING71 | Wear Your Attitude",
    description:
      "Premium Quality Streetwear. Shop the latest Clothing71 collections.",
    url: "https://www.clothing71bd.com",
    siteName: "CLOTHING71",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.clothing71bd.com/social/clothing71-homepage-share-exact.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "CLOTHING71 — Premium Quality Streetwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CLOTHING71 | Wear Your Attitude",
    description:
      "Premium Quality Streetwear. Shop the latest Clothing71 collections.",
    images: [
      "https://www.clothing71bd.com/social/clothing71-homepage-share-exact.jpg",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = await getPublicSiteSettings();
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn("h-full", inter.variable, "font-sans antialiased")}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground selection:bg-black selection:text-white">
        <AnnouncementBar />
        <Header siteSettings={siteSettings} />
        <main className="flex-1">{children}</main>
        <Footer siteSettings={siteSettings} />
        <CartDrawer />
        <Toaster position="bottom-right" theme="dark" closeButton />
        <SiteStructuredData siteSettings={siteSettings} />
        <Analytics />
      </body>
    </html>
  );
}
