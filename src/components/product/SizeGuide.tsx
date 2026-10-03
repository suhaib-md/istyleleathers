"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";

// Standard approximate conversions (Indian sizing follows UK).
const SIZES = [
  { uk: 5, eu: "38–39", cm: "23.8" },
  { uk: 6, eu: "39–40", cm: "24.6" },
  { uk: 7, eu: "40–41", cm: "25.4" },
  { uk: 8, eu: "42", cm: "26.2" },
  { uk: 9, eu: "43", cm: "27.1" },
  { uk: 10, eu: "44", cm: "27.9" },
  { uk: 11, eu: "45", cm: "28.8" },
  { uk: 12, eu: "46", cm: "29.6" },
];

export default function SizeGuide() {
  const [open, setOpen] = useState(false);
  const dlg = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const d = dlg.current!;
    if (open) {
      d.showModal();
      lenis?.stop();
    } else if (d.open) {
      d.close();
      lenis?.start();
    }
  }, [open, lenis]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="u-link u-link--always mono text-cognac">
        Size guide
      </button>
      <dialog
        ref={dlg}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dlg.current && setOpen(false)}
        className="m-auto w-[min(560px,92vw)] rounded-[4px] bg-cream p-0 text-ink backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
        data-lenis-prevent
      >
        <div className="stitch-box p-7 md:p-9">
          <div className="flex items-start justify-between">
            <h2 className="display text-[44px]">Size guide</h2>
            <button onClick={() => setOpen(false)} className="mono rounded-full border border-ink/20 px-3 py-2" aria-label="Close size guide">
              ✕
            </button>
          </div>
          <p className="mt-3 text-[15px] opacity-75">
            Stand on a sheet of paper, mark your heel and longest toe, and measure the distance. Match it to the foot length below. Between
            sizes? Go up — or message us and we&apos;ll advise.
          </p>
          <table className="mono mt-6 w-full text-left normal-case tracking-normal">
            <thead>
              <tr className="border-b border-ink/20 text-[11px] uppercase tracking-[0.08em] opacity-60">
                <th className="py-2 font-normal">UK / India</th>
                <th className="py-2 font-normal">EU</th>
                <th className="py-2 font-normal">Foot length (cm)</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => (
                <tr key={s.uk} className="border-b border-ink/10">
                  <td className="py-2.5">{s.uk}</td>
                  <td className="py-2.5">{s.eu}</td>
                  <td className="py-2.5">{s.cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mono mt-4 opacity-50">Approximate — lasts vary by style. Custom sizes on request.</p>
        </div>
      </dialog>
    </>
  );
}
