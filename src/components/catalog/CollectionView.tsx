"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { products, categories, indexOf, type Category } from "@/content/products";
import ProductCard from "./ProductCard";
import { TLink } from "@/components/providers/Transition";
import { Arrow } from "@/components/ui/Icons";

type View = "grid" | "index";

/**
 * Reads ?c= in the browser. Kept apart so it alone opts out of static rendering —
 * calling useSearchParams in the view itself left the whole collection out of the HTML.
 */
function CategoryFromUrl({ onChange }: { onChange: (c: Category | null) => void }) {
  const c = useSearchParams().get("c");
  useLayoutEffect(() => {
    onChange(categories.some((x) => x.key === c) ? (c as Category) : null);
  }, [c, onChange]);
  return null;
}

export default function CollectionView() {
  const router = useRouter();
  const [cat, setCatState] = useState<Category | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [view, setView] = useState<View>("grid");
  const grid = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);

  const inCat = useMemo(() => products.filter((p) => !cat || p.category === cat), [cat]);
  const types = useMemo(() => Array.from(new Set(inCat.map((p) => p.type))), [inCat]);
  const list = useMemo(() => inCat.filter((p) => !type || p.type === type), [inCat, type]);

  const setCat = (k: Category | null) => {
    setType(null);
    setCatState(k);
    router.replace(k ? `/collection?c=${k}` : "/collection", { scroll: false });
  };

  // the first view arrives in the HTML, already on screen — only animate changes to it
  const shown = useRef(false);
  useGSAP(
    () => {
      if (!shown.current) {
        shown.current = true;
        return;
      }
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-item]",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "soft", stagger: { each: 0.045, from: "start" }, overwrite: true }
      );
    },
    { scope: grid, dependencies: [cat, type, view] }
  );

  // floating preview for the index view
  const onMove = (e: React.PointerEvent) => {
    const el = preview.current;
    if (!el) return;
    gsap.to(el, { x: e.clientX + 24, y: e.clientY - 120, duration: 0.6, ease: "power3" });
  };

  const counts = (k: Category | null) => products.filter((p) => !k || p.category === k).length;
  const blurb = cat ? categories.find((x) => x.key === cat)!.blurb : "Everything we make, in one place. Every piece is made to order — enquire on WhatsApp for price and timing.";

  return (
    <>
      <Suspense fallback={null}>
        <CategoryFromUrl onChange={setCatState} />
      </Suspense>
      <header className="wrap pb-10 pt-32 md:pt-44">
        <p className="mono mb-6 opacity-60">(01) The collection — {products.length} pieces · price on request</p>
        <h1 className="display text-hero">
          {cat ? (
            <>
              {categories.find((x) => x.key === cat)!.label}
              <em className="text-cognac">.</em>
            </>
          ) : (
            <>
              The <em>Collection.</em>
            </>
          )}
        </h1>
        <p className="text-lede mt-8 max-w-[52ch] opacity-75">{blurb}</p>
      </header>

      <div className="below-nav sticky z-30 border-y border-ink/10 bg-cream/90 backdrop-blur-md">
        <div className="wrap flex items-center justify-between gap-6 pt-3">
          <div className="no-bar flex gap-6 overflow-x-auto md:gap-9" role="tablist" aria-label="Category">
            {[{ key: null, label: "All" }, ...categories].map((x) => {
              const on = cat === x.key;
              return (
                <button
                  key={x.label}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setCat(x.key as Category | null)}
                  className={`serif shrink-0 text-[26px] transition-opacity md:text-[32px] ${on ? "italic opacity-100" : "opacity-40 hover:opacity-80"}`}
                >
                  {x.label}
                  <sup className="mono ml-1 align-super text-[10px] not-italic">{counts(x.key as Category | null)}</sup>
                </button>
              );
            })}
          </div>
          <div className="hidden shrink-0 overflow-hidden rounded-full border border-ink/15 md:flex" role="group" aria-label="View">
            {(["grid", "index"] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`mono px-4 py-2 ${view === v ? "bg-ink text-cream" : ""}`} aria-pressed={view === v}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="wrap no-bar flex gap-2 overflow-x-auto py-3">
          <button className={`chip shrink-0 ${type === null ? "is-on" : ""}`} onClick={() => setType(null)} aria-pressed={type === null}>
            All types
          </button>
          {types.map((t) => (
            <button key={t} className={`chip shrink-0 ${type === t ? "is-on" : ""}`} onClick={() => setType(t)} aria-pressed={type === t}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div ref={grid} className="wrap py-12 md:py-16">
        <p className="mono mb-8 opacity-50">
          Showing {list.length} of {inCat.length}
        </p>

        {view === "grid" ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {list.map((p, i) => (
              <div key={p.slug} data-item className={i % 9 === 4 && p.images.length > 1 ? "col-span-2" : ""}>
                <ProductCard
                  p={p}
                  feature={i % 9 === 4 && p.images.length > 1}
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  loading={i < 4 ? "eager" : undefined}
                  fetchPriority={i < 2 ? "high" : undefined}
                />
              </div>
            ))}
          </div>
        ) : (
          <div onPointerMove={onMove} onPointerLeave={() => setHover(null)} className="relative">
            <div className="mono grid grid-cols-[60px_1.4fr_1fr_1fr_40px] gap-4 border-b border-ink/15 pb-3 opacity-50">
              <span>N°</span>
              <span>Piece</span>
              <span>Type</span>
              <span>Colour</span>
              <span />
            </div>
            {list.map((p) => (
              <TLink
                key={p.slug}
                data-item
                href={`/collection/${p.slug}`}
                onPointerEnter={() => setHover(p.slug)}
                className="group grid grid-cols-[60px_1.4fr_1fr_1fr_40px] items-center gap-4 border-b border-ink/10 py-4 transition-colors hover:bg-bone/60"
              >
                <span className="mono opacity-50">{indexOf(p)}</span>
                <span className="serif text-[30px] leading-none transition-transform duration-500 group-hover:translate-x-2 group-hover:italic">{p.name}</span>
                <span className="mono opacity-70">{p.line}</span>
                <span className="mono flex items-center gap-2 opacity-70">
                  <span className="h-3 w-3 rounded-full" style={{ background: p.swatch }} /> {p.colour}
                </span>
                <Arrow className="opacity-0 transition-opacity group-hover:opacity-100" />
              </TLink>
            ))}
            <div
              ref={preview}
              className="pointer-events-none fixed left-0 top-0 z-40 hidden aspect-[4/5] w-[260px] overflow-hidden rounded-[2px] shadow-2xl transition-opacity duration-300 md:block"
              style={{ opacity: hover ? 1 : 0 }}
              aria-hidden
            >
              {list.map((p) => (
                <Image
                  key={p.slug}
                  src={p.images[0]}
                  alt=""
                  fill
                  sizes="260px"
                  className="object-cover transition-opacity duration-300"
                  style={{ opacity: hover === p.slug ? 1 : 0 }}
                />
              ))}
            </div>
          </div>
        )}

        {list.length === 0 && <p className="serif py-20 text-center text-[32px] opacity-60">Nothing here yet — ask us, we probably make it.</p>}
      </div>
    </>
  );
}
