"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { TLink } from "@/components/providers/Transition";
import { Arrow } from "@/components/ui/Icons";

const doors = [
  {
    href: "/collection",
    kicker: "For you",
    title: (
      <>
        The <em>Collection</em>
      </>
    ),
    copy: "Sandals, bags and accessories, made to order and sent across India. Pick one, message us, and we make it.",
    items: ["Footwear", "Bags", "Accessories"],
    img: "/img/foot/cross-strap-teal.webp",
    alt: "Tan and black cross-strap leather slides on a teal backdrop",
    cta: "Browse the collection",
    cursor: "Shop",
  },
  {
    href: "/manufacturing",
    kicker: "For your brand",
    title: (
      <>
        Private <em>label</em>
      </>
    ),
    copy: "Your designs, your logo, our floor. Sampling, bulk production and corporate gifting — handled under one roof.",
    items: ["Sampling", "Bulk runs", "Corporate gifts"],
    img: "/img/workshop/croc-duffel-mat.webp",
    alt: "A black croc-embossed duffel on the workshop cutting mat",
    cta: "Start a project",
    cursor: "B2B",
  },
];

export default function TwoDoors() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-door]", {
        clipPath: "inset(12% 6% 12% 6%)",
        duration: 1.6,
        ease: "leather",
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-door-img]").forEach((img) => {
        gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true } });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} data-nav="dark" className="on-dark bg-ink">
      <div className="flex flex-col md:h-[92vh] md:flex-row">
        {doors.map((d, i) => (
          <TLink
            key={d.href}
            href={d.href}
            data-door
            data-cursor={d.cursor}
            className="group relative flex min-h-[78vh] flex-1 overflow-hidden transition-[flex-grow] duration-[1100ms] ease-[cubic-bezier(.76,0,.24,1)] md:min-h-0 md:hover:flex-[1.45]"
          >
            <div data-door-img className="absolute inset-[-8%_0]">
              <Image
                src={d.img}
                alt={d.alt}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/10 transition-opacity duration-700 group-hover:opacity-85" />
            <div className="pointer-events-none absolute inset-4 rounded-[3px] border-[1.5px] border-dashed border-thread/0 transition-colors duration-700 group-hover:border-thread/40" />
            <div className="relative mt-auto w-full p-[var(--gutter)] pb-10 md:pb-14">
              <div className="mono mb-5 flex items-center justify-between text-cream/70">
                <span>
                  ({String(i + 1).padStart(2, "0")}) {d.kicker}
                </span>
                <span className="hidden gap-4 lg:flex">
                  {d.items.map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </span>
              </div>
              <h2 className="display text-mega text-cream">{d.title}</h2>
              <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <p className="max-w-[38ch] text-[17px] text-cream/75">{d.copy}</p>
                <span className="mono inline-flex shrink-0 items-center gap-3 text-tan">
                  <span className="u-link u-link--always">{d.cta}</span> <Arrow />
                </span>
              </div>
            </div>
          </TLink>
        ))}
      </div>
    </section>
  );
}
