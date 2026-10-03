"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { bySlug } from "@/content/products";
import { site, waLink } from "@/content/site";
import { Mail, WhatsApp } from "@/components/ui/Icons";

const KINDS = ["Footwear", "Bags", "Small leather goods", "Corporate gifts", "Something else"];
const QTY = ["Sample only", "Under 50", "50–200", "200–1,000", "1,000+"];

export default function EnquiryForm() {
  const params = useSearchParams();
  const ref = params.get("product");
  const prod = ref ? bySlug(ref) : undefined;
  const [kinds, setKinds] = useState<string[]>(prod ? [prod.category === "footwear" ? "Footwear" : prod.category === "bags" ? "Bags" : "Small leather goods"] : []);
  const [qty, setQty] = useState<string>("");
  const [f, setF] = useState({ name: "", company: "", phone: "", email: "", city: "", message: "" });
  const [error, setError] = useState("");

  const toggle = (k: string) => setKinds((x) => (x.includes(k) ? x.filter((y) => y !== k) : [...x, k]));

  const text = () =>
    [
      "Hi I Style Leathers — manufacturing enquiry",
      `Name: ${f.name}${f.company ? ` (${f.company})` : ""}`,
      f.city && `City: ${f.city}`,
      f.phone && `Phone: ${f.phone}`,
      f.email && `Email: ${f.email}`,
      kinds.length ? `Interested in: ${kinds.join(", ")}` : "",
      qty && `Quantity: ${qty}`,
      prod && `Reference: ${prod.name} (${prod.line})`,
      f.message && `Details: ${f.message}`,
    ]
      .filter(Boolean)
      .join("\n");

  const valid = () => {
    if (!f.name.trim()) return "Please add your name.";
    if (!f.phone.trim() && !f.email.trim()) return "Add a phone number or an email so we can reply.";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return "That email doesn't look right.";
    return "";
  };

  const send = (via: "wa" | "mail") => {
    const e = valid();
    setError(e);
    if (e) return;
    if (via === "wa") window.open(waLink(text()), "_blank", "noopener");
    else window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Manufacturing enquiry — ${f.company || f.name}`)}&body=${encodeURIComponent(text())}`;
  };

  const input = (k: keyof typeof f, label: string, type = "text", auto?: string) => (
    <label className="block">
      <span className="mono opacity-55">{label}</span>
      <input
        className="field"
        type={type}
        autoComplete={auto}
        inputMode={type === "tel" ? "tel" : undefined}
        value={f[k]}
        onChange={(e) => setF({ ...f, [k]: e.target.value })}
      />
    </label>
  );

  return (
    <form
      className="grid gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        send("wa");
      }}
      noValidate
    >
      {prod && (
        <p className="mono rounded-full border border-dashed border-current/30 px-4 py-2.5 text-tan">
          Reference: {prod.name} — {prod.line}
        </p>
      )}
      <div className="grid gap-8 sm:grid-cols-2">
        {input("name", "Your name *", "text", "name")}
        {input("company", "Brand / company", "text", "organization")}
        {input("phone", "Phone / WhatsApp", "tel", "tel")}
        {input("email", "Email", "email", "email")}
        {input("city", "City / country", "text", "address-level2")}
      </div>
      <fieldset>
        <legend className="mono mb-4 opacity-55">What would you like made?</legend>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button type="button" key={k} className={`chip !border-current/25 ${kinds.includes(k) ? "is-on" : ""}`} aria-pressed={kinds.includes(k)} onClick={() => toggle(k)}>
              {k}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mono mb-4 opacity-55">Roughly how many pieces?</legend>
        <div className="flex flex-wrap gap-2">
          {QTY.map((q) => (
            <button type="button" key={q} className={`chip !border-current/25 ${qty === q ? "is-on" : ""}`} aria-pressed={qty === q} onClick={() => setQty(q)}>
              {q}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="mono opacity-55">Tell us about it — designs, references, deadlines</span>
        <textarea className="field min-h-[120px] resize-y" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
      </label>
      {error && (
        <p role="alert" className="mono text-[#f0a58a]">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="tag-btn tag-btn--wa">
          <WhatsApp size={16} /> Send on WhatsApp
        </button>
        <button type="button" onClick={() => send("mail")} className="tag-btn tag-btn--cream">
          <Mail size={16} /> Send by email
        </button>
      </div>
      <p className="text-[13px] opacity-50">Nothing is stored on this website — your message opens in WhatsApp or your email app, ready to send.</p>
    </form>
  );
}
