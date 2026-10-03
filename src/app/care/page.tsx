import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import FadeUp from "@/components/ui/FadeUp";
import Seam from "@/components/ui/Seam";
import { waLink } from "@/content/site";
import { WhatsApp } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Leather care — keeping your sandals and bags for years",
  description:
    "How to clean, condition and store leather sandals, bags and accessories — simple care that makes good leather last for years, written for Indian weather.",
  alternates: { canonical: "/care" },
};

const rules = [
  {
    t: "Wipe, don't wash",
    d: "Dust and everyday marks come off with a soft, dry cloth. For anything stubborn, use a cloth that's barely damp — never soak leather or put it under a tap.",
  },
  {
    t: "Dry it slowly",
    d: "If it gets wet in the rain, blot it, stuff bags or shoes with paper and let them dry at room temperature. Not in the sun, not near a heater — fast drying cracks leather.",
  },
  {
    t: "Feed it a few times a year",
    d: "A thin layer of leather conditioner every few months keeps the fibres supple, especially through dry months and air-conditioned offices. Test on a hidden spot first.",
  },
  {
    t: "Let it breathe",
    d: "Store leather in a cotton dust bag, not plastic. Plastic traps moisture — and in a humid monsoon that's how mould starts.",
  },
  {
    t: "Rest your favourites",
    d: "Rotate sandals and bags when you can. A day off lets the leather dry out and recover its shape.",
  },
  {
    t: "Keep its shape",
    d: "Fill bags with paper when they're not in use and hang nothing heavy from a single handle for long periods.",
  },
];

const by = [
  {
    t: "Sandals & slides",
    img: "/img/foot/croc-buckle-sage.webp",
    alt: "Croc-embossed buckle slides",
    tips: [
      "Wipe footbeds with a slightly damp cloth to remove sweat and dust; let them air-dry.",
      "Don't wear new leather soles through standing water — let them break in first.",
      "Croc-embossed and patent finishes only need a dry buff; skip heavy creams.",
      "Suede and nubuck: use a soft suede brush, never water or polish.",
    ],
  },
  {
    t: "Bags & briefcases",
    img: "/img/bags/traveler-studio.webp",
    alt: "Espresso leather duffel",
    tips: [
      "Empty pockets that stretch the leather — keys and chargers leave marks.",
      "Canvas panels can be spot-cleaned with mild soap and water; keep it off the leather trim.",
      "Wipe zips and hardware dry so they don't tarnish in humid weather.",
      "Store upright, stuffed with paper, in the dust bag.",
    ],
  },
  {
    t: "Small leather goods",
    img: "/img/acc/watch-roll-white.webp",
    alt: "Tan leather watch roll",
    tips: [
      "Hand oils darken leather over time — that's the patina, and it's a good thing.",
      "Keep keychains and cases away from perfume, sanitiser and pen ink.",
      "A drop of conditioner once or twice a year is plenty.",
    ],
  },
];

export default function CarePage() {
  return (
    <>
      <section data-nav="light" className="bg-cream pb-20 pt-32 md:pt-44">
        <div className="wrap grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="mono mb-8 opacity-60">Leather care</p>
            <Reveal as="h1" immediate className="display text-hero">
              Good leather <em className="text-cognac">gets better.</em>
            </Reveal>
            <p className="text-lede mt-8 max-w-[48ch] opacity-75">
              Leather is skin — it likes to be kept clean, fed now and then, and allowed to breathe. Do that and it will darken,
              soften and shape itself to you for years.
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] md:col-span-4">
            <Image src="/img/bags/heritage-flap-brief.webp" alt="A burnished tan leather flap briefcase" fill priority sizes="33vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section data-nav="dark" className="on-dark bg-leather-2 py-24 md:py-32">
        <div className="wrap">
          <Seam index="01" label="Six rules" />
          <FadeUp className="mt-14 grid gap-px overflow-hidden rounded-[3px] bg-cream/10 sm:grid-cols-2 lg:grid-cols-3">
            {rules.map((r, i) => (
              <div key={r.t} data-fade className="bg-leather-2 p-8 md:p-10">
                <span className="display text-[72px] leading-none text-tan">{i + 1}</span>
                <h2 className="serif mt-8 text-[32px] leading-none">{r.t}</h2>
                <p className="mt-4 text-[16px] text-cream/70">{r.d}</p>
              </div>
            ))}
          </FadeUp>
        </div>
      </section>

      <section data-nav="light" className="bg-paper py-24 md:py-32">
        <div className="wrap">
          <Seam index="02" label="By piece" />
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {by.map((b) => (
              <article key={b.t}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-bone">
                  <Image src={b.img} alt={b.alt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                </div>
                <h2 className="serif mt-6 text-[36px] leading-none">{b.t}</h2>
                <ul className="mt-5 space-y-3 text-[15.5px] opacity-80">
                  {b.tips.map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="mt-[0.7em] h-px w-4 shrink-0 bg-cognac" /> {t}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-[4px] bg-leather p-8 text-cream md:flex-row md:items-center md:p-10">
            <p className="serif max-w-[36ch] text-[28px] leading-tight">
              Not sure about a stain, a scuff or a loose stitch? <em>Send us a photo.</em>
            </p>
            <a href={waLink("Hi I Style Leathers! I have a question about caring for my leather piece:")} target="_blank" rel="noopener" className="tag-btn tag-btn--wa">
              <WhatsApp size={16} /> Ask the workshop
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
