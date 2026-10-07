"use client";

import { useEffect, useState } from "react";

const LINES = ["Measuring jaw, cheekbones, brow…", "Comparing against 6 face shapes…", "Matching cuts and beard styles…"];

export default function Scanning({ url }: { url: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(n => (n + 1) % LINES.length), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="stack">
      <span className="eyebrow">Step 4 of 4 · Scanning</span>
      <h2>Mapping 68 points</h2>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="frame"><img src={url} alt="" /><div className="scanline" /></div>
      <p className="muted mono small" aria-live="polite">{LINES[i]}</p>
    </section>
  );
}
