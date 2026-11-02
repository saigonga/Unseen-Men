"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cropFace } from "@/lib/crop";
import type { Photo } from "../FaceScanApp";

export type LookMode = "hair" | "beard" | "both";
export interface Look { status: "loading" | "done" | "error"; img?: string; error?: string }
export const lookKey = (mode: LookMode, cut?: string, beard?: string) => `${mode}|${cut ?? ""}|${beard ?? ""}`;

interface Ctx {
  enabled: boolean | null;     // server has an API key
  consent: boolean;
  setConsent: (v: boolean) => void;
  looks: Record<string, Look>;
  request: (mode: LookMode, cut?: string, beard?: string) => void;
}

const TryOnCtx = createContext<Ctx | null>(null);
export const useTryOn = () => useContext(TryOnCtx);

const ERR: Record<string, string> = {
  rate_limited: "Too many previews right now. Try again in a little while.",
  not_configured: "AI previews aren't switched on yet.",
  default: "The preview didn't finish. Tap to try again.",
};

export function TryOnProvider({ photo, children }: { photo: Photo; children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [consent, setConsent] = useState(false);
  const [looks, setLooks] = useState<Record<string, Look>>({});
  const imageRef = useRef<string | null>(null);
  const inflight = useRef(new Set<string>());

  useEffect(() => {
    fetch("/api/tryon").then(r => r.json()).then(d => setEnabled(Boolean(d.enabled))).catch(() => setEnabled(false));
  }, []);
  // The cropped photo lives only in memory and is dropped when the results screen closes.
  useEffect(() => () => { imageRef.current = null; }, []);

  const request = useCallback((mode: LookMode, cut?: string, beard?: string) => {
    const key = lookKey(mode, cut, beard);
    if (inflight.current.has(key)) return;
    inflight.current.add(key);
    setLooks(l => ({ ...l, [key]: { status: "loading" } }));
    (async () => {
      try {
        imageRef.current ??= cropFace(photo.img, photo.det.box, { padX: 0.8, padTop: 1.0, padBottom: 1.0, max: 1024, aspect: 2 / 3 })
          .toDataURL("image/jpeg", 0.9);
        const r = await fetch("/api/tryon", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageRef.current, mode, cut, beard }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d.image) throw new Error(d.error || "default");
        setLooks(l => ({ ...l, [key]: { status: "done", img: d.image } }));
      } catch (e) {
        setLooks(l => ({ ...l, [key]: { status: "error", error: ERR[(e as Error).message] ?? ERR.default } }));
      } finally { inflight.current.delete(key); }
    })();
  }, [photo]);

  return <TryOnCtx.Provider value={{ enabled, consent, setConsent, looks, request }}>{children}</TryOnCtx.Provider>;
}

/** Consent box shown once, above the first style. */
export function TryOnConsent() {
  const t = useTryOn();
  if (!t) return null;
  if (t.enabled === false) return <div className="notice small">Coming soon: see every haircut and beard on your own photo.</div>;
  if (t.enabled === null) return null;
  return (
    <div className="consent">
      <span className="eyebrow">See it on you</span>
      <p className="small">Tap <strong>See it on me</strong> on any haircut or beard to preview it on your own photo.</p>
      <label className="check small">
        <input type="checkbox" checked={t.consent} onChange={e => t.setConsent(e.target.checked)} />
        <span>Send my photo to our AI image partner (OpenAI) to create previews. We don&apos;t store it.</span>
      </label>
    </div>
  );
}

/** Per-style button + inline preview. */
export function SeeOnMe({ mode, cut, beard, label }: { mode: LookMode; cut?: string; beard?: string; label?: string }) {
  const t = useTryOn();
  if (!t || !t.enabled) return null;
  const look = t.looks[lookKey(mode, cut, beard)];
  const what = mode === "hair" ? cut : mode === "beard" ? beard : `${cut} + ${beard?.toLowerCase()}`;
  return (
    <div className="seeonme">
      {look?.status === "done" && look.img && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="tryon-img" src={look.img} alt={`AI preview of you with ${what}`} />
          <p className="small muted">AI preview of you with {what}. Your barber will adapt it to your hair type.</p>
        </>
      )}
      {look?.status === "loading" && <div className="tryon-wait"><div className="scanline" /><span className="small mono">Creating your look… up to a minute</span></div>}
      {look?.status === "error" && <div className="notice bad small">{look.error}</div>}
      {look?.status !== "done" && look?.status !== "loading" && (
        <button className="see-btn" disabled={!t.consent} onClick={() => t.request(mode, cut, beard)}>
          {label ?? "See it on me"}
        </button>
      )}
      {!t.consent && look?.status !== "done" && <span className="small muted">Tick the box above to enable previews.</span>}
    </div>
  );
}
