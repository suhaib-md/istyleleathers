"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LogoMark } from "@/components/ui/Icons";

const VB = 360;
const C0 = VB / 2;
const R = 136; // text baseline radius
const CIRC = 2 * Math.PI * R;
const FS = 36;

/**
 * Words set around a circle with a brass diamond centred in every gap, turning slowly
 * (held still when motion is reduced). Gaps are evened out from the measured word widths.
 */
export default function WordRing({ words, className = "" }: { words: string[]; className?: string }) {
  const id = "ring" + useId().replace(/[^\w-]/g, "");
  const svg = useRef<SVGSVGElement>(null);
  const [lens, setLens] = useState<number[] | null>(null);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    let done = false;
    const measure = () => {
      if (done) return;
      const l = [...el.querySelectorAll<SVGTextElement>("[data-word]")].map((t) => t.getComputedTextLength());
      if (l.length && l.every((v) => v > 0)) {
        done = true;
        setLens(l);
      }
    };
    // display: none on wide screens — measure once it actually renders, with the web font in
    const ro = new ResizeObserver(() => document.fonts.ready.then(measure));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const L = lens ?? words.map((w) => w.length * 0.37 * FS);
  const gap = (CIRC - L.reduce((a, b) => a + b, 0)) / words.length;
  let at = gap / 2;
  const placed = words.map((w, i) => {
    const start = at;
    at += L[i] + gap;
    return { w, start, sep: ((at - gap / 2) / CIRC) * 360 };
  });
  const turn = -((gap / 2 + L[0] / 2) / CIRC) * 360; // first word centred at 12 o'clock
  const dy = C0 - R - FS * 0.34; // diamonds level with the middle of the capitals

  return (
    <div className={`relative aspect-square ${className}`} aria-hidden>
      <svg ref={svg} viewBox={`0 0 ${VB} ${VB}`} className="ring-turn anim-loop absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <path id={id} d={`M${C0} ${C0 - R}A${R} ${R} 0 1 1 ${C0} ${C0 + R}A${R} ${R} 0 1 1 ${C0} ${C0 - R}`} />
        </defs>
        <circle cx={C0} cy={C0} r={R - 30} fill="none" stroke="currentColor" strokeOpacity={0.22} strokeWidth={1.5} strokeDasharray="5 6" />
        <g transform={`rotate(${turn} ${C0} ${C0})`}>
          {placed.map(({ w, start, sep }) => (
            <g key={w}>
              <text data-word className="display italic" fontSize={FS} fill="currentColor">
                <textPath href={`#${id}`} startOffset={start}>
                  {w}
                </textPath>
              </text>
              <rect
                x={C0 - 4.5}
                y={dy - 4.5}
                width={9}
                height={9}
                className="fill-brass"
                transform={`rotate(${sep} ${C0} ${C0}) rotate(45 ${C0} ${dy})`}
              />
            </g>
          ))}
        </g>
      </svg>
      <LogoMark className="absolute left-1/2 top-1/2 h-[30%] -translate-x-1/2 -translate-y-1/2 text-tan" />
    </div>
  );
}
