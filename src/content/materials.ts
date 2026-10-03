/** Leather finishes + the swatch book (pure data — safe to import anywhere). */

export type Finish = "smooth" | "pebble" | "croc" | "woven" | "perforated" | "suede" | "saffiano" | "canvas";

export const FINISHES: { key: Finish; label: string; note: string }[] = [
  { key: "smooth", label: "Smooth full-grain", note: "The hide's natural face, lightly finished. Polishes with wear." },
  { key: "pebble", label: "Pebble grain", note: "A tumbled, pebbled surface that shrugs off scuffs." },
  { key: "croc", label: "Croc-embossed", note: "Pressed under heat and pressure for a deep scale pattern." },
  { key: "woven", label: "Woven", note: "Leather strips interlaced over and under — flexes as you move." },
  { key: "perforated", label: "Perforated", note: "Punched patterns that let a sandal or bag breathe." },
  { key: "suede", label: "Suede / nubuck", note: "Buffed to a soft, velvety nap. Warm and matte." },
  { key: "saffiano", label: "Saffiano", note: "A fine crosshatch press — crisp, structured, scratch-resistant." },
  { key: "canvas", label: "Waxed canvas", note: "Heavy cotton canvas, paired with leather trims and bases." },
];

export type Swatch = { finish: Finish; name: string; colour: string; hex: string; edge: string; thread: string };

export const SWATCHES: Swatch[] = [
  { finish: "smooth", name: "Smooth full-grain", colour: "Cognac", hex: "#9c5528", edge: "#3a1a0c", thread: "#e9d7b8" },
  { finish: "pebble", name: "Pebble grain", colour: "Espresso", hex: "#3d2316", edge: "#160b06", thread: "#cdb08a" },
  { finish: "croc", name: "Croc-embossed", colour: "Jet", hex: "#1c1c1c", edge: "#070707", thread: "#5a5a5a" },
  { finish: "croc", name: "Croc-embossed", colour: "Oxblood", hex: "#5c1c19", edge: "#220807", thread: "#d9b9a0" },
  { finish: "woven", name: "Hand-woven", colour: "Tan", hex: "#b47b48", edge: "#4a2a12", thread: "#f0e2c8" },
  { finish: "perforated", name: "Perforated", colour: "Chestnut", hex: "#6a3a1e", edge: "#24110a", thread: "#e3cfae" },
  { finish: "suede", name: "Suede / nubuck", colour: "Sand", hex: "#b99c7a", edge: "#5d462f", thread: "#f4ead8" },
  { finish: "saffiano", name: "Saffiano", colour: "Navy", hex: "#1f2d4f", edge: "#0b1121", thread: "#c9b48b" },
  { finish: "canvas", name: "Waxed canvas", colour: "Forest", hex: "#2b4a3f", edge: "#3a1d0f", thread: "#e8d9bb" },
];
