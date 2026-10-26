import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/api", "/checkout", "/order-confirmation", "/login", "/register", "/forgot-password", "/update-password"] }], sitemap: "https://www.clothing71bd.com/sitemap.xml" };
}
