"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { dims } from "@/components/ui/Img";
import Seam from "@/components/ui/Seam";
import Reveal from "@/components/ui/Reveal";

export const floorShots = [
  { src: "/img/workshop/racer-held.webp", alt: "A black and red striped duffel held up on the workshop floor", cap: "Racer duffel, just off the bench" },
  { src: "/img/workshop/croc-on-mat.webp", alt: "Close-up of croc-embossed leather on a green cutting mat", cap: "Croc emboss on the cutting mat" },
  { src: "/img/workshop/bench-woven.webp", alt: "A woven-front bag on a workbench beside tools", cap: "Woven weekender, mid-finish" },
  { src: "/img/workshop/floor-weekender.webp", alt: "A black weekender on the cutting table in the workshop", cap: "Night Train weekender" },
  { src: "/img/workshop/cognac-brief-held.webp", alt: "A cognac briefcase held up in the workshop", cap: "Cognac briefcase, final check" },
  { src: "/img/workshop/woven-closeup.webp", alt: "Close-up of tan woven-texture leather with a zip pocket", cap: "Woven texture, up close" },
  { src: "/img/workshop/slate-brief-table.webp", alt: "A slate briefcase on a green workshop table", cap: "Slate briefcase on the table" },
  { src: "/img/workshop/cutting-mat-brief.webp", alt: "A split-panel briefcase beside cut leather offcuts", cap: "Offcuts become keychains" },
  { src: "/img/workshop/black-brief-held.webp", alt: "A black briefcase held up in the workshop", cap: "City briefcase" },
  { src: "/img/workshop/woven-brief-held.webp", alt: "A woven-panel briefcase held in the workshop", cap: "Tanner briefcase" },
];

export default function FromTheFloor({ index = "11", limit = 8 }: { index?: string; limit?: number }) {
  const root = useRef<HTMLElement>(null);
  const shots = floorShots.slice(0, limit);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-col]").forEach((col, i) => {
        gsap.fromTo(
          col,
          { y: i % 2 ? 80 : -20 },
          { y: i % 2 ? -80 : 30, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } }
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-shot]").forEach((el) => {
        gsap.from(el, { clipPath: "inset(100% 0 0 0)", duration: 1.3, ease: "leather", scrollTrigger: { trigger: el, start: "top 92%", once: true } });
      });
    },
    { scope: root }
  );

  const cols = [0, 1, 2, 3].map((c) => shots.filter((_, i) => i % 4 === c));

  return (
    <section ref={root} id="floor" data-nav="dark" className="on-dark relative overflow-hidden bg-ink py-24 md:py-36">
      <div className="wrap">
        <Seam index={index} label="From the floor" />
        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <Reveal as="h2" className="display text-mega md:col-span-8">
            Unfiltered. <em>Unretouched.</em> Ours.
          </Reveal>
          <p className="max-w-[36ch] self-end text-[17px] text-cream/70 md:col-span-4">
            No studio, no stylist — just the workshop on an ordinary day, photographed on a phone between jobs.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {cols.map((col, ci) => (
            <div key={ci} data-col className="flex flex-col gap-3 md:gap-5">
              {col.map((s) => {
                const d = dims(s.src);
                return (
                  <figure key={s.src} data-shot className="group relative overflow-hidden rounded-[2px]">
                    <Image
                      src={s.src}
                      alt={s.alt}
                      width={d.w}
                      height={d.h}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="h-auto w-full object-cover grayscale-[35%] transition-all duration-1000 group-hover:scale-[1.03] group-hover:grayscale-0"
                      style={{ aspectRatio: d.w / d.h > 1 ? "1 / 1" : "3 / 5" }}
                    />
                    <figcaption className="mono absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink/80 to-transparent p-3 pt-10 text-cream/90 transition-transform duration-500 group-hover:translate-y-0">
                      {s.cap}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
