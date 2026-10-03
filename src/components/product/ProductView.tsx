"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import type { Product } from "@/content/products";
import { indexOf, related, categories } from "@/content/products";
import { site, waLink } from "@/content/site";
import { TLink } from "@/components/providers/Transition";
import { Arrow, WhatsApp } from "@/components/ui/Icons";
import Ph from "@/components/ui/Ph";
import ProductCard from "@/components/catalog/ProductCard";
import Seam from "@/components/ui/Seam";
import Lightbox from "./Lightbox";
import SizeGuide from "./SizeGuide";

function Accordion({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [o, setO] = useState(open);
  return (
    <div className="border-b border-ink/12">
      <button className="flex w-full items-center justify-between py-5 text-left" onClick={() => setO(!o)} aria-expanded={o}>
        <span className="serif text-[24px]">{title}</span>
        <span className={`relative h-3 w-3 transition-transform duration-500 ${o ? "rotate-45" : ""}`} aria-hidden>
          <span className="absolute left-0 top-1/2 h-px w-3 bg-current" />
          <span className="absolute left-1/2 top-0 h-3 w-px bg-current" />
        </span>
      </button>
      <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.22,1,.36,1)]" style={{ gridTemplateRows: o ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="pb-6 text-[16px] leading-relaxed opacity-80">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function ProductView({ p }: { p: Product }) {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const info = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [showBar, setShowBar] = useState(false);
  const [box, setBox] = useState<number | null>(null);
  const closeBox = useCallback(() => setBox(null), []);
  const cat = categories.find((c) => c.key === p.category)!;
  const enquire = waLink(
    `Hi I Style Leathers! I'm interested in "${p.name}" (${p.line}, ${p.colour}) — N° ${indexOf(p)}. Could you share price, sizes and delivery time?`
  );
  const isFoot = p.category === "footwear";

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-pin-in]", { y: 30, opacity: 0, duration: 1, ease: "soft", stagger: 0.06, delay: 0.15 });
      gsap.utils.toArray<HTMLElement>("[data-gimg]").forEach((el, i) => {
        if (i === 0) {
          gsap.fromTo(el, { clipPath: "inset(8% 8% 8% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "leather" });
          return;
        }
        gsap.from(el, { clipPath: "inset(100% 0 0 0)", duration: 1.2, ease: "leather", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      });
    },
    { scope: root }
  );

  // mobile swipe position
  const onScroll = () => {
    const r = rail.current!;
    setSlide(Math.round(r.scrollLeft / r.clientWidth));
  };

  // sticky mobile CTA after the info block scrolls away
  useEffect(() => {
    const el = info.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el.querySelector("[data-cta]")!);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} data-nav="light" className="bg-cream">
      <div className="wrap pt-24 md:pt-28">
        <nav className="mono flex items-center gap-2 opacity-60" aria-label="Breadcrumb">
          <TLink href="/" className="u-link hidden sm:inline">
            Home
          </TLink>
          <span className="hidden sm:inline">/</span>
          <TLink href={`/collection?c=${p.category}`} className="u-link">
            {cat.label}
          </TLink>
          <span>/</span>
          <span aria-current="page">{p.name}</span>
        </nav>
      </div>

      <div className="wrap grid gap-8 pb-20 pt-6 md:grid-cols-12 md:gap-10">
        {/* gallery: swipe rail on mobile, stacked on desktop */}
        <div className="md:col-span-7">
          <div ref={rail} onScroll={onScroll} className="no-bar -mx-[var(--gutter)] flex snap-x snap-mandatory overflow-x-auto md:mx-0 md:block md:space-y-4 md:overflow-visible">
            {p.images.map((src, i) => (
              <button
                key={src}
                data-gimg
                type="button"
                onClick={() => setBox(i)}
                aria-label={`Enlarge view ${i + 1} of ${p.name}`}
                className="relative block aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-bone md:rounded-[2px]"
                data-cursor="Zoom"
              >
                <Image
                  src={src}
                  alt={`${p.name} — view ${i + 1}`}
                  fill
                  preload={i === 0}
                  sizes="(max-width: 767px) 100vw, 58vw"
                  className="object-cover transition-transform duration-[1600ms] ease-out hover:scale-[1.06]"
                />
              </button>
            ))}
          </div>
          {p.images.length > 1 && (
            <div className="mt-4 flex justify-center gap-2 md:hidden">
              {p.images.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full bg-ink transition-all ${slide === i ? "w-6 opacity-90" : "w-1.5 opacity-25"}`} />
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div ref={info} className="md:col-span-5">
          <div className="md:sticky md:top-24">
            <p data-pin-in className="mono flex items-center gap-3 text-cognac">
              N° {indexOf(p)} <span className="h-px w-8 bg-cognac/50" /> {p.line}
            </p>
            <h1 data-pin-in className="display mt-4 text-[clamp(52px,6.2vw,104px)]">{p.name}</h1>
            <p data-pin-in className="mono mt-4 flex items-center gap-2 opacity-70">
              <span className="h-3.5 w-3.5 rounded-full ring-1 ring-ink/20" style={{ background: p.swatch }} /> {p.colour}
            </p>
            <p data-pin-in className="text-lede mt-8 opacity-85">{p.story}</p>

            <div data-pin-in className="mt-8 flex flex-wrap gap-2">
              {p.materials.map((m) => (
                <span key={m} className="chip">
                  {m}
                </span>
              ))}
            </div>

            <div data-pin-in data-cta className="mt-10 rounded-[3px] border border-ink/12 bg-paper p-6">
              <div className="flex items-baseline justify-between">
                <span className="serif text-[28px] italic">Price on request</span>
                <span className="mono opacity-55">Made to order</span>
              </div>
              <p className="mt-2 text-[14.5px] opacity-65">
                Message us with the piece{isFoot ? " and your size" : ""} — we reply with price, colour options and delivery time.
              </p>
              {isFoot && (
                <div className="mt-3">
                  <SizeGuide />
                </div>
              )}
              <a href={enquire} target="_blank" rel="noopener" className="tag-btn tag-btn--wa mt-5 w-full justify-center">
                <WhatsApp size={16} /> Enquire on WhatsApp
              </a>
              <TLink href={`/manufacturing?product=${p.slug}#enquire`} className="mono mt-4 flex items-center justify-center gap-2 opacity-75 hover:opacity-100">
                <span className="u-link u-link--always">Need it in bulk or under your label?</span> <Arrow />
              </TLink>
            </div>

            <ul data-pin-in className="mono mt-8 grid grid-cols-3 gap-3 text-center opacity-75">
              <li className="rounded-[3px] border border-dashed border-ink/20 px-2 py-3">Handmade in {site.town}</li>
              <li className="rounded-[3px] border border-dashed border-ink/20 px-2 py-3">Easy WhatsApp ordering</li>
              <li className="rounded-[3px] border border-dashed border-ink/20 px-2 py-3">Pan-India delivery</li>
            </ul>

            <div data-pin-in className="mt-10">
              <Accordion title="Details" open>
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <span className="mt-[0.7em] h-px w-4 shrink-0 bg-cognac" /> {f}
                    </li>
                  ))}
                </ul>
              </Accordion>
              <Accordion title="Spec sheet">
                <dl className="mono grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 normal-case tracking-normal">
                  <dt className="uppercase opacity-50">Ref</dt>
                  <dd>IS-{p.category.slice(0, 2).toUpperCase()}-{indexOf(p)}</dd>
                  <dt className="uppercase opacity-50">Category</dt>
                  <dd>
                    {cat.label} / {p.type}
                  </dd>
                  <dt className="uppercase opacity-50">Colourway</dt>
                  <dd>{p.colour}</dd>
                  <dt className="uppercase opacity-50">Materials</dt>
                  <dd>{p.materials.join(" · ")}</dd>
                  {isFoot && (
                    <>
                      <dt className="uppercase opacity-50">Sizes</dt>
                      <dd>
                        <Ph v="[UK 6–11 — confirm]" />
                      </dd>
                    </>
                  )}
                  <dt className="uppercase opacity-50">Lead time</dt>
                  <dd>
                    <Ph v="[X–X days]" />
                  </dd>
                  <dt className="uppercase opacity-50">Made in</dt>
                  <dd>
                    {site.town}, {site.state}
                  </dd>
                </dl>
              </Accordion>
              <Accordion title="Make it yours">
                Most of our pieces can be made in another leather or colour, with different hardware or stitching — and with your
                initials or brand pressed in. Ask on WhatsApp.
                {isFoot && (
                  <>
                    {" "}
                    Or try it yourself in the{" "}
                    <TLink href="/atelier" className="u-link u-link--always text-cognac">
                      3D Atelier
                    </TLink>
                    .
                  </>
                )}
              </Accordion>
              <Accordion title="Care">
                Wipe with a soft, slightly damp cloth and let it dry away from direct sun. Condition the leather every few months.
                Keep {isFoot ? "your pair" : "it"} out of standing water and store {p.category === "bags" ? "stuffed with paper in a dust bag" : "somewhere dry and airy"}.
              </Accordion>
              <Accordion title="Delivery & exchanges">
                We ship across India. Delivery time depends on the piece and the order — we&apos;ll confirm when you enquire. Exchange
                policy: <Ph v="[add your exchange / return terms]" />
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-paper py-20 md:py-28">
        <div className="wrap">
          <Seam label="You may also like" />
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
            {related(p).map((r) => (
              <ProductCard key={r.slug} p={r} />
            ))}
          </div>
        </div>
      </section>

      {box !== null && <Lightbox images={p.images} index={box} alt={`${p.name} — ${p.line}`} onClose={closeBox} />}

      {/* mobile sticky CTA */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[55] border-t border-ink/10 bg-cream/95 p-3 backdrop-blur transition-transform duration-500 md:hidden ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <a href={enquire} target="_blank" rel="noopener" className="tag-btn tag-btn--wa w-full justify-center">
          <WhatsApp size={16} /> Enquire — {p.name}
        </a>
      </div>
    </div>
  );
}
