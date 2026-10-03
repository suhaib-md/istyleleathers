import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "I Style Leathers",
    short_name: "I Style",
    description: "Handmade leather goods from Melvisharam, Tamil Nadu.",
    start_url: "/",
    display: "standalone",
    background_color: "#21140d",
    theme_color: "#21140d",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
