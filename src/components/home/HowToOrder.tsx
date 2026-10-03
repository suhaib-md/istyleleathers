import { waGeneral } from "@/content/site";
import { WhatsApp } from "@/components/ui/Icons";
import FadeUp from "@/components/ui/FadeUp";

const steps = [
  {
    t: "Pick a piece",
    d: "Browse the collection — or design your own pair in the 3D Atelier. Note the colour and size you'd like.",
  },
  {
    t: "Message us",
    d: "Tap any 'Enquire' button and WhatsApp opens with the product already written in. We reply with price, options and timing.",
  },
  {
    t: "We make it & ship it",
    d: "Your piece is cut and stitched to order, checked by hand, and sent to your door anywhere in India.",
  },
];

export default function HowToOrder() {
  return (
    <section data-nav="light" className="bg-paper py-20 md:py-28">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="display text-big">
            No cart. <em>Just a conversation.</em>
          </h2>
          <a href={waGeneral} target="_blank" rel="noopener" className="tag-btn tag-btn--wa self-start md:self-auto">
            <WhatsApp size={16} /> Start on WhatsApp
          </a>
        </div>
        <FadeUp className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.t} data-fade className="stitch-box relative rounded-[4px] bg-cream p-8 text-ink md:p-10">
              <div className="flex items-start justify-between">
                <span className="display text-[96px] leading-[0.75] text-cognac">{i + 1}</span>
                <span className="mono opacity-50">Step {String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="serif mt-8 text-[34px] leading-none">{s.t}</h3>
              <p className="mt-4 text-[16px] opacity-75">{s.d}</p>
              {/* punched holes like a leather tag */}
              <span className="absolute right-6 top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full bg-paper shadow-[inset_0_1px_2px_rgba(0,0,0,.35)] md:block" />
            </div>
          ))}
        </FadeUp>
      </div>
    </section>
  );
}
