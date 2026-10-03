import type { Metadata } from "next";
import Configurator from "@/components/atelier/Configurator";

export const metadata: Metadata = {
  title: "Atelier — Design a pair in 3D",
  description:
    "Design a leather slide in 3D: choose the silhouette, leather, sole and stitching, stamp your brand on the footbed and send the spec to our workshop.",
  alternates: { canonical: "/atelier" },
};

export default function AtelierPage() {
  return (
    // light: the header sits over the pale sage studio and the paper panel, so it needs dark text
    <div data-nav="light">
      <Configurator />
    </div>
  );
}
