"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { SandalConfig, Silhouette, StampStyle } from "@/components/three/Sandal";
import type { Finish } from "@/content/materials";
import {
  SILHOUETTES,
  STRAP_FINISHES,
  LEATHERS,
  FOOTBEDS,
  SOLES,
  THREADS,
  HARDWARE,
  STAMP_STYLES,
  nameOf,
} from "@/content/atelier";
import { waLink } from "@/content/site";
import { WhatsApp } from "@/components/ui/Icons";

const SandalScene = dynamic(() => import("@/components/three/SandalScene"), {
  ssr: false,
  loading: () => (
    <div className="mono flex h-full items-center justify-center bg-sage text-cream/80">Cutting the pattern…</div>
  ),
});

type UI = {
  silhouette: Silhouette;
  toeRing: boolean;
  finish: Finish;
  strap: string;
  strap2: string;
  footbed: string;
  sole: string;
  thread: string;
  hardware: string;
  stamp: string;
  stampStyle: StampStyle;
  stampLogo: boolean;
};

const DEFAULT: UI = {
  silhouette: "cross",
  toeRing: false,
  finish: "croc",
  strap: "#b9814f",
  strap2: "#1c1c1c",
  footbed: "#1d1d1d",
  sole: "#141414",
  thread: "tonal",
  hardware: "#caa45d",
  stamp: "YOUR BRAND",
  stampStyle: "gold",
  stampLogo: false,
};

function specCode(c: UI) {
  const s = JSON.stringify(c);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return `IS-${c.silhouette.slice(0, 2).toUpperCase()}-${(h >>> 0).toString(36).slice(0, 5).toUpperCase()}`;
}

