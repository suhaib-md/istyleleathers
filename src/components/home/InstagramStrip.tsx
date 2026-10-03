import Image from "next/image";
import { site } from "@/content/site";
import Seam from "@/components/ui/Seam";
import { ArrowUpRight, Instagram } from "@/components/ui/Icons";

const rowA = [
  ["bags-distance", "Bags that go the distance — The Professional briefcase"],
  ["footwear-collection", "Footwear Collection — cross-strap slides"],
  ["minimalist", "The Minimalist — document & laptop case"],
  ["elegance", "Elegance — black leather slide on a plinth"],
  ["explorer", "The Explorer — canvas & leather duffel"],
  ["i-style-leathers", "I Style Leathers — H-strap sandal"],
] as const;
const rowB = [
  ["traveler", "The Traveler — weekend duffel"],
  ["step-into-comfort", "Step into Comfort — leather slides"],
  ["classic", "The Classic — woven leather backpack"],
  ["croc-buckle", "Croc-embossed buckle slides"],
  ["essential", "The Essential — travel duffel"],
  ["professional", "The Professional — laptop briefcase"],
] as const;

function Row({ items, reverse }: { items: readonly (readonly [string, string])[]; reverse?: boolean }) {
  return (
    <div className={`marquee group ${reverse ? "marquee--rev" : ""}`} style={{ ["--marquee-dur" as string]: "60s" }}>
      {[0, 1].map((k) => (
        <div key={k} className="marquee__track group-hover:[animation-play-state:paused]" aria-hidden={k === 1}>
          {items.map(([slug, alt]) => (
            <a
              key={slug + k}
              href={site.instagramUrl}
              target="_blank"
              rel="noopener"
              tabIndex={k === 1 ? -1 : undefined}
              data-cursor="Open"
              className="group/tile relative mr-4 block aspect-square w-[58vw] shrink-0 overflow-hidden rounded-[3px] sm:w-[30vw] lg:w-[19vw]"
            >
              <Image src={`/img/insta/${slug}.webp`} alt={alt} fill sizes="(max-width:640px) 58vw, 20vw" className="object-cover transition-transform duration-[1200ms] group-hover/tile:scale-[1.06]" />
              <span className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-ink/70 via-transparent p-4 text-cream opacity-0 transition-opacity duration-500 group-hover/tile:opacity-100">
                <Instagram size={18} />
                <span className="mono flex items-center gap-1.5">
                  Open <ArrowUpRight />
                </span>
              </span>
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function InstagramStrip() {
  return (
    <section data-nav="light" className="overflow-hidden bg-paper py-24 md:py-32">
      <div className="wrap">
        <Seam index="10" label="On Instagram" />
        <div className="mt-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <a href={site.instagramUrl} target="_blank" rel="noopener" className="group">
            <span className="display text-mega block transition-colors duration-500 group-hover:text-cognac">@{site.instagram}</span>
          </a>
          <a href={site.instagramUrl} target="_blank" rel="noopener" className="tag-btn tag-btn--dark self-start md:self-auto">
            <Instagram size={16} /> Follow the workshop
          </a>
        </div>
      </div>
      <div className="mt-14 space-y-4">
        <Row items={rowA} />
        <Row items={rowB} reverse />
      </div>
    </section>
  );
}
