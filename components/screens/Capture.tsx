"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detect } from "@/lib/detector";
import type { Detection } from "@/lib/detector";
import { checkQuality } from "@/lib/quality";
import type { QualityReport } from "@/lib/quality";
import { drawOverlay } from "@/lib/overlay";
import type { ModelState, Photo } from "../FaceScanApp";

interface Pending { img: HTMLImageElement; url: string }
type Msg = { text: string; bad: boolean } | null;

export default function Capture({ model, onAnalyse }: { model: ModelState; onAnalyse: (p: Photo) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [det, setDet] = useState<Detection | null>(null);
  const [report, setReport] = useState<QualityReport | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);
  const handedOff = useRef(false);

  // Free the photo if the user leaves this screen without analysing.
  const pendingRef = useRef<Pending | null>(null);
  pendingRef.current = pending;
  useEffect(() => () => { if (!handedOff.current && pendingRef.current) URL.revokeObjectURL(pendingRef.current.url); }, []);

  const inspect = useCallback(async (p: Pending) => {
    setBusy(true); setMsg(null); setReport(null); setDet(null);
    try {
      const d = await detect(p.img);
      if (!d) { setMsg({ text: "No face found. Hold the phone at arm's length, face the camera, and retake.", bad: true }); return; }
      const q = checkQuality(p.img, d);
      setDet(d); setReport(q);
      if (q.blocking) setMsg({ text: q.blocking, bad: true });
      else if (q.failed) setMsg({ text: `${q.failed} check${q.failed > 1 ? "s" : ""} need attention. Retake for the most accurate result, or continue anyway.`, bad: false });
    } catch (e) {
      console.error(e);
      setMsg({ text: "Something went wrong reading this photo. Try another one.", bad: true });
    } finally { setBusy(false); }
  }, []);

  // If a photo was picked before the model finished loading, inspect it once ready.
  useEffect(() => {
    if (model === "ready" && pending && !det && !report && !busy && !msg?.bad) inspect(pending);
  }, [model, pending, det, report, busy, msg, inspect]);

  useEffect(() => {
    if (pending && det && overlayRef.current) drawOverlay(overlayRef.current, pending.img, det, false);
  }, [pending, det]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (pending) URL.revokeObjectURL(pending.url);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.src = url;
    try { await img.decode(); } catch { setMsg({ text: "That file couldn't be opened as a photo. Try another one.", bad: true }); return; }
    const p = { img, url };
    setPending(p); setDet(null); setReport(null); setMsg(null);
    if (model === "ready") inspect(p);
    else if (model === "loading") setMsg({ text: "The face model is still loading. Your photo will be checked in a few seconds.", bad: false });
    else setMsg({ text: "The face model couldn't load. Reload the page and try again.", bad: true });
  }

  const openPicker = () => { if (fileRef.current) { fileRef.current.value = ""; fileRef.current.click(); } };
  const canAnalyse = Boolean(pending && det && report && !report.blocking);

  return (
    <section className="stack">
      <span className="eyebrow">Step 3 of 4 · Your photo</span>
      <h2>Take a selfie</h2>
      <div className="frame">
        {!pending && <div className="oval" />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {pending && <img src={pending.url} alt="Your selfie" />}
        <canvas ref={overlayRef} hidden={!det} />
        {!pending && <p className="hint">Fit your face in the oval</p>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="user" hidden onChange={onFile} />
      {report && (
        <div className="checks">
          {report.checks.map(c => <div key={c.id} className={`chk ${c.ok ? "ok" : "warn"}`}><b /><span>{c.text}</span></div>)}
        </div>
      )}
      {msg && <div className={`notice${msg.bad ? " bad" : ""}`}>{msg.text}</div>}
      <div className="stack">
        {!pending && <button className="primary" onClick={openPicker}>Open camera</button>}
        {busy && <p className="small muted mono">Checking your photo…</p>}
        {canAnalyse && (
          <button className="primary" onClick={() => { handedOff.current = true; onAnalyse({ img: pending!.img, url: pending!.url, det: det! }); }}>
            {report!.failed ? "Analyse anyway" : "Analyse my face"}
          </button>
        )}
        {pending && <button className="ghost" onClick={openPicker}>Retake photo</button>}
      </div>
      <p className="small muted">
        {model === "loading" ? "Loading the face model…" : model === "ready" ? "Face model ready. Runs on this device." : "The face model couldn't load in this view. Try reopening the page."}
      </p>
    </section>
  );
}
