import type { Metadata } from "next";
import Image from "next/image";
import { site, waGeneral } from "@/content/site";
import Reveal from "@/components/ui/Reveal";
import FadeUp from "@/components/ui/FadeUp";
import Seam from "@/components/ui/Seam";
import Ph from "@/components/ui/Ph";
import FromTheFloor from "@/components/home/FromTheFloor";
import Parallax from "@/components/ui/Parallax";
import { TLink } from "@/components/providers/Transition";
import { Arrow, WhatsApp } from "@/components/ui/Icons";
import { steps } from "@/content/process";

export const metadata: Metadata = {
  title: "Our Story — a family leather workshop in Melvisharam",
  description:
    "I Style Leathers is a family leather workshop in Melvisharam, in Tamil Nadu's Palar valley leather belt — making footwear, bags and small leather goods by hand.",
  alternates: { canonical: "/story" },
};

const timeline = [
  { y: "[Year]", t: "The first workbench", d: "[How it started — a first machine, a small room, the first pairs cut and stitched.]" },
  { y: "[Year]", t: "Making for other labels", d: "[First production orders for other brands — learning what makes a strap last and a seam hold.]" },
  { y: "[Year]", t: "A bigger floor", d: "[Moving into the current workshop; more machines, more hands.]" },
  { y: "[2025 — confirm]", t: "I Style Leathers, on Instagram", d: "Our own label goes public as @istyleleathers — 'Where craftsmanship means timeless fashion.'" },
  { y: "2026", t: "This website", d: "The whole collection, the workshop and a 3D atelier, in one place." },
];

const values = [
  { t: "Made, not assembled", d: "The people who cut the leather are the people who stitch it and check it. Nothing is handed off down a line of strangers." },
  { t: "Honest materials", d: "We tell you what something is made of — croc-embossed, woven, canvas — and we'd rather say no than cut a corner." },
  { t: "Made to order", d: "Most pieces are made when you ask for them. Less stock sitting on shelves, and room to change a colour or a detail." },
  { t: "Built to be used", d: "Handles reinforced where they take weight, edges painted until they're smooth, footbeds made for long Indian days." },
];

