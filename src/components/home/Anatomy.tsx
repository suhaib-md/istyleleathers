"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { TLink } from "@/components/providers/Transition";
import { Arrow } from "@/components/ui/Icons";
import Seam from "@/components/ui/Seam";
import Reveal from "@/components/ui/Reveal";

const spots = [
  { x: 50, y: 15.5, t: "Rolled handles", d: "Leather wrapped round a core and stitched down both edges, so they stay round and comfortable in the hand." },
  { x: 36.8, y: 37.5, t: "Metal keepers", d: "Solid rings and keepers carry the handles — the point most bags fail first." },
  { x: 65, y: 62, t: "Straps that wrap the body", d: "The tan straps run from the handles down the face and under the base, framing the bag like a harness." },
  { x: 80, y: 47, t: "Textured face", d: "A fine, woven-grain black panel that keeps its looks through daily knocks and scuffs." },
  { x: 24, y: 80, t: "Leather base", d: "A tan leather base wraps the bottom, where a working bag takes the most wear." },
  { x: 11.5, y: 46, t: "Strap rings", d: "Side rings for a detachable shoulder strap, for days when your hands are full." },
];

export default function Anatomy() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  // gently cycle through the callouts until someone interacts
  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    const t = setInterval(() => {
      if (!touched.current) setActive((a) => (a + 1) % spots.length);
    }, 3200);
    return () => clearInterval(t);
  }, [inView]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-spot]", {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(2)",
        stagger: 0.12,
        scrollTrigger: { trigger: "[data-anat]", start: "top 70%", once: true },
      });
      gsap.fromTo(
        "[data-anat-img]",
        { scale: 1.08, filter: "blur(6px)" },
        { scale: 1, filter: "blur(0px)", duration: 1.6, ease: "soft", scrollTrigger: { trigger: "[data-anat]", start: "top 80%", once: true } }
      );
    },
    { scope: root }
  );

  const pick = (i: number) => {
    touched.current = true;
    setActive(i);
  };
  const s = spots[active];

  return (
    <section ref={root} data-nav="light" className="relative bg-paper py-24 md:py-36">
      <div className="wrap">
        <Seam index="03" label="Anatomy of a bag" />
        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <Reveal as="h2" className="display text-mega md:col-span-7">
            Look closer. <em>It&apos;s all in the details.</em>
          </Reveal>
          <p className="max-w-[38ch] self-end text-[17px] opacity-75 md:col-span-4 md:col-start-9">
            The Professional, our signature briefcase, taken apart point by point. Tap a marker.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-10 md:grid-cols-12">
          <div data-anat className="relative overflow-hidden rounded-[4px] bg-white md:col-span-7">
            <div data-anat-img className="relative aspect-square">
              <Image src="/img/bags/professional-white.webp" alt="The Professional briefcase in black and tan leather" fill sizes="(max-width:768px) 100vw, 58vw" className="object-cover" />
            </div>
            {/* leader line from the active marker to the card */}
            {spots.map((p, i) => (
              <button
                key={p.t}
                data-spot
                onClick={() => pick(i)}
                onPointerEnter={() => pick(i)}
                aria-label={p.t}
                aria-pressed={active === i}
                className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <span
                  className={`absolute inset-0 -m-3 rounded-full bg-cognac/30 ${active === i ? "anim-loop animate-ping" : "opacity-0"}`}
                  aria-hidden
                />
                <span
                  className={`mono relative flex h-8 w-8 items-center justify-center rounded-full border text-[11px] transition-all duration-500 ${
                    active === i ? "scale-110 border-cognac bg-cognac text-cream" : "border-ink/30 bg-cream/90 text-ink hover:bg-cream"
                  }`}
                >
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
            <div
              key={active}
              className="-mt-6 rounded-[3px] bg-leather p-5 text-cream md:hidden"
              style={{ animation: "anatin .5s cubic-bezier(.22,1,.36,1)" }}
            >
              <p className="mono text-tan">
                {String(active + 1).padStart(2, "0")} — {s.t}
              </p>
              <p className="mt-2 text-[14.5px] text-cream/80">{s.d}</p>
            </div>

          <ol className="hidden md:col-span-5 md:block">
            {spots.map((p, i) => (
              <li key={p.t}>
                <button
                  onClick={() => pick(i)}
                  onPointerEnter={() => pick(i)}
                  className={`flex w-full gap-5 border-b border-ink/10 py-5 text-left transition-opacity duration-500 ${active === i ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
                >
                  <span className="mono mt-2 w-6 text-cognac">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className={`serif block text-[30px] leading-none transition-transform duration-500 ${active === i ? "translate-x-1 italic" : ""}`}>{p.t}</span>
                    <span
                      className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
                      style={{ gridTemplateRows: active === i ? "1fr" : "0fr" }}
                    >
                      <span className="overflow-hidden">
                        <span className="block pt-3 text-[15.5px] opacity-75">{p.d}</span>
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
            <li className="pt-8">
              <TLink href="/collection/the-professional" className="tag-btn" data-cursor="View">
                See The Professional <Arrow />
              </TLink>
            </li>
          </ol>
        </div>
      </div>
      <style>{`@keyframes anatin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}
