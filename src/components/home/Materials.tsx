"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import Seam from "@/components/ui/Seam";
import Reveal from "@/components/ui/Reveal";
import { SWATCHES, FINISHES } from "@/content/materials";

const SwatchBook = dynamic(() => import("@/components/three/SwatchBook"), { ssr: false });

export default function Materials({ index = "06", tone = "sage" }: { index?: string; tone?: "sage" | "dark" }) {
  const root = useRef<HTMLElement>(null);
  const spread = useRef(0);
  const hovered = useRef(-1);
  const [active, setActive] = useState(-1);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setMount(true), { rootMargin: "600px" });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const obj = { v: 0 };
      if (prefersReducedMotion()) {
        spread.current = 1;
        return;
      }
      gsap.to(obj, {
        v: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top 70%", end: "center 55%", scrub: 0.8 },
        onUpdate: () => (spread.current = obj.v),
      });
    },
    { scope: root }
  );

  const setH = (i: number) => {
    hovered.current = i;
    setActive(i);
  };

  const bg = tone === "sage" ? "bg-sage-deep" : "bg-leather";

  return (
    <section ref={root} data-nav="dark" className={`on-dark relative overflow-hidden ${bg} py-24 md:py-36`}>
      <div className="wrap">
        <Seam index={index} label="The leather library" />
        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <Reveal as="h2" className="display text-mega md:col-span-7">
            Pick a grain. <em>We&apos;ll do the rest.</em>
          </Reveal>
          <p className="max-w-[38ch] self-end text-[17px] text-cream/75 md:col-span-4 md:col-start-9">
            The finishes we work with most, in the colours people ask for most. Hover a swatch — or tell us what you have in
            mind and we&apos;ll source it.
          </p>
        </div>
      </div>

      <div className="wrap mt-6 grid items-center gap-6 md:grid-cols-12">
        <div className="relative h-[62vh] min-h-[420px] md:col-span-7 md:h-[78vh]">{mount && <SwatchBook spread={spread} hoveredIndex={hovered} onHover={setH} />}</div>
        <ul className="md:col-span-5" onPointerLeave={() => setH(-1)}>
          {SWATCHES.map((s, i) => {
            const note = FINISHES.find((f) => f.key === s.finish)?.note;
            const on = active === i;
            return (
              <li key={i} className="border-b border-cream/15">
                <button
                  className="flex w-full items-center gap-4 py-3.5 text-left"
                  onPointerEnter={() => setH(i)}
                  onFocus={() => setH(i)}
                  onClick={() => setH(on ? -1 : i)}
                  aria-expanded={on}
                >
                  <span className="mono w-7 opacity-50">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className="h-5 w-5 shrink-0 rounded-full ring-1 ring-cream/30 transition-transform duration-500"
                    style={{ background: s.hex, transform: on ? "scale(1.35)" : "scale(1)" }}
                  />
                  <span className={`serif text-[26px] leading-none transition-transform duration-500 md:text-[30px] ${on ? "translate-x-2 italic" : ""}`}>
                    {s.name}
                  </span>
                  <span className="mono ml-auto opacity-60">{s.colour}</span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
                  style={{ gridTemplateRows: on ? "1fr" : "0fr" }}
                >
                  <p className="overflow-hidden pl-[4.25rem] text-[15px] text-cream/70">
                    <span className="block pb-4">{note}</span>
                  </p>
                </div>
              </li>
            );
          })}
          <li className="mono pt-5 text-cream/55">+ Custom colours & finishes sourced on request</li>
        </ul>
      </div>
    </section>
  );
}
