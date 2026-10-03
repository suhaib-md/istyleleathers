"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * A stitched seam that sews itself across the page as you scroll,
 * with a needle leading the thread. Used as a section divider.
 */
export default function Seam({ label, index, className = "" }: { label?: string; index?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const thread = ref.current!.querySelector("[data-thread]");
      const needle = ref.current!.querySelector("[data-needle]");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 95%", end: "top 45%", scrub: 0.6 },
      });
      tl.fromTo(thread, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none" }, 0);
      tl.fromTo(needle, { left: "0%" }, { left: "100%", ease: "none" }, 0);
      tl.to(needle, { opacity: 0, duration: 0.05 }, 0.97);
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={`relative flex items-center gap-4 ${className}`} aria-hidden={!label}>
      {(index || label) && (
        <div className="mono flex shrink-0 items-center gap-3 opacity-70">
          {index && <span>({index})</span>}
          {label && <span>{label}</span>}
        </div>
      )}
      {/* overflow-hidden: the needle waits just left of the thread, where it would otherwise sit on the label */}
      <div className="relative h-4 flex-1 overflow-hidden">
        <div data-thread className="stitch-x absolute inset-x-0 top-1/2 -translate-y-1/2" />
        <svg
          data-needle
          className="motion-only absolute top-1/2 -translate-x-full -translate-y-1/2"
          width="46"
          height="10"
          viewBox="0 0 46 10"
          fill="none"
        >
          <path d="M1 5 H38" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <path d="M14 5 L44 3.6 Q46 5 44 6.4 Z" fill="currentColor" />
          <ellipse cx="20" cy="5" rx="3" ry="0.7" fill="var(--bg)" />
        </svg>
      </div>
    </div>
  );
}
