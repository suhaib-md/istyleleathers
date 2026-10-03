"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { products } from "@/content/products";
import { useTransitionNav } from "@/components/providers/Transition";
import Seam from "@/components/ui/Seam";
import Reveal from "@/components/ui/Reveal";

const CurvedGallery = dynamic(() => import("@/components/three/CurvedGallery"), {
  ssr: false,
  loading: () => <div className="mono flex h-full items-center justify-center opacity-40">Laying out the archive…</div>,
});

const PICKS = [
  "the-palar-cross",
  "the-professional",
  "the-arcot",
  "the-explorer",
  "the-twin-buckle",
  "the-weaver",
  "the-croc-buckle",
  "the-minimalist",
  "the-weave",
  "the-racer",
  "watch-roll-tan",
  "the-slate",
  "the-navy-cross",
  "the-traveler",
  "folding-spectacle-case",
  "the-classic-backpack",
];

export default function Archive() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const { go } = useTransitionNav();
  const [mount, setMount] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setMount(true), { rootMargin: "800px" });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);
  const items = useMemo(() => PICKS.map((s) => products.find((p) => p.slug === s)!).filter(Boolean), []);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (s) => (progress.current = s.progress),
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} data-nav="dark" className="on-dark relative overflow-hidden bg-leather-2 pt-24 md:pt-36">
      <div className="wrap">
        <Seam index="04" label="The archive" />
        <div className="mt-12 grid gap-8 md:grid-cols-12 md:items-end">
          <Reveal as="h2" className="display text-mega md:col-span-7">
            Every piece, <em>in the round.</em>
          </Reveal>
          <p className="max-w-[40ch] text-[17px] text-cream/70 md:col-span-4 md:col-start-9">
            Drag the strip, or just keep scrolling. Tap anything to see it up close — all of it is made to order in {""}
            Melvisharam.
          </p>
        </div>
      </div>
      <div className="relative mt-6 h-[74vh] min-h-[460px] md:mt-2">
        {mount && <CurvedGallery items={items} scrollProgress={progress} onOpen={(p) => go(`/collection/${p.slug}`)} />}
      </div>
    </section>
  );
}
