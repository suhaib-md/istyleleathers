import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { site, waBulk } from "@/content/site";
import { products } from "@/content/products";
import Reveal from "@/components/ui/Reveal";
import FadeUp from "@/components/ui/FadeUp";
import Seam from "@/components/ui/Seam";
import Marquee from "@/components/ui/Marquee";
import Ph from "@/components/ui/Ph";
import { Arrow, WhatsApp } from "@/components/ui/Icons";
import { Stat } from "@/components/home/ForBrands";
import Materials from "@/components/home/Materials";
import EnquiryForm from "@/components/manufacturing/EnquiryForm";
import { TLink } from "@/components/providers/Transition";

export const metadata: Metadata = {
  title: "Manufacturing & private label — leather footwear, bags and gifts",
  description:
    "Private-label leather manufacturing in Melvisharam, Tamil Nadu: footwear, bags and small leather goods for brands, retailers and corporate gifting. Sampling to bulk production.",
  alternates: { canonical: "/manufacturing" },
};

const capabilities = [
  {
    t: "Footwear",
    img: "/img/foot/croc-buckle-sage.webp",
    alt: "Croc-embossed buckle slides",
    items: ["Slides & cross-straps", "Toe-ring & toe-post sandals", "Thongs", "Buckle & multi-strap styles", "Padded & moulded footbeds"],
  },
  {
    t: "Bags",
    img: "/img/bags/explorer-studio.webp",
    alt: "Green canvas and leather duffel",
    items: ["Laptop briefcases", "Duffels & weekenders", "Backpacks", "Document cases & folios", "Canvas + leather combinations"],
  },
  {
    t: "Small leather goods",
    img: "/img/acc/watch-roll-white.webp",
    alt: "Tan leather watch roll",
    items: ["Watch rolls", "Spectacle cases & sleeves", "Keychains", "Desk accessories", "Shoe horns, folios & more"],
  },
];

const stages = [
  { t: "Brief", d: "Share sketches, references or a sample. Tell us quantities, target price and deadline.", time: "Day 1" },
  { t: "Materials & costing", d: "We suggest leathers, linings and hardware, and send a costing for your approval.", time: "[X] days" },
  { t: "Sampling", d: "A physical sample is cut and stitched on our floor and sent to you (or shown on video).", time: site.sampleDays + " days" },
  { t: "Approval", d: "You mark changes; we refine until it's exactly right. Your logo and labels are locked in.", time: "Your call" },
  { t: "Production", d: "The run is cut, stitched and finished in batches, with checks at every stage.", time: site.productionWeeks + " weeks" },
  { t: "QC & dispatch", d: "Each piece is inspected by hand, packed to your spec and shipped.", time: "Pan-India / export" },
];

const custom = [
  { t: "Logo deboss / emboss", d: "Heat-pressed into leather, blind or with foil." },
  { t: "Metal plates & hardware", d: "Branded plates, buckles, zips and rings." },
  { t: "Linings & interiors", d: "Fabric, colour and pocket layouts to suit." },
  { t: "Colours & leathers", d: "Any colourway from our library — or sourced to match." },
  { t: "Thread & edges", d: "Contrast or tonal stitching, painted edge colours." },
  { t: "Packaging", d: "Dust bags, boxes and tags with your branding." },
];

const faqs = [
  { q: "What's your minimum order?", a: <>Usually <Ph v={site.moq} /> pieces per design and colour — smaller runs and one-off samples are possible, just ask.</> },
  { q: "Can you make my own design?", a: <>Yes. Send a sketch, a tech pack, a reference photo or an existing piece. We&apos;ll develop the pattern and make a sample first.</> },
  { q: "Will you put my brand on it?", a: <>That&apos;s the point of private label. Your logo can be debossed, embossed, foiled, printed on labels or engraved on metal plates.</> },
  { q: "Can you match a reference sample?", a: <>Send it over. We&apos;ll study the construction, suggest materials, and make a sample with your branding for you to approve.</> },
  { q: "How long does it take?", a: <>Samples take around <Ph v={site.sampleDays} /> days; production runs around <Ph v={site.productionWeeks} /> weeks depending on quantity and materials.</> },
  { q: "Do you ship outside India?", a: <>We ship across India, and welcome export enquiries — <Ph v={site.exportTo} />.</> },
];

