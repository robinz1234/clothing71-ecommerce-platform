import Link from "next/link";

type Section = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export function SitePage({
  eyebrow,
  title,
  intro,
  sections,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections?: Section[];
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <header className="border-b border-border pb-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</span>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{intro}</p>
      </header>
      <div className="mt-10 space-y-10">
        {sections?.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-tight">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph} className="text-sm leading-7 text-muted-foreground">{paragraph}</p>)}
            {section.items && <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
          </section>
        ))}
        {children}
      </div>
      <div className="mt-12 border-t border-border pt-6"><Link href="/shop" className="text-xs font-bold uppercase tracking-wider hover:underline">Continue to Shop &rarr;</Link></div>
    </div>
  );
}
