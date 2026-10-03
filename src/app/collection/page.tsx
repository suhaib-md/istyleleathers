import type { Metadata } from "next";
import CollectionView from "@/components/catalog/CollectionView";
import HowToOrder from "@/components/home/HowToOrder";

export const metadata: Metadata = {
  title: "The Collection — Leather sandals, bags & accessories",
  description:
    "Handmade leather slides, toe-rings and thongs, briefcases, duffels, backpacks and small leather goods from our workshop in Melvisharam. Every piece made to order.",
  alternates: { canonical: "/collection" },
};

export default function CollectionPage() {
  return (
    <div data-nav="light" className="bg-cream">
      <CollectionView />
      <HowToOrder />
    </div>
  );
}
