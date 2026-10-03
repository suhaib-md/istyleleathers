"use client";

import { useState } from "react";
import { waLink } from "@/content/site";
import { WhatsApp } from "@/components/ui/Icons";

export default function QuickMessage() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  return (
    <form
      className="grid gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (!msg.trim()) {
          setErr("Write a short message first.");
          return;
        }
        setErr("");
        window.open(waLink(`Hi I Style Leathers!${name ? ` This is ${name}.` : ""}\n${msg}`), "_blank", "noopener");
      }}
    >
      <label className="block">
        <span className="mono opacity-55">Your name</span>
        <input className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block">
        <span className="mono opacity-55">Message</span>
        <textarea className="field min-h-[130px] resize-y" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="I'm looking for…" />
      </label>
      {err && (
        <p role="alert" className="mono text-oxblood">
          {err}
        </p>
      )}
      <button type="submit" className="tag-btn tag-btn--wa justify-self-start">
        <WhatsApp size={16} /> Send on WhatsApp
      </button>
    </form>
  );
}
