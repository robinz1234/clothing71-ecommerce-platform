import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { SitePage } from "@/components/content/site-page";
import { contactInfo } from "@/data/navigation";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Contact Clothing71", description: "Contact Clothing71 in Dhaka about products, delivery, and customer care.", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const settings = await getPublicSiteSettings();
  return (
    <SitePage
      eyebrow="Customer Care"
      title="CONTACT"
      intro="We are based in Dhaka, Bangladesh. Reach Clothing71 through the verified contact channels below."
      sections={[{
        title: "Contact details",
        paragraphs: [
          "For product and order questions, please use phone, WhatsApp, or email.",
          ...(settings.supportInformation ? [settings.supportInformation] : []),
        ],
      }]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <a href={`tel:${settings.supportPhone}`} className="flex items-start gap-3 border border-border p-5 hover:bg-muted/40">
          <Phone className="size-5" />
          <span><strong className="block text-xs uppercase tracking-wider">Phone</strong><span className="mt-2 block text-sm text-muted-foreground">{settings.supportPhone}</span></span>
        </a>
        <a href={`https://wa.me/${settings.whatsappPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 border border-border p-5 hover:bg-muted/40">
          <Phone className="size-5" />
          <span><strong className="block text-xs uppercase tracking-wider">WhatsApp</strong><span className="mt-2 block text-sm text-muted-foreground">{settings.whatsappPhone}</span></span>
        </a>
        <a href={`mailto:${settings.supportEmail}`} className="flex items-start gap-3 border border-border p-5 hover:bg-muted/40">
          <Mail className="size-5" />
          <span><strong className="block text-xs uppercase tracking-wider">Email</strong><span className="mt-2 block text-sm text-muted-foreground">{settings.supportEmail}</span></span>
        </a>
        <div className="flex items-start gap-3 border border-border p-5">
          <MapPin className="size-5" />
          <span><strong className="block text-xs uppercase tracking-wider">Location</strong><span className="mt-2 block text-sm text-muted-foreground">{contactInfo.location}</span></span>
        </div>
      </div>
      <div className="border-t border-border pt-8">
        <h2 className="text-lg font-black uppercase tracking-tight">Social</h2>
        <div className="mt-4 flex flex-wrap gap-5 text-xs font-bold uppercase tracking-wider">
          <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
          <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram</a>
          <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">TikTok</a>
        </div>
      </div>
    </SitePage>
  );
}
