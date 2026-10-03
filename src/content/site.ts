/**
 * Single source of truth for business facts.
 *
 * Anything wrapped in [square brackets] is a PLACEHOLDER — it renders on the site
 * with a dotted "fill me in" style (see components/ui/Ph.tsx). Replace the text
 * here and it updates everywhere.
 */

export const site = {
  name: "I Style Leathers",
  short: "I Style",
  tagline: "Timeless Style",
  motto: "Where craftsmanship means timeless fashion.",
  url: "https://istyleleathers.in", // [confirm domain]

  phoneDisplay: "+91 98423 76554",
  whatsapp: "919842376554",
  email: "istyleleathersmvs@gmail.com",
  instagram: "istyleleathers",
  instagramUrl: "https://www.instagram.com/istyleleathers/",

  town: "Melvisharam",
  district: "Ranipet District",
  state: "Tamil Nadu",
  country: "India",
  coords: "12.93° N  79.24° E",
  river: "Palar",
  mapQuery: "Melvisharam, Tamil Nadu",

  // ---------- placeholders (edit me) ----------
  founder: "[Founder's name]",
  established: "[Year]",
  years: "[XX]",
  artisans: "[XX]",
  pairsPerMonth: "[X,XXX]",
  bagsPerMonth: "[XXX]",
  moq: "[XX]",
  sampleDays: "[X–X]",
  productionWeeks: "[X–X]",
  exportTo: "[Countries you ship to]",
  floorArea: "[XX,XXX sq ft]",
  hours: "[Mon – Sat, 9:30 am – 7:00 pm]",
  address: "[Street / unit], Melvisharam, Ranipet District, Tamil Nadu [PIN]",
} as const;

export const nav = [
  { href: "/collection", label: "Collection", n: "01" },
  { href: "/manufacturing", label: "For Brands", n: "02" },
  { href: "/atelier", label: "Atelier 3D", n: "03" },
  { href: "/story", label: "Our Story", n: "04" },
  { href: "/contact", label: "Contact", n: "05" },
] as const;

export function waLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const waGeneral = waLink(
  "Hi I Style Leathers! I found you through your website and would like to know more."
);

export const waBulk = waLink(
  "Hi I Style Leathers! I'm interested in manufacturing / bulk orders for my brand. Could we talk?"
);

export function isPlaceholder(s: string) {
  return /^\[.*\]$/.test(s.trim());
}
