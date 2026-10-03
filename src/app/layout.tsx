import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Schibsted_Grotesk, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import TransitionProvider from "@/components/providers/Transition";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Cursor from "@/components/layout/Cursor";
import Loader from "@/components/layout/Loader";
import WhatsAppFab from "@/components/layout/WhatsAppFab";
import { site } from "@/content/site";
import { motionScript } from "@/lib/motion";

const serif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const grotesk = Schibsted_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "I Style Leathers — Handmade leather goods from Melvisharam",
    template: "%s — I Style Leathers",
  },
  description:
    "Leather sandals, bags and accessories made by hand in our workshop in Melvisharam, Tamil Nadu. Order on WhatsApp, or manufacture your own label with us.",
  keywords: [
    "leather sandals",
    "leather bags",
    "leather manufacturer Tamil Nadu",
    "Melvisharam leather",
    "private label leather goods India",
    "leather briefcase",
    "leather duffel",
    "corporate leather gifts",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#21140d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${serif.variable} ${grotesk.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <Script id="motion-pref" strategy="beforeInteractive">
          {motionScript}
        </Script>
        <a
          href="#main"
          className="mono fixed left-4 top-4 z-[200] -translate-y-24 bg-ink px-4 py-3 text-cream focus:translate-y-0"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <TransitionProvider>
            <Nav />
            <main id="main">{children}</main>
            <Footer />
            <WhatsAppFab />
          </TransitionProvider>
        </SmoothScroll>
        <Cursor />
        <Loader />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
