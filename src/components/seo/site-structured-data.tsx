import type { SiteSettings } from "@/types/site-settings";

export function SiteStructuredData({ siteSettings }: { siteSettings: SiteSettings }) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteSettings.businessName,
    url: "https://www.clothing71bd.com",
    slogan: "Wear Your Attitude",
    telephone: siteSettings.supportPhone,
    email: siteSettings.supportEmail,
    address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
    sameAs: [siteSettings.facebookUrl, siteSettings.instagramUrl, siteSettings.tiktokUrl],
  };
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: "Clothing71", url: "https://www.clothing71bd.com" };
  return <><script type="application/ld+json">{JSON.stringify(organization)}</script><script type="application/ld+json">{JSON.stringify(website)}</script></>;
}
