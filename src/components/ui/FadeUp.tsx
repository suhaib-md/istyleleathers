"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/** Fades + lifts children (or [data-fade] descendants, staggered) on scroll. */
export default function FadeUp({
  children,
  className,
  delay = 0,
  y = 28,
  stagger = 0.08,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  stagger?: number;
  as?: "div" | "h1" | "h2" | "h3" | "p" | "span" | "ul" | "ol" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as "div";
  useGSAP(
    () => {
      const el = ref.current!;
      const kids = el.querySelectorAll("[data-fade]");
      const targets = kids.length ? kids : [el];
      gsap.from(targets, {
        y: prefersReducedMotion() ? 0 : y,
        opacity: 0,
        duration: 1.1,
        ease: "soft",
        delay,
        stagger,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    },
    { scope: ref }
  );
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
