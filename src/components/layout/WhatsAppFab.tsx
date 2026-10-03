"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { waGeneral, waLink } from "@/content/site";
import { bySlug } from "@/content/products";
import { WhatsApp } from "@/components/ui/Icons";

export default function WhatsAppFab() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const on = () => setVisible(window.scrollY > window.innerHeight * 0.5);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [pathname]);

  const slug = pathname.startsWith("/collection/") ? pathname.split("/")[2] : null;
  const p = slug ? bySlug(slug) : null;
  const href = p ? waLink(`Hi I Style Leathers! I'm interested in "${p.name}" (${p.line}). Could you share price and availability?`) : waGeneral;

  // the atelier has its own WhatsApp CTA
  if (pathname.startsWith("/atelier")) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Chat with us on WhatsApp"
      className={`group fixed bottom-5 right-5 z-[60] ${slug ? "max-md:hidden" : ""} flex items-center gap-0 overflow-hidden rounded-full bg-[#1f8f4e] p-[15px] text-white shadow-[0_14px_40px_-12px_rgba(0,0,0,.55)] transition-all duration-500 hover:gap-3 hover:pr-6 md:bottom-8 md:right-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <span className="pointer-events-none absolute inset-[4px] rounded-full border border-dashed border-white/45" />
      <WhatsApp size={24} />
      <span className="mono max-w-0 overflow-hidden whitespace-nowrap transition-all duration-500 group-hover:max-w-[220px]">
        Chat with the workshop
      </span>
    </a>
  );
}
