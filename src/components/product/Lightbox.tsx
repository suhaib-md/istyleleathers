"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/components/providers/SmoothScroll";

/** Full-screen zoom: the image follows the pointer so you can inspect the grain and stitching. */
export default function Lightbox({
  images,
  index,
  alt,
  onClose,
}: {
  images: string[];
  index: number;
  alt: string;
  onClose: () => void;
}) {
  const [i, setI] = useState(index);
  const [zoom, setZoom] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const pan = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    lenis?.stop();
    document.body.style.overflow = "hidden";
    gsap.fromTo(root.current, { clipPath: "inset(50% 0 50% 0)" }, { clipPath: "inset(0% 0 0% 0)", duration: 0.7, ease: "leather" });
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((x) => (x + 1) % images.length);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", key);
    root.current?.focus();
    return () => {
      window.removeEventListener("keydown", key);
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [images.length, lenis, onClose]);

  const onMove = (e: React.PointerEvent) => {
    if (!zoom || !pan.current) return;
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    gsap.to(pan.current, { xPercent: -x * 40, yPercent: -y * 40, duration: 0.8, ease: "power3" });
  };

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — enlarged`}
      tabIndex={-1}
      className="fixed inset-0 z-[95] flex items-center justify-center overflow-hidden bg-ink/95 text-cream outline-none"
      onPointerMove={onMove}
      data-lenis-prevent
    >
      <div
        className="absolute inset-0 cursor-zoom-out"
        onClick={() => setZoom((z) => !z)}
        data-cursor={zoom ? "Fit" : "Zoom"}
      >
        <div
          ref={pan}
          className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{ transform: zoom ? "scale(1.9)" : "scale(1)" }}
        >
          <Image key={images[i]} src={images[i]} alt={alt} fill sizes="100vw" quality={85} className="object-contain" />
        </div>
      </div>
      <div className="mono pointer-events-none absolute left-[var(--gutter)] top-6 opacity-70">
        {String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")} — click to {zoom ? "fit" : "zoom"}
      </div>
      <button onClick={onClose} className="mono absolute right-[var(--gutter)] top-4 rounded-full border border-cream/30 px-4 py-2.5 hover:bg-cream hover:text-ink">
        Close ✕
      </button>
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          <button className="chip !border-cream/30" onClick={() => setI((x) => (x - 1 + images.length) % images.length)} aria-label="Previous image">
            ←
          </button>
          <button className="chip !border-cream/30" onClick={() => setI((x) => (x + 1) % images.length)} aria-label="Next image">
            →
          </button>
        </div>
      )}
    </div>
  );
}
