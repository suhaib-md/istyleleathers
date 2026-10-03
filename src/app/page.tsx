import Hero from "@/components/home/Hero";
import Manifesto from "@/components/home/Manifesto";
import TwoDoors from "@/components/home/TwoDoors";
import Signature from "@/components/home/Signature";
import Archive from "@/components/home/Archive";
import Process from "@/components/home/Process";
import Materials from "@/components/home/Materials";
import AtelierTeaser from "@/components/home/AtelierTeaser";
import ForBrands from "@/components/home/ForBrands";
import HowToOrder from "@/components/home/HowToOrder";
import Place from "@/components/home/Place";
import FromTheFloor from "@/components/home/FromTheFloor";
import Anatomy from "@/components/home/Anatomy";
import InstagramStrip from "@/components/home/InstagramStrip";
import { site } from "@/content/site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    slogan: site.tagline,
    url: site.url,
    logo: `${site.url}/icon.png`,
    email: site.email,
    telephone: site.phoneDisplay.replace(/\s/g, ""),
    sameAs: [site.instagramUrl],
    address: {
      "@type": "PostalAddress",
      addressLocality: site.town,
      addressRegion: site.state,
      addressCountry: "IN",
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero />
      <Manifesto />
      <TwoDoors />
      <Signature />
      <Anatomy />
      <Archive />
      <Process />
      <Materials />
      <AtelierTeaser />
      <ForBrands />
      <HowToOrder />
      <Place />
      <InstagramStrip />
      <FromTheFloor />
    </>
  );
}
