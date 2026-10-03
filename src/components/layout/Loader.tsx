"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/** First-visit intro: the mark is "stamped" while a counter runs, then the panel lifts. */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("istyle-intro") === "1";
      sessionStorage.setItem("istyle-intro", "1");
    } catch {}
    if (seen || prefersReducedMotion()) {
      setShow(false);
      (window as unknown as { __istyleReady?: boolean }).__istyleReady = true;
      window.dispatchEvent(new Event("istyle:ready"));
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const counter = el.querySelector("[data-count]") as HTMLElement;
    const obj = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = "";
        setShow(false);
      },
    });
    tl.to(obj, {
      v: 100,
      duration: 1.7,
      ease: "power2.inOut",
      onUpdate: () => (counter.textContent = String(Math.round(obj.v)).padStart(3, "0")),
    })
      .fromTo("[data-stamp]", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.5, ease: "power2.inOut" }, 0.1)
      .fromTo("[data-stamp]", { scale: 1.12 }, { scale: 1, duration: 1.6, ease: "soft" }, 0.1)
      .to("[data-stitch]", { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 0)
      .add(() => {
        (window as unknown as { __istyleReady?: boolean }).__istyleReady = true;
        window.dispatchEvent(new Event("istyle:ready"));
      }, 1.85)
      .to(el.querySelectorAll("[data-fadeout]"), { opacity: 0, y: -10, duration: 0.4, stagger: 0.04 }, 1.85)
      .to(el, { clipPath: "inset(0 0 100% 0)", duration: 1.0, ease: "leather" }, 2.0);
    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div
      ref={root}
      className="intro-loader fixed inset-0 z-[100] flex items-center justify-center bg-leather text-thread"
      style={{ clipPath: "inset(0 0 0% 0)" }}
      aria-hidden
    >
      <svg data-fadeout className="pointer-events-none absolute inset-3 h-[calc(100%-24px)] w-[calc(100%-24px)]" preserveAspectRatio="none">
        <rect
          data-stitch
          x="1"
          y="1"
          width="99.6%"
          height="99.6%"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="7 6"
          pathLength={1000}
          style={{ strokeDashoffset: 1000 }}
        />
      </svg>
      <div data-fadeout className="relative h-[180px] w-[130px]">
        <div
          className="absolute inset-0 bg-thread/15"
          style={{ WebkitMask: "url(/brand/logo-mark.png) center/contain no-repeat", mask: "url(/brand/logo-mark.png) center/contain no-repeat" }}
        />
        <div
          data-stamp
          className="absolute inset-0 bg-tan"
          style={{ WebkitMask: "url(/brand/logo-mark.png) center/contain no-repeat", mask: "url(/brand/logo-mark.png) center/contain no-repeat" }}
        />
      </div>
      <div data-fadeout className="mono absolute bottom-10 left-10 opacity-70">
        I Style Leathers
        <br />
        Melvisharam · Tamil Nadu
      </div>
      <div data-fadeout className="display absolute bottom-6 right-10 text-[64px] tabular-nums md:text-[96px]">
        <span data-count>000</span>
      </div>
    </div>
  );
}
