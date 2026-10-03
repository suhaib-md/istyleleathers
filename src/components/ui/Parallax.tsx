"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/** Moves its content by ±amount% of its height while it crosses the viewport. */
export default function Parallax({ children, amount = 10, className = "" }: { children: React.ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ref.current,
        { yPercent: -amount },
        { yPercent: amount, ease: "none", scrollTrigger: { trigger: ref.current!.parentElement, start: "top bottom", end: "bottom top", scrub: true } }
      );
    },
    { scope: ref }
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
