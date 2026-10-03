"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Google's map embed pulls in ~1.7 MB of scripts and tiles, and the browser's own iframe lazy-loading
 * starts it far ahead of the viewport — so only mount it once the visitor is nearly there.
 */
export default function LazyMap({ src, title, style }: { src: string; title: string; style?: React.CSSProperties }) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const frame = (
    <iframe title={title} src={src} className="absolute inset-0 h-full w-full border-0" style={style} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
  );
  return (
    <div ref={box} className="absolute inset-0 bg-bone">
      {near && frame}
      <noscript>{frame}</noscript>
    </div>
  );
}
