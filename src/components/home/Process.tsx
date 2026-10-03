"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import Seam from "@/components/ui/Seam";
import Reveal from "@/components/ui/Reveal";
import { steps } from "@/content/process";

export default function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        if (prefersReducedMotion()) return;
        const imgs = gsap.utils.toArray<HTMLElement>("[data-pimg]");
        const items = gsap.utils.toArray<HTMLElement>("[data-step]");
        const num = root.current!.querySelector("[data-pnum]") as HTMLElement;
        const name = root.current!.querySelector("[data-pname]") as HTMLElement;
        gsap.set(imgs.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(items.slice(1), { opacity: 0.28 });
        items.forEach((item, i) => {
          ScrollTrigger.create({
            trigger: item,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => {
              gsap.to(item, { opacity: self.isActive ? 1 : 0.28, duration: 0.5 });
              if (self.isActive) {
                num.textContent = String(i + 1).padStart(2, "0");
                name.textContent = steps[i].t;
              }
            },
            onEnter: () => {
              if (i > 0) gsap.to(imgs[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "leather" });
              gsap.fromTo(imgs[i].querySelector("img"), { scale: 1.18 }, { scale: 1, duration: 1.6, ease: "soft" });
            },
            onLeaveBack: () => {
              if (i > 0) gsap.to(imgs[i], { clipPath: "inset(100% 0% 0% 0%)", duration: 0.9, ease: "leather" });
            },
          });
        });
        gsap.fromTo(
          "[data-pthread]",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-psteps]", start: "top 55%", end: "bottom 55%", scrub: true } }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="process" data-nav="light" className="relative bg-cream py-24 md:py-36">
      <div className="wrap">
        <Seam index="05" label="From hide to hand" />
        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <Reveal as="h2" className="display text-mega md:col-span-8">
            Six stages, <em>one floor,</em> no shortcuts.
          </Reveal>
          <p className="max-w-[36ch] self-end text-[17px] opacity-75 md:col-span-4">
            Real photos from our workshop — taken on a phone, between jobs. This is where your order is made.
          </p>
        </div>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12">
          {/* sticky frame */}
          <div className="motion-only hidden md:col-span-6 md:block">
            <div className="sticky top-[12vh] h-[76vh]">
              <div className="relative h-full overflow-hidden rounded-[3px] bg-bone">
                {steps.map((s, i) => (
                  <div key={s.t} data-pimg className="absolute inset-0 overflow-hidden" style={{ zIndex: i }}>
                    <Image src={s.img} alt={s.alt} fill sizes="45vw" className="object-cover" />
                  </div>
                ))}
                <div className="pointer-events-none absolute inset-3 z-10 rounded-[2px] border-[1.5px] border-dashed border-cream/50" />
                <div className="absolute bottom-0 left-0 z-10 flex w-full items-end justify-between bg-gradient-to-t from-ink/70 to-transparent p-6 text-cream">
                  <span className="display text-[88px] leading-[0.8]" data-pnum>
                    01
                  </span>
                  <span className="mono text-right" data-pname>
                    {steps[0].t}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* steps */}
          <ol data-psteps className="relative md:col-span-5 md:col-start-8">
            <span className="absolute -left-8 top-0 hidden h-full w-px bg-ink/10 md:block" aria-hidden />
            <span
              data-pthread
              aria-hidden
              className="absolute -left-8 top-0 hidden h-full w-px origin-top bg-[repeating-linear-gradient(180deg,var(--color-cognac)_0_7px,transparent_7px_12px)] md:block"
              style={{ width: 2 }}
            />
            {steps.map((s, i) => (
              <li key={s.t} data-step className="flex min-h-[64vh] flex-col justify-center py-10 md:py-0">
                <div className="reduced-show relative mb-6 aspect-[4/5] overflow-hidden rounded-[3px] md:hidden">
                  <Image src={s.img} alt={s.alt} fill sizes="100vw" className="object-cover" />
                </div>
                <span className="mono text-cognac">Stage {String(i + 1).padStart(2, "0")}</span>
                <h3 className="serif mt-3 text-[44px] leading-[0.95] md:text-[56px]">{s.t}</h3>
                <p className="mt-5 max-w-[40ch] text-[18px] leading-relaxed opacity-80">{s.d}</p>
                <p className="mono mt-6 opacity-50">{s.tools}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
