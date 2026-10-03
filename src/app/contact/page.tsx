import type { Metadata } from "next";
import { site, waGeneral } from "@/content/site";
import Reveal from "@/components/ui/Reveal";
import Seam from "@/components/ui/Seam";
import Ph from "@/components/ui/Ph";
import QuickMessage from "@/components/contact/QuickMessage";
import { ArrowUpRight, Instagram, Mail, WhatsApp } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Contact — talk to the workshop",
  description: `WhatsApp ${site.phoneDisplay}, email ${site.email} or find us on Instagram @${site.instagram}. I Style Leathers, ${site.town}, ${site.state}.`,
  alternates: { canonical: "/contact" },
};

const faqs = [
  { q: "How do I order?", a: <>Tap “Enquire on WhatsApp” on any product (or message us directly). We confirm the price, colour, size and delivery date, and start making it once you approve.</> },
  { q: "How do I pay?", a: <Ph v="[Payment methods — e.g. UPI, bank transfer; advance / balance terms]" /> },
  { q: "Do you deliver across India?", a: <>Yes — we ship across India. Delivery time depends on the piece and your location; we&apos;ll tell you before you confirm.</> },
  { q: "How long does a made-to-order piece take?", a: <>Usually <Ph v="[X–X days]" />, depending on the piece and how busy the floor is.</> },
  { q: "Can I change the colour or leather?", a: <>Most designs can be made in another colour, leather, sole or hardware — just ask. For footwear, try the 3D Atelier.</> },
  { q: "What if it doesn't fit?", a: <Ph v="[Your exchange / return terms]" /> },
];

const channels = [
  { href: waGeneral, icon: WhatsApp, k: "WhatsApp", v: site.phoneDisplay, note: "Fastest — orders, prices, questions", ext: true },
  { href: `mailto:${site.email}`, icon: Mail, k: "Email", v: site.email, note: "Bulk briefs, tech packs, attachments", ext: false },
  { href: site.instagramUrl, icon: Instagram, k: "Instagram", v: `@${site.instagram}`, note: "New pieces and the workshop, day to day", ext: true },
];

export default function ContactPage() {
  return (
    <>
      <section data-nav="light" className="bg-cream pb-16 pt-32 md:pt-44">
        <div className="wrap">
          <p className="mono mb-8 opacity-60">(05) Contact</p>
          <Reveal as="h1" immediate className="display text-hero">
            Talk to <em className="text-cognac">the workshop.</em>
          </Reveal>
          <p className="text-lede mt-8 max-w-[44ch] opacity-75">
            No call centre, no ticket numbers. Messages come straight to the people who make your order.
          </p>
        </div>
        <div className="wrap mt-16">
          {channels.map((c) => (
            <a
              key={c.k}
              href={c.href}
              target={c.ext ? "_blank" : undefined}
              rel={c.ext ? "noopener" : undefined}
              className="group relative flex flex-col gap-3 overflow-hidden border-t border-ink/12 py-8 last:border-b md:flex-row md:items-center md:justify-between"
            >
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-leather transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] group-hover:scale-y-100" />
              <span className="relative flex items-center gap-5 transition-colors duration-500 group-hover:text-cream">
                <c.icon size={26} />
                <span className="mono w-28 opacity-60">{c.k}</span>
                <span className="display text-[clamp(30px,4.6vw,76px)] leading-none">{c.v}</span>
              </span>
              <span className="mono relative flex items-center gap-3 opacity-60 transition-colors duration-500 group-hover:text-tan group-hover:opacity-100 md:pr-2">
                {c.note} <ArrowUpRight />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section data-nav="light" className="bg-paper py-24 md:py-32">
        <div className="wrap grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Seam index="01" label="Ordering" />
            <h2 className="display text-big mt-10">
              Good <em>questions.</em>
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-ink/12 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  <span className="serif text-[24px] leading-snug">{f.q}</span>
                  <span className="mono text-cognac transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-[56ch] text-[16px] opacity-75">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section data-nav="dark" className="on-dark py-24 md:py-32">
        <div className="wrap grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Seam index="02" label="Visit" />
            <h2 className="display text-big mt-10">
              {site.town}, <em>{site.state}.</em>
            </h2>
            <dl className="mt-10 grid gap-6 text-[17px]">
              <div>
                <dt className="mono mb-2 opacity-50">Address</dt>
                <dd>
                  <Ph v={site.address} />
                </dd>
              </div>
              <div>
                <dt className="mono mb-2 opacity-50">Workshop hours</dt>
                <dd>
                  <Ph v={site.hours} />
                </dd>
              </div>
              <div>
                <dt className="mono mb-2 opacity-50">Visiting</dt>
                <dd className="text-cream/75">Brands and bulk buyers are welcome to see the floor — message us first so we can make time for you.</dd>
              </div>
            </dl>
            <div className="mt-14">
              <p className="mono mb-6 text-tan">Quick message</p>
              <QuickMessage />
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-[3px] md:col-span-6 md:col-start-7">
            <iframe
              title={`Map of ${site.town}, ${site.state}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=13&output=embed`}
              className="absolute inset-0 h-full w-full border-0"
              style={{ filter: "sepia(.55) saturate(.8) contrast(1.05) brightness(.92)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="pointer-events-none absolute inset-3 rounded-[2px] border-[1.5px] border-dashed border-ink/40" />
            <span className="mono pointer-events-none absolute bottom-4 left-4 rounded-full bg-leather/85 px-3 py-1.5 text-cream backdrop-blur">{site.coords}</span>
          </div>
        </div>
      </section>
    </>
  );
}
