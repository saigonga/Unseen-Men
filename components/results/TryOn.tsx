"use client";

import { useEffect, useState } from "react";
import { cropFace } from "@/lib/crop";
import type { Photo } from "../FaceScanApp";
import StyleArt from "./StyleArt";

const ERR: Record<string, string> = {
  rate_limited: "Too many previews right now. Try again in a little while.",
  not_configured: "The AI try-on isn't switched on yet.",
  default: "The preview didn't finish. Try again.",
};

export default function TryOn({ photo, cut, beard, onImage }: { photo: Photo; cut: string; beard: string; onImage: (dataUrl: string | null) => void }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [img, setImg] = useState<string | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/tryon").then(r => r.json()).then(d => setEnabled(Boolean(d.enabled))).catch(() => setEnabled(false));
  }, []);

  async function run() {
    setBusy(true); setErr("");
    try {
      const c = cropFace(photo.img, photo.det.box, { padX: 0.8, padTop: 1.0, padBottom: 1.0, max: 1024, aspect: 2 / 3 });
      const image = c.toDataURL("image/jpeg", 0.9);
      const r = await fetch("/api/tryon", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, cut, beard }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.image) throw new Error(d.error || "default");
      setImg(d.image); onImage(d.image);
    } catch (e) {
      setErr(ERR[(e as Error).message] ?? ERR.default);
    } finally { setBusy(false); }
  }

  return (
    <div className="stack tryon">
      <span className="eyebrow">See it on you</span>
      <h3>{cut} + {beard.toLowerCase()}</h3>
      {!img && (
        <div className="tryon-pair">
          <StyleArt kind="cut" name={cut} size={96} />
          <span className="plus">+</span>
          <StyleArt kind="beard" name={beard} size={96} />
        </div>
      )}
      {img && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="tryon-img" src={img} alt={`AI preview of you with a ${cut} and ${beard}`} />
          <p className="small muted">AI preview. Your barber will adapt it to your hair type.</p>
        </>
      )}
      {enabled && !img && (
        <>
          <label className="check">
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
            <span className="small">Send my photo once to our AI image partner (OpenAI) to create this preview. We don&apos;t store it.</span>
          </label>
          <button className="primary" disabled={!agree || busy} onClick={run}>{busy ? "Creating your preview… (up to a minute)" : "Show this look on my photo"}</button>
        </>
      )}
      {enabled === false && <p className="small muted">The AI try-on on your own photo is coming soon.</p>}
      {err && <div className="notice bad">{err}</div>}
    </div>
  );
}
