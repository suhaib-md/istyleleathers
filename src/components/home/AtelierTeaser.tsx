"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { SandalConfig } from "@/components/three/Sandal";
import { TLink } from "@/components/providers/Transition";
import { Arrow } from "@/components/ui/Icons";
import Seam from "@/components/ui/Seam";
import Reveal from "@/components/ui/Reveal";

const SandalScene = dynamic(() => import("@/components/three/SandalScene"), { ssr: false });

const PRESETS: (SandalConfig & { label: string })[] = [
  {
    label: "Tan croc over jet — gold foil",
    silhouette: "cross",
    toeRing: false,
    finish: "croc",
    strap: "#b9814f",
    strap2: "#1c1c1c",
    footbed: "#1d1d1d",
    sole: "#141414",
    thread: "#7a5532",
    hardware: "#caa45d",
    stamp: "YOUR BRAND",
    stampStyle: "gold",
    stampLogo: false,
  },
  {
    label: "Woven cognac band — blind stamp",
    silhouette: "band",
    toeRing: true,
    finish: "woven",
    strap: "#9a5426",
    strap2: "#9a5426",
    footbed: "#3a2116",
    sole: "#3e2418",
    thread: "#6b3a1b",
    hardware: "#caa45d",
    stamp: "",
    stampStyle: "blind",
    stampLogo: true,
  },
  {
    label: "Navy twin buckle — silver",
    silhouette: "twin",
    toeRing: false,
    finish: "smooth",
    strap: "#1f2d4f",
    strap2: "#1f2d4f",
    footbed: "#8a8a86",
    sole: "#e7e3da",
    thread: "#efe2c6",
    hardware: "#cfd3d6",
    stamp: "MADE FOR YOU",
    stampStyle: "silver",
    stampLogo: false,
  },
];

export default function AtelierTeaser() {
  const root = useRef<HTMLElement>(null);
  const [mount, setMount] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setMount(true), { rootMargin: "500px" });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % PRESETS.length), 4800);
    return () => clearInterval(t);
  }, []);

  return (
    <section ref={root} data-nav="light" className="relative overflow-hidden bg-cream py-24 md:py-36">
      <div className="wrap">
        <Seam index="07" label="Atelier — 3D" />
        <div className="mt-12 grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Reveal as="h2" className="display text-mega">
              Design a pair. <em>Stamp your name</em> on it.
            </Reveal>
            <p className="text-lede mt-8 max-w-[38ch] opacity-75">
              A working 3D model of how we build our slides. Change the silhouette, the leather, the sole and the thread, then
              press your brand into the footbed — in gold, silver or blind deboss.
            </p>
            <ul className="mono mt-8 space-y-2 opacity-70">
              <li>— 3 silhouettes · 6 leathers · 9 colours</li>
              <li>— Your text or logo stamped on the footbed</li>
              <li>— Send the finished spec to us on WhatsApp</li>
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <TLink href="/atelier" className="tag-btn" data-cursor="Open">
                Open the Atelier <Arrow />
              </TLink>
              <span className="mono opacity-60">
                Now showing: <span className="text-cognac">{PRESETS[i].label}</span>
              </span>
            </div>
          </div>
          <div className="relative h-[58vh] min-h-[380px] overflow-hidden rounded-[3px] md:col-span-7 md:h-[74vh]">
            {mount && <SandalScene config={PRESETS[i]} autoRotate zoom={false} />}
            <div className="pointer-events-none absolute inset-3 rounded-[2px] border-[1.5px] border-dashed border-cream/40" />
            <span className="mono pointer-events-none absolute bottom-5 left-5 text-cream/85">Drag to turn it</span>
          </div>
        </div>
      </div>
    </section>
  );
}
