/**
 * Navigation and site-wide data configuration.
 *
 * Centralized so components share the same link structure
 * and data can later be sourced from a CMS or database.
 */

export type NavItem = {
  label: string;
  href: string;
};

// --- Main Navigation ---

export const mainNavigation: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "All Collections", href: "/collections" },
  { label: "Tops", href: "/collections/tops" },
  { label: "Bottoms", href: "/collections/bottoms" },
  { label: "Kids", href: "/collections/kids" },
  { label: "Men", href: "/collections/men" },
  { label: "Featured", href: "/#featured-picks" },
];

export const menNavigation: NavItem[] = [
  { label: "All Men's", href: "/collections/men" },
  { label: "T-Shirts", href: "/collections/mens-t-shirts" },
  { label: "Drop Shoulder T-Shirts", href: "/collections/mens-drop-shoulder-t-shirts" },
  { label: "Shorts", href: "/collections/mens-shorts" },
  { label: "Trousers", href: "/collections/mens-trousers" },
  { label: "Baggy Pants", href: "/collections/mens-baggy-pants" },
];

// --- Footer Link Groups ---

export const footerShopLinks: NavItem[] = [
  { label: "Shop All", href: "/shop" },
  { label: "All Collections", href: "/collections" },
  { label: "Tops", href: "/collections/tops" },
  { label: "Bottoms", href: "/collections/bottoms" },
  { label: "Kids", href: "/collections/kids" },
  { label: "Men", href: "/collections/men" },
  { label: "Featured Picks", href: "/#featured-picks" },
];

export const footerInfoLinks: NavItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns & Exchanges", href: "/returns-exchanges" },
];

export const footerLegalLinks: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

// --- Contact Information ---

export const contactInfo = {
  phone: "+880 1975743106",
  whatsapp: "+880 1975743106",
  email: "info@clothing71bd.com",
  location: "Dhaka, Bangladesh",
} as const;

// --- Social Links ---

export const socialLinks = {
  facebook: "https://www.facebook.com/clothing71bd",
  instagram: "https://www.instagram.com/clothing.71bd",
  tiktok: "https://www.tiktok.com/@clothing.71bd",
} as const;
