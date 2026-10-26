import { InstagramIcon } from "@/components/ui/icons";
import { socialLinks } from "@/data/navigation";

const socialPosts = [
  { id: "s1", tag: "#WEARYOURATTITUDE", subtitle: "Essential Drop Shoulder Tee / Black" },
  { id: "s2", tag: "#C71STREETWEAR", subtitle: "Premium Baggy Cargo in Olive" },
  { id: "s3", tag: "#DHAKACRAFTED", subtitle: "Factory Cut & Pattern Series" },
  { id: "s4", tag: "#CLOTHING71BD", subtitle: "Minimal Logo Tee in Crisp White" },
  { id: "s5", tag: "#EXPORTQUALITY", subtitle: "Heavyweight 240+ GSM Texture" },
  { id: "s6", tag: "#C71FAMILY", subtitle: "Kids Street Drop Shoulder Edition" },
];

export function SocialFeed() {
  return (
    <section className="w-full border-b border-border bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Follow Our Community
          </span>
          <h2 className="mt-2 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            @CLOTHING.71BD
          </h2>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            Tag <span className="font-semibold text-foreground">#WearYourAttitude</span> to be featured in our editorial gallery.
          </p>
        </div>

        {/* 6-Grid Editorial Instagram Tiles */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {socialPosts.map((post) => (
            <a
              key={post.id}
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex aspect-square flex-col justify-between border border-border bg-muted/60 p-4 transition-all duration-300 hover:border-foreground"
            >
              <div className="flex justify-end">
                <InstagramIcon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </div>

              <div className="my-auto text-center">
                <span className="font-sans text-2xl font-black tracking-widest text-foreground/10 group-hover:text-foreground/20">
                  C71
                </span>
              </div>

              <div>
                <p className="text-[9px] font-bold tracking-widest text-foreground uppercase">
                  {post.tag}
                </p>
                <p className="mt-0.5 text-[8px] text-muted-foreground line-clamp-1">
                  {post.subtitle}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-8 flex justify-center">
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center border border-border bg-background px-6 text-xs font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            <InstagramIcon className="mr-2 size-3.5" />
            FOLLOW ON INSTAGRAM
          </a>
        </div>
      </div>
    </section>
  );
}
