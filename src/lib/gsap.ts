"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);
  CustomEase.create("leather", "0.76,0,0.24,1");
  CustomEase.create("soft", "0.22,1,0.36,1");
  if (process.env.NODE_ENV !== "production") Object.assign(window, { gsap, ScrollTrigger });
}

/**
 * Motion preference. Defaults to the OS setting, but visitors can override it
 * with the toggle in the footer (stored in localStorage). The resolved value is
 * written to <html data-motion> by an inline script before first paint.
 */
export const prefersReducedMotion = () =>
  typeof document !== "undefined" && document.documentElement.dataset.motion === "reduced";

export function setMotion(mode: "full" | "reduced") {
  try {
    localStorage.setItem("istyle-motion", mode);
  } catch {}
  window.location.reload();
}


export { gsap, ScrollTrigger, SplitText, useGSAP };