export default function ManufacturingPage() {
  const strip = products.filter((p) => p.images[0].includes("studio") || p.images[0].includes("sage")).slice(0, 12);
  return (
    <>
      {/* hero */}
      <section data-nav="dark" className="on-dark relative overflow-hidden pt-32 md:pt-44">
        <div className="wrap grid gap-10 pb-16 md:grid-cols-12 md:pb-24">
          <div className="md:col-span-8">
            <p className="mono mb-8 text-tan">(02) For brands, retailers & businesses</p>
            <Reveal as="h1" immediate className="display text-hero">
              Your label. <em className="text-tan">Our floor.</em>
            </Reveal>
          </div>
          <div className="flex flex-col justify-end gap-8 md:col-span-4">
            <p className="text-lede text-cream/80">
              We design, sample and manufacture leather footwear, bags and small goods for brands across India — cut, stitched and
              finished by our own team in {site.town}, Tamil Nadu.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#enquire" className="tag-btn">
                Start a project <Arrow />
              </a>
              <a href={waBulk} target="_blank" rel="noopener" className="tag-btn tag-btn--wa">
                <WhatsApp size={16} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
        <Marquee duration={70} className="pb-16">
          {strip.map((p) => (
            <div key={p.slug} className="relative mr-4 aspect-[4/5] w-[42vw] shrink-0 overflow-hidden rounded-[2px] sm:w-[22vw] lg:w-[15vw]">
              <Image src={p.images[0]} alt="" fill sizes="22vw" className="object-cover" />
            </div>
          ))}
        </Marquee>
      </section>

      {/* capabilities */}
      <section data-nav="light" className="bg-cream py-24 md:py-36">
        <div className="wrap">
          <Seam index="01" label="What we make" />
          <Reveal as="h2" className="display text-mega mt-12 max-w-[16ch]">
            Three families, <em>one standard.</em>
          </Reveal>
          <FadeUp className="mt-16 grid gap-6 md:grid-cols-3">
            {capabilities.map((c, i) => (
              <article key={c.t} data-fade className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-bone">
                  <Image src={c.img} alt={c.alt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
                  <span className="mono absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1.5 text-ink">0{i + 1}</span>
                </div>
                <h3 className="serif mt-6 text-[40px] leading-none">{c.t}</h3>
                <ul className="mt-5 space-y-2 text-[16px] opacity-80">
                  {c.items.map((x) => (
                    <li key={x} className="flex gap-3 border-b border-ink/10 pb-2">
                      <span className="mono mt-1 text-cognac">+</span> {x}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </FadeUp>
        </div>
      </section>

      {/* project stages */}
      <section id="process" data-nav="dark" className="on-dark bg-leather-2 py-24 md:py-36">
        <div className="wrap">
          <Seam index="02" label="How a project runs" />
          <div className="mt-12 grid gap-8 md:grid-cols-12">
            <Reveal as="h2" className="display text-mega md:col-span-7">
              From a sketch <em>to a shipment.</em>
            </Reveal>
            <p className="max-w-[38ch] self-end text-[17px] text-cream/70 md:col-span-4 md:col-start-9">
              One team handles your order end to end, from the first sketch to the final check. You talk to the people making it.
            </p>
          </div>
          <FadeUp className="mt-16 grid gap-px overflow-hidden rounded-[3px] bg-cream/10 sm:grid-cols-2 lg:grid-cols-3">
            {stages.map((s, i) => (
              <div key={s.t} data-fade className="relative bg-leather-2 p-8 md:p-10">
                <div className="flex items-start justify-between">
                  <span className="display text-[86px] leading-[0.8] text-tan/90">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mono rounded-full border border-cream/20 px-3 py-1.5 text-cream/70">
                    <Ph v={s.time} />
                  </span>
                </div>
                <h3 className="serif mt-10 text-[34px] leading-none">{s.t}</h3>
                <p className="mt-4 text-[16px] text-cream/65">{s.d}</p>
                {i < stages.length - 1 && <span className="stitch-x absolute bottom-0 left-8 right-8 text-thread lg:hidden" />}
              </div>
            ))}
          </FadeUp>
        </div>
      </section>

      {/* customisation */}
      <section data-nav="light" className="bg-paper py-24 md:py-36">
        <div className="wrap grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Seam index="03" label="Make it yours" />
            <Reveal as="h2" className="display text-mega mt-12">
              Every detail, <em>your call.</em>
            </Reveal>
            <div className="relative mt-10 aspect-square overflow-hidden rounded-[3px]">
              <Image src="/img/brand/logo-on-leather.webp" alt="A logo debossed into brown leather" fill sizes="40vw" className="object-cover" />
              <span className="mono absolute bottom-4 left-4 rounded-full bg-ink/70 px-3 py-1.5 text-cream backdrop-blur">Deboss sample</span>
            </div>
          </div>
          <FadeUp className="grid content-start gap-px self-end overflow-hidden rounded-[3px] bg-ink/10 sm:grid-cols-2 md:col-span-6 md:col-start-7">
            {custom.map((c, i) => (
              <div key={c.t} data-fade className="bg-paper p-7">
                <span className="mono text-cognac">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="serif mt-4 text-[28px] leading-none">{c.t}</h3>
                <p className="mt-3 text-[15px] opacity-70">{c.d}</p>
              </div>
            ))}
            <div className="bg-leather p-7 text-cream sm:col-span-2">
              <p className="serif text-[26px] leading-tight">
                Want to see it before you commit? <em>Design a slide in 3D</em> and stamp your brand on the footbed.
              </p>
              <TLink href="/atelier" className="mono mt-5 inline-flex items-center gap-2 text-tan">
                <span className="u-link u-link--always">Open the Atelier</span> <Arrow />
              </TLink>
            </div>
          </FadeUp>
        </div>
      </section>

      <Materials index="04" tone="dark" />

      {/* numbers */}
      <section data-nav="light" className="bg-cream py-24 md:py-32">
        <div className="wrap">
          <Seam index="05" label="In numbers" />
          <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            <Stat v={site.years} suffix="+" label="Years of making" />
            <Stat v={site.artisans} label="People on the floor" />
            <Stat v={site.pairsPerMonth} label="Pairs a month" />
            <Stat v={site.floorArea} label="Workshop floor" />
          </div>
        </div>
      </section>

      {/* faq + form */}
      <section id="enquire" data-nav="dark" className="on-dark scroll-mt-10 py-24 md:py-36">
        <div className="wrap grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <Seam index="06" label="Questions" />
            <Reveal as="h2" className="display text-big mt-12">
              Before you <em>ask.</em>
            </Reveal>
            <div className="mt-10">
              {faqs.map((f) => (
                <details key={f.q} className="group border-b border-cream/12 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                    <span className="serif text-[23px] leading-snug">{f.q}</span>
                    <span className="mono text-tan transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 max-w-[46ch] text-[16px] text-cream/70">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <div className="rounded-[4px] bg-leather-2 p-6 md:p-10 stitch-box">
              <p className="mono text-tan">Start a project</p>
              <h2 className="display mt-4 text-[clamp(40px,4vw,64px)]">Tell us what you&apos;re making.</h2>
              <div className="mt-10">
                <Suspense fallback={null}>
                  <EnquiryForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
