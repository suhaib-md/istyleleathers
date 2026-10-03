"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  as?: "div" | "h1" | "h2" | "h3" | "p" | "span" | "ul" | "ol" | "section";
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** "lines" slides masked lines up; "chars" staggers letters; "words" fades words */
  split?: "lines" | "chars" | "words";
  /** play immediately instead of on scroll */
  immediate?: boolean;
  stagger?: number;
  start?: string;
};

/** Masked line / letter reveal for headings, triggered on scroll. */
export default function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  split = "lines",
  immediate = false,
  stagger,
  start = "top 88%",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as "div";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.8, delay, scrollTrigger: immediate ? undefined : { trigger: el, start, once: true } });
        return;
      }
      let st: SplitText | null = null;
      const run = () => {
        st = SplitText.create(el, {
          type: split === "chars" ? "lines,chars" : split === "words" ? "lines,words" : "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { opacity: 1 });
            const targets = split === "chars" ? self.chars : split === "words" ? self.words : self.lines;
            return gsap.from(targets, {
              yPercent: split === "words" ? 60 : 108,
              opacity: split === "words" ? 0 : 1,
              rotate: split === "chars" ? 4 : 0,
              duration: split === "chars" ? 1.0 : 1.15,
              ease: "soft",
              delay,
              stagger: stagger ?? (split === "chars" ? 0.022 : split === "words" ? 0.03 : 0.09),
              scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
            });
          },
        });
      };
      // wait for fonts so line breaks are right
      if (document.fonts?.status === "loaded") run();
      else document.fonts.ready.then(run);
      return () => st?.revert();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}