export default function StoryPage() {
  return (
    <>
      <section data-nav="dark" className="on-dark relative overflow-hidden">
        <div className="absolute inset-0">
          <Parallax amount={14} className="absolute inset-[-10%_0]">
            <Image src="/img/workshop/croc-on-mat.webp" alt="" fill preload sizes="100vw" className="object-cover opacity-45" />
          </Parallax>
          <div className="absolute inset-0 bg-gradient-to-b from-leather/40 via-leather/70 to-leather" />
        </div>
        <div className="wrap relative pb-24 pt-40 md:pb-36 md:pt-52">
          <p className="mono mb-8 text-tan">(04) Our story</p>
          <Reveal as="h1" immediate className="display text-hero max-w-[12ch]">
            A family, a floor, <em className="text-tan">a town of leather.</em>
          </Reveal>
          <p className="text-lede mt-10 max-w-[46ch] text-cream/80">{site.motto.replace(/\.$/, "")} — one pair, one bag at a time.</p>
        </div>
      </section>

      <section data-nav="light" className="bg-cream py-24 md:py-36">
        <div className="wrap grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="sticky top-28">
              {/* founder portrait placeholder */}
              <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[3px] border-[1.5px] border-dashed border-ink/30 bg-bone p-10 text-center">
                <div>
                  <p className="serif text-[30px] italic leading-tight opacity-70">[Add a photo of {site.founder === "[Founder's name]" ? "the founder" : site.founder} at work]</p>
                  <p className="mono mt-4 opacity-45">Placeholder — drop a real photo in /public/img and update src/app/story/page.tsx</p>
                </div>
              </div>
              <p className="mono mt-4 opacity-60">
                <Ph v={site.founder} /> — founder, I Style Leathers
              </p>
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <Seam index="01" label="How it started" />
            <Reveal as="p" className="serif mt-12 text-[clamp(28px,3vw,46px)] leading-[1.12]">
              &ldquo;A good bag should outlive the job you bought it for. A good sandal should feel better in its second summer than its
              first.&rdquo;
            </Reveal>
            <FadeUp className="mt-12 space-y-6 text-[18px] leading-relaxed opacity-85">
              <p data-fade>
                I Style Leathers began on the floor of a workshop in {site.town}. <Ph v={site.founder} /> has spent <Ph v={site.years} />{" "}
                years around leather — <Ph v="[add a line about how it began: an apprenticeship, a family trade, a first machine]" />.
              </p>
              <p data-fade>
                Over the years the workshop has made footwear, bags and small leather goods for other labels — learning, piece by piece,
                what makes a strap last, a seam hold and a footbed feel right. Then we started putting our own name on what we make: I
                Style Leathers.
              </p>
              <p data-fade>
                Today it still runs the way it started — as a family business, on one floor, where the people cutting the leather are the
                same people checking it before it ships. We make to order, we answer our own WhatsApp, and we&apos;d rather lose a sale
                than send out something we aren&apos;t proud of.
              </p>
            </FadeUp>
            <div className="mt-12 flex flex-wrap gap-3">
              <TLink href="/collection" className="tag-btn">
                See what we make <Arrow />
              </TLink>
              <a href={waGeneral} target="_blank" rel="noopener" className="tag-btn tag-btn--dark">
                <WhatsApp size={16} /> Say hello
              </a>
            </div>
          </div>
        </div>
      </section>

      <section data-nav="dark" className="on-dark bg-leather-2 py-24 md:py-36">
        <div className="wrap">
          <Seam index="02" label="Along the way" />
          <FadeUp as="ol" className="mt-14">
            {timeline.map((m, i) => (
              <li key={i} data-fade className="group grid gap-4 border-b border-cream/12 py-8 md:grid-cols-12 md:items-baseline">
                <span className="display text-[54px] leading-none text-tan md:col-span-3 md:text-[72px]">
                  <Ph v={m.y} />
                </span>
                <h3 className="serif text-[34px] leading-none transition-transform duration-500 group-hover:translate-x-2 md:col-span-4">{m.t}</h3>
                <p className="text-[16.5px] text-cream/65 md:col-span-5">
                  <Ph v={m.d} />
                </p>
              </li>
            ))}
          </FadeUp>
        </div>
      </section>

      <section data-nav="light" className="bg-paper py-24 md:py-36">
        <div className="wrap">
          <Seam index="03" label="What we hold to" />
          <Reveal as="h2" className="display text-mega mt-12 max-w-[14ch]">
            Four things <em>we don&apos;t bend on.</em>
          </Reveal>
          <FadeUp className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <div key={v.t} data-fade className="stitch-box rounded-[4px] bg-cream p-8">
                <span className="display text-[64px] leading-none text-cognac">{i + 1}</span>
                <h3 className="serif mt-8 text-[30px] leading-none">{v.t}</h3>
                <p className="mt-4 text-[15.5px] opacity-75">{v.d}</p>
              </div>
            ))}
          </FadeUp>
        </div>
      </section>

      <section data-nav="light" className="bg-cream pb-24 md:pb-36">
        <div className="wrap">
          <Seam index="04" label="The six stages" />
          <div className="mt-12 grid gap-px overflow-hidden rounded-[3px] bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <figure key={s.t} className="group relative bg-cream">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={s.img} alt={s.alt} fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
                </div>
                <figcaption className="p-7">
                  <span className="mono text-cognac">Stage {String(i + 1).padStart(2, "0")}</span>
                  <h3 className="serif mt-3 text-[30px] leading-none">{s.t}</h3>
                  <p className="mt-3 text-[15px] opacity-75">{s.d}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <FromTheFloor index="05" limit={10} />
    </>
  );
}