function Swatches({ list, value, onChange, name }: { list: { label: string; value: string }[]; value: string; onChange: (v: string) => void; name: string }) {
  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={name}>
      {list.map((o) => {
        const on = o.value === value;
        const tonal = o.value === "tonal";
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={on}
            title={o.label}
            onClick={() => onChange(o.value)}
            className={`group relative flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110 ${on ? "scale-110" : ""}`}
          >
            <span
              className="absolute inset-[3px] rounded-full ring-1 ring-ink/15"
              style={{ background: tonal ? "conic-gradient(#9a5426 0 25%, #1c1c1c 0 50%, #b9814f 0 75%, #3b2114 0)" : o.value }}
            />
            <span className={`absolute inset-0 rounded-full border-[1.5px] border-dashed transition-opacity ${on ? "border-ink opacity-100" : "opacity-0"}`} />
            <span className="sr-only">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Group({ n, title, value, children }: { n: string; title: string; value?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ink/10 py-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="mono flex gap-3">
          <span className="opacity-40">{n}</span> {title}
        </h3>
        {value && <span className="serif text-[19px] italic">{value}</span>}
      </div>
      {children}
    </div>
  );
}

export default function Configurator() {
  const [c, setC] = useState<UI>(DEFAULT);
  const gl = useRef<THREE.WebGLRenderer | null>(null);
  const set = <K extends keyof UI>(k: K, v: UI[K]) => setC((p) => ({ ...p, [k]: v }));

  const threadColor = useMemo(() => {
    if (c.thread !== "tonal") return c.thread;
    return "#" + new THREE.Color(c.strap).multiplyScalar(0.7).getHexString();
  }, [c.thread, c.strap]);

  const config: SandalConfig = useMemo(
    () => ({ ...c, thread: threadColor }),
    [c, threadColor]
  );

  const code = specCode(c);
  const sil = SILHOUETTES.find((s) => s.value === c.silhouette)!;
  const finishLabel = STRAP_FINISHES.find((f) => f.value === c.finish)!.label;
  const strapLabel =
    c.silhouette === "cross"
      ? `${nameOf(LEATHERS, c.strap)} + ${nameOf(LEATHERS, c.strap2)}`
      : nameOf(LEATHERS, c.strap);
  const stampLabel = c.stamp.trim() || c.stampLogo
    ? `${c.stampLogo ? "I Style mark" : ""}${c.stampLogo && c.stamp.trim() ? " + " : ""}${c.stamp.trim() ? `"${c.stamp.trim().toUpperCase()}"` : ""} — ${STAMP_STYLES.find((s) => s.value === c.stampStyle)!.label.toLowerCase()}`
    : "None";

  const message = [
    "Hi I Style Leathers! I designed a pair in your 3D Atelier:",
    `• Silhouette: ${sil.label}${c.toeRing ? " with toe ring" : ""}`,
    `• Strap: ${strapLabel}, ${finishLabel.toLowerCase()}`,
    `• Footbed: ${nameOf(FOOTBEDS, c.footbed)} · Sole: ${nameOf(SOLES, c.sole)}`,
    `• Thread: ${nameOf(THREADS, c.thread)}${c.silhouette === "twin" ? ` · Hardware: ${nameOf(HARDWARE, c.hardware)}` : ""}`,
    `• Footbed stamp: ${stampLabel}`,
    `Spec ${code}. Quantity: ___ pairs. Could you share price and timeline?`,
  ].join("\n");

  const save = () => {
    const r = gl.current;
    if (!r) return;
    const url = r.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `i-style-atelier-${code}.png`;
    a.click();
  };

  const random = () => {
    const pick = <T,>(l: readonly T[]) => l[Math.floor(Math.random() * l.length)];
    setC((p) => ({
      ...p,
      silhouette: pick(SILHOUETTES).value,
      finish: pick(STRAP_FINISHES).value,
      strap: pick(LEATHERS).value,
      strap2: pick(LEATHERS).value,
      footbed: pick(FOOTBEDS).value,
      sole: pick(SOLES).value,
      thread: pick(THREADS).value,
      hardware: pick(HARDWARE).value,
      toeRing: Math.random() > 0.6,
    }));
  };

  return (
    <div className="grid bg-paper lg:grid-cols-[minmax(0,1fr)_460px]">
      {/* canvas */}
      <div className="sticky top-0 z-10 h-[52svh] lg:h-[100svh]">
        <SandalScene config={config} preserve onCreated={(r) => (gl.current = r)} />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-[var(--gutter)] pt-20 text-cream md:pt-24">
          <div>
            <p className="mono opacity-80">Atelier · Live 3D</p>
            <p className="display mt-2 text-[clamp(30px,4vw,64px)]">{sil.label}</p>
          </div>
          <div className="mono rounded-full bg-ink/35 px-3 py-1.5 backdrop-blur">Spec {code}</div>
        </div>
        <p className="mono pointer-events-none absolute bottom-4 left-[var(--gutter)] text-cream/80">
          Drag to turn · scroll / pinch to zoom
        </p>
      </div>

      {/* panel — on desktop it scrolls on its own, starting below the fixed header so its copy never runs under the nav */}
      <aside
        className="relative bg-paper px-[var(--gutter)] pb-28 pt-6 lg:mt-(--nav-h) lg:max-h-[calc(100svh-var(--nav-h))] lg:overflow-y-auto"
        data-lenis-prevent
      >
        <h1 className="display text-[clamp(40px,4.4vw,64px)]">
          Design a pair. <em>Put your name on it.</em>
        </h1>
        <p className="mt-4 text-[16px] opacity-75">
          A working model of how we make slides — change the leather, the sole, the stitching, and stamp your own brand into the
          footbed. When it looks right, send the spec straight to the workshop.
        </p>

        <Group n="01" title="Silhouette" value={sil.label}>
          <div className="grid grid-cols-3 gap-2">
            {SILHOUETTES.map((s) => (
              <button
                key={s.value}
                onClick={() => set("silhouette", s.value)}
                className={`chip justify-center !px-2 ${c.silhouette === s.value ? "is-on" : ""}`}
                aria-pressed={c.silhouette === s.value}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[14px] opacity-65">{sil.note}</p>
          <label className="mono mt-4 flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={c.toeRing} onChange={(e) => set("toeRing", e.target.checked)} className="h-4 w-4 accent-cognac" />
            Add a toe ring
          </label>
        </Group>

        <Group n="02" title="Strap leather" value={finishLabel}>
          <div className="flex flex-wrap gap-2">
            {STRAP_FINISHES.map((f) => (
              <button key={f.value} onClick={() => set("finish", f.value)} className={`chip ${c.finish === f.value ? "is-on" : ""}`} aria-pressed={c.finish === f.value}>
                {f.label}
              </button>
            ))}
          </div>
        </Group>

        <Group n="03" title={c.silhouette === "cross" ? "Strap colour — top" : "Strap colour"} value={nameOf(LEATHERS, c.strap)}>
          <Swatches name="Strap colour" list={LEATHERS} value={c.strap} onChange={(v) => set("strap", v)} />
        </Group>

        {c.silhouette === "cross" && (
          <Group n="03b" title="Strap colour — under" value={nameOf(LEATHERS, c.strap2)}>
            <Swatches name="Second strap colour" list={LEATHERS} value={c.strap2} onChange={(v) => set("strap2", v)} />
          </Group>
        )}

        <Group n="04" title="Footbed" value={nameOf(FOOTBEDS, c.footbed)}>
          <Swatches name="Footbed colour" list={FOOTBEDS} value={c.footbed} onChange={(v) => set("footbed", v)} />
        </Group>

        <Group n="05" title="Sole" value={nameOf(SOLES, c.sole)}>
          <Swatches name="Sole colour" list={SOLES} value={c.sole} onChange={(v) => set("sole", v)} />
        </Group>

        <Group n="06" title="Stitching thread" value={nameOf(THREADS, c.thread)}>
          <Swatches name="Thread colour" list={THREADS} value={c.thread} onChange={(v) => set("thread", v)} />
        </Group>

        {c.silhouette === "twin" && (
          <Group n="07" title="Hardware" value={nameOf(HARDWARE, c.hardware)}>
            <Swatches name="Hardware" list={HARDWARE} value={c.hardware} onChange={(v) => set("hardware", v)} />
          </Group>
        )}

        <Group n="08" title="Footbed stamp" value={STAMP_STYLES.find((s) => s.value === c.stampStyle)!.label}>
          <label className="block">
            <span className="sr-only">Text to stamp on the footbed</span>
            <input
              className="field serif !text-[26px] uppercase tracking-[0.12em]"
              maxLength={18}
              value={c.stamp}
              onChange={(e) => set("stamp", e.target.value)}
              placeholder="Your brand"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {STAMP_STYLES.map((s) => (
              <button key={s.value} onClick={() => set("stampStyle", s.value)} className={`chip ${c.stampStyle === s.value ? "is-on" : ""}`} aria-pressed={c.stampStyle === s.value}>
                {s.label}
              </button>
            ))}
          </div>
          <label className="mono mt-4 flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={c.stampLogo} onChange={(e) => set("stampLogo", e.target.checked)} className="h-4 w-4 accent-cognac" />
            Use the I Style mark
          </label>
        </Group>

        <div className="mt-8 rounded-[3px] bg-leather p-6 text-cream stitch-box">
          <p className="mono text-tan">Your spec · {code}</p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[15px]">
            <dt className="opacity-55">Silhouette</dt>
            <dd>
              {sil.label}
              {c.toeRing ? " + toe ring" : ""}
            </dd>
            <dt className="opacity-55">Strap</dt>
            <dd>
              {strapLabel}, {finishLabel.toLowerCase()}
            </dd>
            <dt className="opacity-55">Footbed / sole</dt>
            <dd>
              {nameOf(FOOTBEDS, c.footbed)} / {nameOf(SOLES, c.sole)}
            </dd>
            <dt className="opacity-55">Thread</dt>
            <dd>{nameOf(THREADS, c.thread)}</dd>
            <dt className="opacity-55">Stamp</dt>
            <dd>{stampLabel}</dd>
          </dl>
        </div>

        <div className="mt-6 grid gap-3">
          <a href={waLink(message)} target="_blank" rel="noopener" className="tag-btn tag-btn--wa justify-center">
            <WhatsApp size={16} /> Send this spec to the workshop
          </a>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={save} className="chip justify-center">
              Save image
            </button>
            <button onClick={random} className="chip justify-center">
              Surprise me
            </button>
            <button onClick={() => setC(DEFAULT)} className="chip justify-center">
              Reset
            </button>
          </div>
          <p className="text-[13px] opacity-55">
            The model is illustrative — final shapes, lasts and leathers are confirmed with a physical sample before production.
          </p>
        </div>
      </aside>
    </div>
  );
}
