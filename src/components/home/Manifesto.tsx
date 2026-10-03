"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { site } from "@/content/site";
import Seam from "@/components/ui/Seam";
import Ph from "@/components/ui/Ph";

const text =
  "We're a family workshop in Melvisharam — a town on the Palar river where leather has been tanned, cut and stitched for generations. We make sandals that soften to your stride, bags built to carry a working life, and the small leather things you reach for every day. Nothing between the hide and your hand but people who know it well.";

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const words = gsap.utils.toArray<HTMLElement>("[data-w]");
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: { trigger: "[data-para]", start: "top 78%", end: "bottom 45%", scrub: 0.5 },
        }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} data-nav="light" className="relative bg-cream py-24 md:py-40">
      <div className="wrap">
        <Seam index="01" label="Who we are" className="mb-14 md:mb-24" />
        <div className="grid gap-10 md:grid-cols-12">
          <div className="mono space-y-2 opacity-70 md:col-span-3">
            <p>Est. <Ph v={site.established} /></p>
            <p>{site.town}, {site.district}</p>
            <p>{site.state}, {site.country}</p>
          </div>
          <p data-para className="serif text-[clamp(30px,4.1vw,68px)] leading-[1.08] tracking-[-0.015em] md:col-span-9">
            {text.split(" ").map((w, i) => (
              <span key={i} data-w className="inline">
                {w}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
