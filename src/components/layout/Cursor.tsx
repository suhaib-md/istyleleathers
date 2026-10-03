"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/**
 * A small cognac dot that grows into a labelled disc over anything with
 * [data-cursor="Label"]. Only on fine pointers.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");
    const el = dot.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    let current = "";
    let hidden = true;

    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      if (hidden) {
        hidden = false;
        gsap.to(el, { opacity: 1, duration: 0.3 });
      }
      const t = (e.target as HTMLElement)?.closest?.("[data-cursor], a, button, [role=button], input, textarea, select") as HTMLElement | null;
      let next = "";
      let mode: "label" | "link" | "text" | "none" = "none";
      if (t) {
        if (t.matches("input, textarea, select")) mode = "text";
        else if (t.dataset.cursor) {
          next = t.dataset.cursor;
          mode = "label";
        } else mode = "link";
      }
      if (next !== current || el.dataset.mode !== mode) {
        current = next;
        el.dataset.mode = mode;
        setLabel(next);
        gsap.to(el, {
          width: mode === "label" ? 92 : mode === "link" ? 44 : mode === "text" ? 4 : 12,
          height: mode === "label" ? 92 : mode === "link" ? 44 : mode === "text" ? 26 : 12,
          duration: 0.45,
          ease: "soft",
        });
      }
    };
    const leave = () => {
      hidden = true;
      gsap.to(el, { opacity: 0, duration: 0.3 });
    };
    const down = () => gsap.to(el, { scale: 0.8, duration: 0.2 });
    const up = () => gsap.to(el, { scale: 1, duration: 0.3 });

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  if (!enabled) return <div ref={dot} hidden />;

  return (
    <div
      ref={dot}
      aria-hidden
      data-mode="none"
      className="pointer-events-none fixed left-0 top-0 z-[90] flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cognac text-cream opacity-0 mix-blend-normal data-[mode=link]:bg-cognac/25 data-[mode=link]:ring-1 data-[mode=link]:ring-cognac data-[mode=text]:rounded-[2px]"
      style={{ willChange: "transform" }}
    >
      <span className="mono-sm whitespace-nowrap text-[10px]" style={{ opacity: label ? 1 : 0, transition: "opacity .3s" }}>
        {label}
      </span>
    </div>
  );
}
