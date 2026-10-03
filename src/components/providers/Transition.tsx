"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Ctx = { go: (href: string, label?: string) => void };
const TransitionContext = createContext<Ctx>({ go: () => {} });
export const useTransitionNav = () => useContext(TransitionContext);

const LABELS: Record<string, string> = {
  "/": "Home",
  "/collection": "The Collection",
  "/manufacturing": "For Brands",
  "/atelier": "Atelier",
  "/story": "Our Story",
  "/contact": "Contact",
  "/care": "Leather care",
};

function labelFor(href: string) {
  const path = href.split(/[?#]/)[0];
  if (LABELS[path]) return LABELS[path];
  if (path.startsWith("/collection/")) return "The Collection";
  return "I Style";
}

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const pending = useRef<string | null>(null);
  const [label, setLabel] = useState("");

  const go = useCallback(
    (href: string, l?: string) => {
      const target = href.split("#")[0];
      if (busy.current) return;
      if (target === pathname || prefersReducedMotion() || !curtain.current) {
        router.push(href);
        return;
      }
      busy.current = true;
      pending.current = target.split("?")[0];
      setLabel(l ?? labelFor(href));
      router.prefetch(href);
      const el = curtain.current;
      gsap.set(el, { yPercent: 100, visibility: "visible" });
      gsap.to(el, {
        yPercent: 0,
        duration: 0.75,
        ease: "leather",
        onComplete: () => router.push(href),
      });
      gsap.fromTo(
        el.querySelector("[data-curtain-label]"),
        { yPercent: 110 },
        { yPercent: 0, duration: 0.8, delay: 0.25, ease: "soft" }
      );
    },
    [pathname, router]
  );

  // reveal once the new route is mounted
  useEffect(() => {
    if (!busy.current || !curtain.current) return;
    const el = curtain.current;
    const t = setTimeout(() => {
      gsap.to(el, {
        yPercent: -100,
        duration: 0.85,
        ease: "leather",
        delay: 0.1,
        onComplete: () => {
          gsap.set(el, { visibility: "hidden", yPercent: 100 });
          busy.current = false;
        },
      });
    }, 60);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ go }}>
      {children}
      <div
        ref={curtain}
        aria-hidden
        className="fixed inset-0 z-[80] flex items-center justify-center bg-leather text-cream"
        style={{ visibility: "hidden", transform: "translateY(100%)" }}
      >
        <div className="pointer-events-none absolute inset-3 rounded-[4px] border-[1.5px] border-dashed border-thread/35" />
        <div
          className="absolute left-1/2 top-1/2 h-[140px] w-[100px] -translate-x-1/2 -translate-y-[150%] bg-thread/80 opacity-60"
          style={{
            WebkitMask: "url(/brand/logo-mark.png) center/contain no-repeat",
            mask: "url(/brand/logo-mark.png) center/contain no-repeat",
          }}
        />
        <div className="overflow-hidden">
          <div data-curtain-label className="display text-big italic">
            {label}
          </div>
        </div>
        <div className="mono absolute bottom-8 left-1/2 -translate-x-1/2 opacity-60">
          I Style Leathers — Melvisharam
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

type TLinkProps = React.ComponentProps<typeof Link> & { label?: string };

/** Internal link that plays the leather-curtain transition. */
export function TLink({ href, onClick, label, ...rest }: TLinkProps) {
  const { go } = useTransitionNav();
  const h = typeof href === "string" ? href : href.pathname ?? "/";
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (rest.target === "_blank") return;
        e.preventDefault();
        go(h, label);
      }}
    />
  );
}
