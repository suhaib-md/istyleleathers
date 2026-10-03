"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { signature, indexOf, products } from "@/content/products";
import { TLink } from "@/components/providers/Transition";
import { Arrow } from "@/components/ui/Icons";
import Seam from "@/components/ui/Seam";

export default function Signature() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        if (prefersReducedMotion()) return;
        const t = track.current!;
        const dist = () => t.scrollWidth - window.innerWidth + 80;
        const tween = gsap.to(t, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: "[data-pin]",
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const n = Math.min(signature.length, Math.floor(self.progress * signature.length) + 1);
              if (counter.current) counter.current.textContent = String(n).padStart(2, "0");
            },
          },
        });
        // cards drift at slightly different speeds for depth
        gsap.utils.toArray<HTMLElement>("[data-card-img]").forEach((img, i) => {
          gsap.fromTo(
            img,
            { xPercent: -6 },
            {
              xPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: img.closest("[data-card]"),
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
          gsap.from(img.closest("[data-card]")!, {
            rotate: i % 2 ? 2.5 : -2.5,
            y: 40,
            ease: "none",
            scrollTrigger: { trigger: img.closest("[data-card]"), containerAnimation: tween, start: "left right", end: "left 40%", scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} data-nav="light" className="relative bg-paper">
      <div className="wrap pt-24 md:pt-36">
        <Seam index="02" label="Signature pieces" />
      </div>
      <div data-pin className="relative overflow-hidden md:h-[100svh]">
        <div
          ref={track}
          data-track
          className="no-bar flex h-full snap-x snap-mandatory scroll-px-[var(--gutter)] items-center gap-6 overflow-x-auto px-[var(--gutter)] py-14 will-change-transform md:snap-none md:gap-[4vw] md:overflow-visible md:py-0"
        >
          <div className="flex w-[78vw] shrink-0 snap-start flex-col justify-center pr-6 md:w-[36vw]">
            <h2 className="display text-mega">
              Made <em>slowly,</em> on purpose.
            </h2>
            <p className="text-lede mt-8 max-w-[34ch] opacity-75">
              A handful of designs we keep coming back to — every one cut and stitched to order on our floor.
            </p>
            <div className="mono mt-10 flex items-center gap-4">
              <span className="display text-[54px] normal-case leading-none tracking-normal">
                <span ref={counter}>01</span>
              </span>
              <span className="opacity-50">/ {String(signature.length).padStart(2, "0")}</span>
              <span className="ml-4 hidden items-center gap-2 opacity-60 md:flex">
                Keep scrolling <Arrow />
              </span>
            </div>
          </div>

          {signature.map((p, i) => (
            <TLink
              key={p.slug}
              href={`/collection/${p.slug}`}
              data-card
              data-cursor="View"
              className={`group relative block w-[72vw] shrink-0 snap-start md:w-[26vw] ${i % 2 ? "md:mt-[14vh]" : "md:-mt-[10vh]"}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-bone">
                <div data-card-img className="absolute inset-[-2%_-8%]">
                  <Image
                    src={p.images[0]}
                    alt={`${p.name} — ${p.line}`}
                    fill
                    sizes="(max-width: 900px) 72vw, 26vw"
                    className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <span className="mono absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1.5 text-ink">N° {indexOf(p)}</span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="serif text-[30px] leading-none">{p.name}</h3>
                  <p className="mono mt-2 opacity-60">{p.line}</p>
                </div>
                <span className="mono mt-1 flex items-center gap-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  View <Arrow />
                </span>
              </div>
            </TLink>
          ))}
          <TLink
            href="/collection"
            className="group flex aspect-[4/5] w-[60vw] shrink-0 snap-start flex-col items-center justify-center gap-4 rounded-[2px] border border-dashed border-ink/25 text-center md:w-[20vw]"
            data-cursor="All"
          >
            <span className="display text-[44px] italic">All {products.length} pieces</span>
            <span className="mono flex items-center gap-2">
              The collection <Arrow />
            </span>
          </TLink>
        </div>
      </div>
    </section>
  );
}
