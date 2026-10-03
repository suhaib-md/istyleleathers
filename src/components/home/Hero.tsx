"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { site } from "@/content/site";
import { TLink } from "@/components/providers/Transition";
import { Arrow } from "@/components/ui/Icons";

const LeatherHero = dynamic(() => import("@/components/three/LeatherHero"), { ssr: false });

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      let played = false;
      const play = () => {
        if (played) return;
        played = true;
        if (reduce) {
          gsap.to("[data-h]", { opacity: 1, duration: 0.9, stagger: 0.06 });
          return;
        }
        const tl = gsap.timeline({ defaults: { ease: "soft" } });
        tl.fromTo("[data-hl] > span", { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 1.4, stagger: 0.09 })
          .fromTo("[data-h]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1, stagger: 0.07 }, 0.5);
      };
      // the intro loader announces when it's done (or that it was skipped)
      const onReady = () => play();
      if ((window as unknown as { __istyleReady?: boolean }).__istyleReady) play();
      else window.addEventListener("istyle:ready", onReady, { once: true });
      const fb = setTimeout(play, 3000);

      // parallax out
      if (!reduce) {
        gsap.to("[data-hero-copy]", {
          yPercent: -18,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      }
      return () => {
        window.removeEventListener("istyle:ready", onReady);
        clearTimeout(fb);
      };
    },
    { scope: root }
  );

  return (
    // Everything sits in normal flow — the padding clears the fixed nav and the coordinates are the last
    // row — so on short or narrow screens the section grows instead of the copy sliding under either one.
    <section
      ref={root}
      data-nav="dark"
      className="on-dark relative flex min-h-[max(100svh,640px)] flex-col overflow-hidden pt-(--nav-h)"
    >
      <LeatherHero />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(26,16,10,.78)_0%,rgba(26,16,10,.45)_38%,rgba(26,16,10,0)_62%)] max-md:bg-[linear-gradient(0deg,rgba(26,16,10,.92)_0%,rgba(26,16,10,.6)_45%,rgba(26,16,10,0)_70%)]"
      />

      <div data-hero-copy className="wrap pointer-events-none relative z-10 flex w-full flex-1 flex-col justify-end pb-8 pt-6 md:justify-center md:py-8">
        <div className="max-w-[min(820px,62vw)] max-md:max-w-none">
          <p data-h className="mono mb-6 flex items-center gap-3 text-tan opacity-0">
            <span className="inline-block h-px w-10 bg-tan" />
            <span>
              <span className="hidden sm:inline">Leather goods · </span>Made in {site.town}<span className="hidden sm:inline">, {site.state}</span>
            </span>
          </p>
          <h1 className="display text-hero-fit text-cream" style={{ textShadow: "0 2px 30px rgba(0,0,0,.35)" }}>
            <span data-hl className="line-mask">
              <span>Leather,</span>
            </span>
            <span data-hl className="line-mask">
              <span>
                worked <em className="text-tan">by hand.</em>
              </span>
            </span>
          </h1>
          <p data-h className="mt-5 max-w-[34ch] text-[16px] leading-snug text-cream/80 opacity-0 sm:text-lede sm:mt-8">
            Sandals, bags and small leather goods — cut, stitched and finished in our own workshop.
            <span className="hidden sm:inline"> Made to order for you, and manufactured for brands who want theirs made right.</span>
          </p>
          <div data-h className="pointer-events-auto mt-7 flex flex-wrap gap-2.5 opacity-0 sm:mt-10 sm:gap-3">
            <TLink href="/collection" className="tag-btn max-sm:!px-4 max-sm:!py-3.5" data-cursor="Shop">
              <span className="sm:hidden">The collection</span>
              <span className="hidden sm:inline">See the collection</span> <Arrow />
            </TLink>
            <TLink href="/manufacturing" className="tag-btn tag-btn--dark max-sm:!px-4 max-sm:!py-3.5" data-cursor="B2B">
              <span className="sm:hidden">For brands</span>
              <span className="hidden sm:inline">Make for your brand</span> <Arrow />
            </TLink>
          </div>
        </div>
      </div>

      <div className="wrap mono pointer-events-none relative z-10 flex w-full items-end justify-between pb-8 text-cream/60 md:pb-10">
        <span data-h className="opacity-0">
          {site.coords}
          <span className="hidden sm:inline"> — {site.town} · {site.district} · {site.river} valley leather belt</span>
        </span>
        <span data-h className="hidden items-center gap-3 opacity-0 sm:flex">
          Move your cursor over the hide
          <span className="relative inline-block h-8 w-px overflow-hidden bg-cream/20">
            <span className="absolute inset-x-0 top-0 h-3 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-tan" />
          </span>
        </span>
      </div>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(300%)}}`}</style>
    </section>
  );
}
