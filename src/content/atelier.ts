import type { Finish } from "./materials";

export type Opt = { label: string; value: string };

export const SILHOUETTES = [
  { value: "cross", label: "Cross strap", note: "Two straps crossed over the foot — our signature." },
  { value: "band", label: "Wide band", note: "One broad band across the forefoot." },
  { value: "twin", label: "Twin buckle", note: "Two straps, each with a buckle to set the fit." },
] as const;

export const STRAP_FINISHES: { value: Finish; label: string }[] = [
  { value: "smooth", label: "Smooth" },
  { value: "croc", label: "Croc-embossed" },
  { value: "pebble", label: "Pebble" },
  { value: "woven", label: "Woven" },
  { value: "perforated", label: "Perforated" },
  { value: "suede", label: "Suede" },
];

export const LEATHERS: Opt[] = [
  { label: "Cognac", value: "#9a5426" },
  { label: "Tan", value: "#b9814f" },
  { label: "Espresso", value: "#3b2114" },
  { label: "Jet", value: "#1c1c1c" },
  { label: "Oxblood", value: "#5e1d1a" },
  { label: "Navy", value: "#1f2d4f" },
  { label: "Forest", value: "#2b4a3f" },
  { label: "Sand", value: "#bfa27f" },
  { label: "Slate", value: "#5b5e60" },
];

export const FOOTBEDS: Opt[] = [
  { label: "Black", value: "#1d1d1d" },
  { label: "Espresso", value: "#3a2116" },
  { label: "Tan", value: "#b07a4a" },
  { label: "Grey", value: "#8a8a86" },
];

export const SOLES: Opt[] = [
  { label: "Black", value: "#141414" },
  { label: "Brown", value: "#3e2418" },
  { label: "Gum", value: "#a9773f" },
  { label: "White", value: "#e7e3da" },
];

export const THREADS: Opt[] = [
  { label: "Tonal", value: "tonal" },
  { label: "Cream", value: "#efe2c6" },
  { label: "Tan", value: "#c48c55" },
  { label: "Red", value: "#b3261e" },
];

export const HARDWARE: Opt[] = [
  { label: "Brass", value: "#caa45d" },
  { label: "Gunmetal", value: "#4a4b4e" },
  { label: "Silver", value: "#cfd3d6" },
];

export const STAMP_STYLES = [
  { value: "blind", label: "Blind deboss" },
  { value: "gold", label: "Gold foil" },
  { value: "silver", label: "Silver foil" },
] as const;

export const nameOf = (list: Opt[], v: string) => list.find((o) => o.value === v)?.label ?? v;
