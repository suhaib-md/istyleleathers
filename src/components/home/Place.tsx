"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { site } from "@/content/site";
import Seam from "@/components/ui/Seam";
import Reveal from "@/components/ui/Reveal";
import Ph from "@/components/ui/Ph";

const RIVER = "M10,262 C130,214 210,312 330,268 S520,196 610,240 S760,306 840,258 S1010,196 1190,226";
const towns = [
  { name: "Vaniyambadi", x: 115, below: true },
  { name: "Ambur", x: 285, below: false },
  { name: "Vellore", x: 560, below: true },
  { name: "Arcot", x: 715, below: false },
  { name: "Melvisharam", x: 785, below: true, home: true },
  { name: "Ranipet", x: 862, below: false },
];

export default function Place() {
  const root = useRef<HTMLElement>(null);
  const path = useRef<SVGPathElement>(null);
  const [pts, setPts] = useState<{ x: number; y: number }[]>(towns.map((t) => ({ x: t.x, y: 250 })));

  useLayoutEffect(() => {
    const p = path.current!;
    const L = p.getTotalLength();
    const found = towns.map((t) => {
      let best = { x: t.x, y: 250 },
        bd = 1e9;
      for (let s = 0; s <= L; s += 2) {
        const q = p.getPointAtLength(s);
        const d = Math.abs(q.x - t.x);
        if (d < bd) {
          bd = d;
          best = { x: q.x, y: q.y };
        }
      }
      return best;
    });
    setPts(found);
  }, []);

  const home = pts[4];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const p = path.current!;
      const L = p.getTotalLength();
      gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
      const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-map]", start: "top 80%", end: "center 45%", scrub: 0.8 } });
      tl.to(p, { strokeDashoffset: 0, ease: "none", duration: 1 })
        .from("[data-town]", { opacity: 0, y: 8, stagger: 0.12, duration: 0.3 }, 0.1)
        .from("[data-road]", { strokeDashoffset: 400, duration: 0.5 }, 0.7)
        .from("[data-chennai]", { opacity: 0, duration: 0.2 }, 0.95);
    },
    { scope: root, dependencies: [pts], revertOnUpdate: true }
  );

  return (
    <section ref={root} data-nav="light" className="relative overflow-hidden bg-cream py-24 md:py-36">
      <div className="wrap">
        <Seam index="09" label="Where it's made" />
        <div className="mt-12 grid gap-10 md:grid-cols-12">
          <Reveal as="h2" className="display text-mega md:col-span-7">
            Melvisharam, <em>on the Palar.</em>
          </Reveal>
          <div className="space-y-5 text-[17px] opacity-80 md:col-span-4 md:col-start-9 md:self-end">
            <p>
              Melvisharam sits in Ranipet district, in the middle of Tamil Nadu&apos;s leather belt along the Palar river — the
              same stretch of country as Vellore, Ambur and Vaniyambadi.
            </p>
            <p>Tanners, cutters, stitchers and finishers have worked side by side here for generations. We&apos;re proud to be part of it.</p>
          </div>
        </div>

        <p className="mono mt-12 opacity-50 md:hidden">Swipe the map →</p>
        <div data-map className="no-bar relative -mx-[var(--gutter)] mt-4 overflow-x-auto px-[var(--gutter)] md:mx-0 md:mt-20 md:overflow-visible md:px-0">
          <svg viewBox="0 0 1200 420" className="w-full min-w-[860px] overflow-visible md:min-w-0" role="img" aria-label="Diagram of the Palar river leather belt showing Melvisharam near Arcot and Ranipet, about two hours by road from Chennai">
            <defs>
              <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeOpacity="0.08" strokeWidth="2" />
              </pattern>
            </defs>
            {/* sea */}
            <rect x="1120" y="0" width="80" height="420" fill="url(#hatch)" />
            <text x="1160" y="400" className="mono" fontSize="11" textAnchor="middle" fill="currentColor" opacity="0.45" style={{ letterSpacing: "0.1em" }}>
              BAY OF BENGAL
            </text>
            {/* river */}
            <path d={RIVER} fill="none" stroke="var(--color-sage)" strokeWidth="14" strokeLinecap="round" opacity="0.18" />
            <path ref={path} d={RIVER} fill="none" stroke="var(--color-teal)" strokeWidth="2.5" strokeLinecap="round" />
            <text x="420" y="214" fontSize="13" fill="var(--color-teal)" className="serif" fontStyle="italic" opacity="0.9">
              Palar river
            </text>
            {/* road to Chennai */}
            <path data-road d={`M${home.x},${home.y} C${home.x + 40},${home.y - 190} 930,40 1070,92`} fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="6 6" />
            <g data-chennai>
              <circle cx="1070" cy="92" r="5" fill="currentColor" />
              <text x="1060" y="70" fontSize="22" className="serif" textAnchor="end" fill="currentColor">
                Chennai
              </text>
              <text x="1060" y="122" fontSize="11" textAnchor="end" fill="currentColor" opacity="0.55" style={{ letterSpacing: "0.08em" }}>
                PORT · AIRPORT · ≈ 2 HRS BY ROAD
              </text>
            </g>
            {towns.map((t, i) => {
              const p = pts[i];
              return (
                <g key={t.name} data-town>
                  {t.home ? (
                    <>
                      <circle cx={p.x} cy={p.y} r="22" fill="var(--color-cognac)" opacity="0.18">
                        <animate attributeName="r" values="10;28;10" dur="2.6s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.35;0;0.35" dur="2.6s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={p.x} cy={p.y} r="8" fill="var(--color-cognac)" stroke="var(--color-cream)" strokeWidth="3" />
                      <line x1={p.x} y1={p.y + 12} x2={p.x} y2={p.y + 70} stroke="var(--color-cognac)" strokeWidth="1.2" />
                      <text x={p.x} y={p.y + 104} fontSize="40" textAnchor="middle" className="serif" fill="var(--color-cognac)">
                        Melvisharam
                      </text>
                      <text x={p.x} y={p.y + 128} fontSize="11" textAnchor="middle" fill="currentColor" opacity="0.6" style={{ letterSpacing: "0.1em" }}>
                        I STYLE LEATHERS · {site.coords}
                      </text>
                    </>
                  ) : (
                    <>
                      <circle cx={p.x} cy={p.y} r="4.5" fill="currentColor" />
                      <text x={p.x} y={t.below ? p.y + 32 : p.y - 18} fontSize="19" textAnchor="middle" className="serif" fill="currentColor" opacity="0.8">
                        {t.name}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mono mt-12 grid gap-4 border-t border-ink/10 pt-6 opacity-75 sm:grid-cols-2 md:grid-cols-4">
          <span>{site.town} · {site.district}</span>
          <span>Palar valley leather cluster</span>
          <span>Shipping across India</span>
          <span>
            Export: <Ph v={site.exportTo} />
          </span>
        </div>
      </div>
    </section>
  );
}
