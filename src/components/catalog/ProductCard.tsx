"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Product } from "@/content/products";
import { indexOf } from "@/content/products";
import { TLink } from "@/components/providers/Transition";
import { Arrow } from "@/components/ui/Icons";

export default function ProductCard({
  p,
  feature = false,
  sizes = "(max-width: 767px) 50vw, 25vw",
  loading,
  fetchPriority,
}: {
  p: Product;
  feature?: boolean;
  sizes?: string;
  /** for cards in the first row: on screen at load, so don't lazy-load them */
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}) {
  const card = useRef<HTMLAnchorElement>(null);
  const second = p.images[1];
  // a feature card spans two columns of the collection grid (2 → 3 → 4 columns)
  const imgSizes = feature ? "(min-width: 1024px) 50vw, (min-width: 768px) 66vw, 100vw" : sizes;

  // gentle 3D tilt toward the cursor
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = card.current!.querySelector<HTMLElement>("[data-tilt]")!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => {
    const el = card.current!.querySelector<HTMLElement>("[data-tilt]")!;
    el.style.transform = "";
  };

  return (
    <TLink
      ref={card}
      href={`/collection/${p.slug}`}
      data-cursor="View"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group block ${feature ? "md:col-span-2" : ""}`}
    >
      <div
        data-tilt
        className="relative overflow-hidden rounded-[2px] bg-bone transition-transform duration-500 ease-out will-change-transform"
        style={{ aspectRatio: feature ? "16 / 10" : "4 / 5" }}
      >
        <Image
          src={p.images[0]}
          alt={`${p.name} — ${p.line}, ${p.colour}`}
          fill
          loading={loading}
          fetchPriority={fetchPriority}
          sizes={imgSizes}
          className={`object-cover transition-all duration-[1100ms] ease-out group-hover:scale-[1.04] ${second ? "group-hover:opacity-0" : ""}`}
        />
        {second && (
          <Image
            src={second}
            alt=""
            aria-hidden
            fill
            sizes={imgSizes}
            className="scale-[1.06] object-cover opacity-0 transition-all duration-[1100ms] ease-out group-hover:scale-100 group-hover:opacity-100"
          />
        )}
        {/* light sheen following the cursor */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(420px circle at var(--gx,50%) var(--gy,50%), rgba(255,245,230,.16), transparent 45%)" }}
        />
        <span className="mono absolute left-3 top-3 rounded-full bg-cream/90 px-2.5 py-1 text-[10.5px] text-ink">N° {indexOf(p)}</span>
        <span className="mono absolute bottom-3 right-3 flex translate-y-2 items-center gap-2 rounded-full bg-ink/80 px-3 py-1.5 text-[10.5px] text-cream opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          View <Arrow size={11} />
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="serif truncate text-[24px] leading-tight md:text-[27px]">{p.name}</h3>
          <p className="mono mt-1.5 truncate opacity-55">
            {p.line} · {p.colour}
          </p>
        </div>
        <span className="mt-2 h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-ink/15" style={{ background: p.swatch }} aria-hidden />
      </div>
    </TLink>
  );
}
