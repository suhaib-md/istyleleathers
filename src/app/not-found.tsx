import { signature } from "@/content/products";
import ProductCard from "@/components/catalog/ProductCard";
import { TLink } from "@/components/providers/Transition";
import { Arrow } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <section data-nav="light" className="bg-cream pb-24 pt-36 md:pt-48">
      <div className="wrap">
        <p className="mono mb-6 text-cognac">Error 404</p>
        <h1 className="display text-hero">
          That page seems to have <em>walked off.</em>
        </h1>
        <p className="text-lede mt-8 max-w-[44ch] opacity-75">Probably in a very comfortable pair of sandals. Let&apos;s get you back on the floor.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <TLink href="/" className="tag-btn">
            Go home <Arrow />
          </TLink>
          <TLink href="/collection" className="tag-btn tag-btn--dark">
            Browse the collection <Arrow />
          </TLink>
        </div>
        <div className="mt-20 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {signature.slice(0, 4).map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
