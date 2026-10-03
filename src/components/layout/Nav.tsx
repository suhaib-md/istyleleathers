"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { nav, site, waGeneral } from "@/content/site";
import { TLink } from "@/components/providers/Transition";
import { useLenis } from "@/components/providers/SmoothScroll";
import { LogoMark, WhatsApp, Instagram, ArrowUpRight } from "@/components/ui/Icons";

export default function Nav() {
  const pathname = usePathname();
  const bar = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  // hide on scroll down / show on scroll up + theme from section underneath
  useEffect(() => {
    let lastY = window.scrollY;
    let hidden = false;
    // a fresh page always starts with the bar visible
    gsap.set(bar.current, { yPercent: 0 });
    document.documentElement.style.removeProperty("--nav-offset");
    let raf = 0;
    const check = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 40);
      if (!open) {
        const down = y > lastY + 4 && y > 220;
        const up = y < lastY - 4;
        if (down && !hidden) {
          hidden = true;
          gsap.to(bar.current, { yPercent: -110, duration: 0.6, ease: "leather" });
          document.documentElement.style.setProperty("--nav-offset", "0px");
        } else if ((up || y < 220) && hidden) {
          hidden = false;
          gsap.to(bar.current, { yPercent: 0, duration: 0.6, ease: "soft" });
          document.documentElement.style.removeProperty("--nav-offset");
        }
      }
      lastY = y;
      const probe = document.elementsFromPoint(window.innerWidth / 2, 34);
      const sec = probe.map((n) => (n as HTMLElement).closest?.("[data-nav]")).find(Boolean) as HTMLElement | undefined;
      setTheme(sec?.dataset.nav === "dark" ? "dark" : "light");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const t = setTimeout(check, 400);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [open, pathname]);

  // menu open / close animation
  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
      gsap.set(el, { visibility: "visible" });
      const reduce = prefersReducedMotion();
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduce ? 0 : 0.8, ease: "leather" });
      gsap.fromTo(
        el.querySelectorAll("[data-mi]"),
        { yPercent: 110 },
        { yPercent: 0, duration: reduce ? 0 : 0.9, ease: "soft", stagger: 0.06, delay: 0.25 }
      );
    } else if (el.style.visibility === "visible") {
      lenis?.start();
      document.body.style.overflow = "";
      gsap.to(el, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.6,
        ease: "leather",
        onComplete: () => {
          gsap.set(el, { visibility: "hidden" });
        },
      });
    }
  }, [open, lenis]);

  // close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const dark = theme === "dark" || open;

  return (
    <>
      <header
        ref={bar}
        className={`fixed inset-x-0 top-0 z-[70] transition-colors duration-500 ${dark ? "text-cream" : "text-ink"}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ${
            scrolled && !open ? "opacity-100" : "opacity-0"
          } ${dark ? "bg-leather/85" : "bg-cream/90"} backdrop-blur-md`}
        />
        <div className="wrap flex h-[64px] items-center justify-between gap-6 md:h-[72px]">
          <TLink href="/" className="group flex items-center gap-3" aria-label="I Style Leathers — home">
            <LogoMark className="h-9 w-auto transition-transform duration-700 group-hover:rotate-[-8deg]" />
            <span className="leading-none">
              <span className="serif block text-[22px] tracking-tight">I Style</span>
              <span className="mono-sm block opacity-60">Leathers · Melvisharam</span>
            </span>
          </TLink>

          {/* needs ~1110px; at lg it wraps onto two lines, so it waits for xl */}
          <nav className="hidden items-center gap-8 xl:flex" aria-label="Primary">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <TLink key={item.href} href={item.href} className="group mono flex items-baseline gap-1.5">
                  <span className="opacity-40">{item.n}</span>
                  <span className={`u-link ${active ? "u-link--always" : ""}`}>{item.label}</span>
                </TLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={waGeneral}
              target="_blank"
              rel="noopener"
              className={`mono hidden items-center gap-2 rounded-full border px-4 py-2.5 transition-colors sm:flex ${
                dark ? "border-cream/30 hover:bg-cream hover:text-ink" : "border-ink/20 hover:bg-ink hover:text-cream"
              }`}
            >
              <WhatsApp size={15} /> Order on WhatsApp
            </a>
            <button
              onClick={() => setOpen((o) => !o)}
              className="mono flex h-11 items-center gap-3 xl:hidden"
              aria-expanded={open}
              aria-controls="site-menu"
            >
              <span>{open ? "Close" : "Menu"}</span>
              <span className="relative block h-3 w-6">
                <span
                  className={`absolute left-0 top-0 h-px w-6 bg-current transition-transform duration-500 ${open ? "translate-y-[6px] rotate-45" : ""}`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-px w-6 bg-current transition-transform duration-500 ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="site-menu"
        ref={menu}
        className="on-dark fixed inset-0 z-[65] flex flex-col justify-between overflow-y-auto pb-8 pt-28"
        style={{ visibility: "hidden" }}
        data-lenis-prevent
      >
        <div className="pointer-events-none absolute inset-3 rounded border-[1.5px] border-dashed border-thread/20" />
        <nav className="wrap flex flex-col" aria-label="Mobile">
          {[{ href: "/", label: "Home", n: "00" }, ...nav].map((item) => (
            <div key={item.href} className="overflow-hidden border-b border-cream/10">
              <div data-mi>
                <TLink href={item.href} className="flex items-baseline justify-between py-3" onClick={() => setOpen(false)}>
                  <span className="display text-[11.5vw] leading-none sm:text-7xl">{item.label}</span>
                  <span className="mono opacity-50">{item.n}</span>
                </TLink>
              </div>
            </div>
          ))}
        </nav>
        <div className="wrap mt-10 grid gap-4 text-cream/80">
          <div className="overflow-hidden">
            <a data-mi href={waGeneral} target="_blank" rel="noopener" className="tag-btn tag-btn--wa">
              <WhatsApp size={16} /> {site.phoneDisplay}
            </a>
          </div>
          <div className="overflow-hidden">
            <div data-mi className="mono flex flex-wrap gap-x-6 gap-y-2">
              <a href={site.instagramUrl} target="_blank" rel="noopener" className="flex items-center gap-2">
                <Instagram size={14} /> @{site.instagram} <ArrowUpRight />
              </a>
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <span className="opacity-60">
                {site.town}, {site.state}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
