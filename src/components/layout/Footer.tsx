"use client";

import { site, waGeneral } from "@/content/site";
import { TLink } from "@/components/providers/Transition";
import { useLenis } from "@/components/providers/SmoothScroll";
import { WhatsApp, Instagram, Mail, ArrowUpRight, LogoMark } from "@/components/ui/Icons";
import Marquee from "@/components/ui/Marquee";
import WordRing from "@/components/ui/WordRing";
import { Fragment, useEffect, useState } from "react";
import { setMotion } from "@/lib/gsap";

const craft = ["Cut", "Skive", "Stitch", "Edge", "Burnish", "Press", "Inspect", "Pack"];

const Diamond = () => <span className="inline-block h-2 w-2 shrink-0 rotate-45 bg-brass" />;

const cols = [
  {
    title: "Shop",
    links: [
      { href: "/collection?c=footwear", label: "Footwear" },
      { href: "/collection?c=bags", label: "Bags" },
      { href: "/collection?c=accessories", label: "Accessories" },
      { href: "/collection", label: "Everything" },
    ],
  },
  {
    title: "Make with us",
    links: [
      { href: "/manufacturing", label: "Private label" },
      { href: "/manufacturing#process", label: "How a project runs" },
      { href: "/manufacturing#enquire", label: "Bulk & corporate" },
      { href: "/atelier", label: "Atelier — design in 3D" },
    ],
  },
  {
    title: "Workshop",
    links: [
      { href: "/story", label: "Our story" },
      { href: "/story#floor", label: "From the floor" },
      { href: "/care", label: "Leather care" },
      { href: "/contact", label: "Visit / contact" },
    ],
  },
];

export default function Footer() {
  const lenis = useLenis();
  const year = new Date().getFullYear();
  const [motion, setM] = useState<"full" | "reduced">("full");
  useEffect(() => {
    setM(document.documentElement.dataset.motion === "reduced" ? "reduced" : "full");
  }, []);

  return (
    <footer data-nav="dark" className="on-dark relative overflow-hidden">
      <div className="border-y border-cream/10" aria-hidden>
        {/* tablet / desktop: a running band — or, with motion reduced, all eight in one evenly spaced row */}
        <div className="hidden py-5 md:block">
          <div className="motion-only">
            <Marquee duration={55}>
              {craft.map((w) => (
                <span key={w} className="display flex items-center gap-10 pr-10 text-[72px] italic text-cream/85">
                  {w}
                  <Diamond />
                </span>
              ))}
            </Marquee>
          </div>
          <div className="reduced-show hidden">
            <div className="wrap display flex items-center justify-between gap-[0.3em] text-[min(64px,4.1vw)] italic text-cream/85">
              {craft.map((w, i) => (
                <Fragment key={w}>
                  {i > 0 && <Diamond />}
                  <span>{w}</span>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
        {/* phones: all eight words on a slowly turning ring */}
        <div className="flex justify-center py-12 md:hidden">
          <WordRing words={craft} className="w-[min(72vw,300px)] text-cream/85" />
        </div>
      </div>

      <div className="wrap grid gap-14 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
          <p className="mono mb-6 text-tan">Talk to the workshop</p>
          <p className="display text-big">
            Send us a sketch, <em>a photo,</em> or just an idea.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={waGeneral} target="_blank" rel="noopener" className="tag-btn tag-btn--wa">
              <WhatsApp size={16} /> {site.phoneDisplay}
            </a>
            <a href={`mailto:${site.email}`} className="tag-btn tag-btn--cream">
              <Mail size={16} /> Email us
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-6 md:col-start-7">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="mono mb-5 opacity-50">{c.title}</p>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <TLink href={l.href} className="u-link text-[17px] text-cream/85 hover:text-cream">
                      {l.label}
                    </TLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-3">
            <div className="stitch-x mb-6 text-thread" />
            <div className="mono flex flex-wrap gap-x-8 gap-y-3 text-cream/70">
              <a href={site.instagramUrl} target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-cream">
                <Instagram size={14} /> @{site.instagram} <ArrowUpRight />
              </a>
              <a href={`mailto:${site.email}`} className="hover:text-cream">
                {site.email}
              </a>
              <span>
                {site.town} · {site.district} · {site.state}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* debossed wordmark */}
      <div className="relative select-none px-[2vw]" aria-hidden>
        <div
          className="display whitespace-nowrap text-center leading-[0.78] text-leather"
          style={{
            fontSize: "min(19.5vw, 400px)",
            textShadow: "-1px -2px 1px rgba(0,0,0,.55), 1px 2px 1px rgba(255,236,210,.10)",
          }}
        >
          I Style <em>Leathers</em>
        </div>
      </div>

      <div className="wrap mono flex flex-col gap-4 border-t border-cream/10 py-6 text-cream/55 md:flex-row md:items-center md:justify-between">
        <span className="flex items-center gap-3">
          <LogoMark className="h-5 text-tan" /> © {year} {site.name} · {site.tagline}
        </span>
        <span>{site.coords} — Handmade in Tamil Nadu, India</span>
        <button
          onClick={() => setMotion(motion === "full" ? "reduced" : "full")}
          className="u-link self-start md:self-auto"
          aria-label={motion === "full" ? "Reduce motion" : "Turn on full motion"}
        >
          Motion: {motion === "full" ? "Full" : "Reduced"} — switch
        </button>
        <button onClick={() => (lenis ? lenis.scrollTo(0, { duration: 2 }) : window.scrollTo({ top: 0, behavior: "smooth" }))} className="u-link self-start md:self-auto">
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}
