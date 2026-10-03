"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { site, waBulk, isPlaceholder } from "@/content/site";
import { TLink } from "@/components/providers/Transition";
import { Arrow, WhatsApp } from "@/components/ui/Icons";
import Seam from "@/components/ui/Seam";
import Reveal from "@/components/ui/Reveal";

export const services = [
  { t: "Private label", d: "Your designs, made and branded as your own — logo embossed, debossed or foiled." },
  { t: "Development & sampling", d: "From a sketch or a reference photo to a physical sample you can hold." },
  { t: "Bulk & repeat runs", d: "Consistent production for retailers and online brands, reorder after reorder." },
  { t: "Corporate & wedding gifts", d: "Folios, watch rolls, keychains and bags — personalised for your list." },
  { t: "Custom hardware & trims", d: "Buckles, plates, linings and threads chosen to match your brand." },
  { t: "Packing & dispatch", d: "Checked, packed and shipped across India — export enquiries welcome." },
];

export function Stat({ v, label, suffix = "" }: { v: string; label: string; suffix?: string }) {
  const ph = isPlaceholder(v);
  return (
    <div className="border-t border-current/15 pt-5">
      <div className="display text-[clamp(52px,6vw,104px)] leading-none">
        {ph ? (
          <span className="inline-block rounded-[4px] border-[1.5px] border-dashed border-current/50 px-3 pb-1 text-[0.7em] opacity-80" title="Placeholder — edit in src/content/site.ts">
            {v}
          </span>
        ) : (
          <>
            {v}
            {suffix}
          </>
        )}
      </div>
      <p className="mono mt-4 opacity-60">{label}</p>
    </div>
  );
}

export default function ForBrands() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-svc]", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "soft",
        stagger: 0.07,
        scrollTrigger: { trigger: "[data-svcs]", start: "top 80%", once: true },
      });
      gsap.fromTo(
        "[data-brand-img]",
        { clipPath: "inset(18% 18% 18% 18%)", scale: 1.15 },
        { clipPath: "inset(0% 0% 0% 0%)", scale: 1, ease: "none", scrollTrigger: { trigger: "[data-brand-img]", start: "top 90%", end: "center 55%", scrub: true } }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} data-nav="dark" className="on-dark relative overflow-hidden bg-leather py-24 md:py-36">
      <div className="wrap">
        <Seam index="08" label="For brands & businesses" />
        <div className="mt-12 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <Reveal as="h2" className="display text-mega">
              Your label. <em className="text-tan">Our floor.</em>
            </Reveal>
            <p className="text-lede mt-8 max-w-[44ch] text-cream/75">
              We manufacture footwear, bags and small leather goods for brands, boutiques and businesses — from a single sample
              to full production runs, with your name pressed into every piece.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] md:col-span-5 md:aspect-auto">
            <div data-brand-img className="absolute inset-0">
              <Image src="/img/brand/logo-on-leather.webp" alt="The I Style mark debossed into brown leather" fill sizes="40vw" className="object-cover" />
            </div>
            <span className="mono absolute bottom-4 left-4 rounded-full bg-ink/60 px-3 py-1.5 backdrop-blur">Your logo, pressed in</span>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          <Stat v={site.years} suffix="+" label="Years of making" />
          <Stat v={site.pairsPerMonth} label="Pairs a month" />
          <Stat v={site.bagsPerMonth} label="Bags a month" />
          <Stat v={site.moq} label="Pieces min. per design" />
        </div>

        <div data-svcs className="mt-20 grid gap-px overflow-hidden rounded-[3px] bg-cream/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <div data-svc key={s.t} className="group relative bg-leather p-7 transition-colors duration-500 hover:bg-leather-2 md:p-9">
              <span className="mono text-tan">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="serif mt-6 text-[32px] leading-none transition-transform duration-500 group-hover:translate-x-1.5">{s.t}</h3>
              <p className="mt-4 max-w-[34ch] text-[15.5px] text-cream/65">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-4">
          <TLink href="/manufacturing" className="tag-btn" data-cursor="B2B">
            How we work with brands <Arrow />
          </TLink>
          <a href={waBulk} target="_blank" rel="noopener" className="tag-btn tag-btn--wa">
            <WhatsApp size={16} /> Talk bulk on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
