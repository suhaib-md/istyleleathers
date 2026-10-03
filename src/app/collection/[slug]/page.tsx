import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, bySlug, categories } from "@/content/products";
import { site } from "@/content/site";
import ProductView from "@/components/product/ProductView";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/collection/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = bySlug(slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${p.line}`,
    description: `${p.blurb} Handmade in Melvisharam, Tamil Nadu. ${p.colour}. Enquire on WhatsApp for price.`,
    alternates: { canonical: `/collection/${p.slug}` },
    // a page-level openGraph replaces the layout's, so restate its shared fields
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_IN",
      title: `${p.name} — ${p.line} | I Style Leathers`,
      description: p.blurb,
      images: [{ url: `/og/${p.slug}.jpg`, width: 1200, height: 630, alt: `${p.name} — ${p.line}` }],
    },
  };
}

export default async function ProductPage(props: PageProps<"/collection/[slug]">) {
  const { slug } = await props.params;
  const p = bySlug(slug);
  if (!p) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.name} — ${p.line}`,
    description: p.story,
    image: p.images.map((i) => site.url + i),
    color: p.colour,
    material: p.materials.join(", "),
    category: categories.find((c) => c.key === p.category)?.label,
    brand: { "@type": "Brand", name: site.name },
    manufacturer: { "@type": "Organization", name: site.name },
  };
  return (
    <>
      {/* "<" escaped so product copy can never close the script tag early */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductView p={p} />
    </>
  );
}
