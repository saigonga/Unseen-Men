"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detect } from "@/lib/detector";
import type { Detection } from "@/lib/detector";
import { checkQuality, MEN_ONLY_MSG } from "@/lib/quality";
import type { QualityReport } from "@/lib/quality";
import { drawOverlay } from "@/lib/overlay";
import { canvasToBlob } from "@/lib/download";
import { loadImage } from "@/lib/image";
import LiveCamera, { cameraSupport } from "../capture/LiveCamera";
import type { CameraProblem, LiveShot } from "../capture/LiveCamera";
import type { ModelState, Photo } from "../FaceScanApp";

interface Pending { img: HTMLImageElement; url: string; source: "camera" | "upload"; det?: Detection }
type Msg = { text: string; bad: boolean } | null;
type Mode = "choose" | "live" | "preview";

const PROBLEM_TEXT: Record<CameraProblem, string> = {
  denied: "Camera access was blocked. You can allow it in your browser settings, or upload a photo instead.",
  nocamera: "We couldn't find a front camera on this device. Upload a photo instead.",
  unsupported: "This browser can't open the live camera. Upload a photo instead.",
  insecure: "The live camera only works on a secure (https) link. Upload a photo instead, or open the https link.",
  inapp: "Instagram and Facebook's built-in browser block the camera. Open this link in Chrome or Safari for the live camera (tap ••• → Open in browser), or upload a photo.",
  female: MEN_ONLY_MSG,
};


export default function Capture({ model, onAnalyse }: { model: ModelState; onAnalyse: (p: Photo) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("choose");
  const [pending, setPending] = useState<Pending | null>(null);
  const [det, setDet] = useState<Detection | null>(null);
  const [report, setReport] = useState<QualityReport | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);
  const [camHint, setCamHint] = useState<string | null>(null);
  const handedOff = useRef(false);

  const pendingRef = useRef<Pending | null>(null);
  pendingRef.current = pending;
  useEffect(() => () => { if (!handedOff.current && pendingRef.current) URL.revokeObjectURL(pendingRef.current.url); }, []);
  useEffect(() => { const p = cameraSupport(); if (p === "inapp" || p === "insecure") setCamHint(PROBLEM_TEXT[p]); }, []);

  const inspect = useCallback(async (p: Pending) => {
    setBusy(true); setMsg(null); setReport(null); setDet(null);
    try {
      const d = p.det ?? await detect(p.img);
      if (!d) { setMsg({ text: "No face found. Hold the phone at arm's length, face the camera, and try again.", bad: true }); return; }
      const q = checkQuality(p.img, d);
      setDet(d); setReport(q);
      if (q.blocking) setMsg({ text: q.blocking, bad: true });
      else if (q.failed) setMsg({ text: `${q.failed} check${q.failed > 1 ? "s" : ""} need attention. Retake for the most accurate result, or continue anyway.`, bad: false });
    } catch (e) {
      console.error(e);
      setMsg({ text: "Something went wrong reading this photo. Try another one.", bad: true });
    } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    if (model === "ready" && pending && !det && !report && !busy && !msg?.bad) inspect(pending);
  }, [model, pending, det, report, busy, msg, inspect]);

  useEffect(() => {
    if (pending && det && overlayRef.current) drawOverlay(overlayRef.current, pending.img, det, false);
  }, [pending, det]);

  function setNew(p: Pending) {
    if (pendingRef.current) URL.revokeObjectURL(pendingRef.current.url);
    setPending(p); setDet(null); setReport(null); setMsg(null); setMode("preview");
    if (model === "ready") inspect(p);
    else if (model === "loading") setMsg({ text: "The face model is still loading. Your photo will be checked in a few seconds.", bad: false });
    else setMsg({ text: "The face model couldn't load. Reload the page and try again.", bad: true });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    try { setNew({ img: await loadImage(url), url, source: "upload" }); }
    catch { URL.revokeObjectURL(url); setMsg({ text: "That file couldn't be opened as a photo. Try another one.", bad: true }); }
  }

  async function onShot(s: LiveShot) {
    const url = URL.createObjectURL(await canvasToBlob(s.canvas, "image/jpeg", 0.92));
    setNew({ img: await loadImage(url), url, source: "camera", det: s.det });
  }

  function onProblem(p: CameraProblem) {
    setMode(p === "female" ? "preview" : "choose");
    if (p === "female") {
      if (pendingRef.current) URL.revokeObjectURL(pendingRef.current.url);
      setPending(null); setReport(null); setDet(null);
    }
    setMsg({ text: PROBLEM_TEXT[p], bad: true });
  }

  const openPicker = () => { if (fileRef.current) { fileRef.current.value = ""; fileRef.current.click(); } };
  const reset = () => { setMode("choose"); setMsg(null); setReport(null); setDet(null); };
  const canAnalyse = Boolean(pending && det && report && !report.blocking);
  const modelLine = model === "loading" ? "Loading the face model…" : model === "ready" ? "Face model ready. Runs on this device." : "The face model couldn't load in this view. Try reopening the page.";

  return (
    <section className="stack">
      <span className="eyebrow">Step 3 of 4 · Your photo</span>
      <h2>Take a selfie</h2>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

      {mode === "live" && <LiveCamera onShot={onShot} onProblem={onProblem} />}

      {mode !== "live" && (
        <div className="frame">
          {!pending && <div className="oval" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {pending && <img src={pending.url} alt="Your selfie" />}
          <canvas ref={overlayRef} hidden={!det} />
          {!pending && <p className="hint">Fit your face in the oval</p>}
        </div>
      )}

      {report && (
        <div className="checks">
          {report.checks.map(c => <div key={c.id} className={`chk ${c.ok ? "ok" : "warn"}`}><b /><span>{c.text}</span></div>)}
        </div>
      )}
      {msg && <div className={`notice${msg.bad ? " bad" : ""}`}>{msg.text}</div>}
      {busy && <p className="small muted mono">Checking your photo…</p>}

      <div className="stack">
        {mode === "choose" && (
          <>
            {camHint && !msg && <div className="notice">{camHint}</div>}
            <button className="primary" onClick={() => { setMsg(null); setMode("live"); }} disabled={model !== "ready"}>Take a photo</button>
            <button onClick={openPicker}>Upload a photo</button>
          </>
        )}
        {mode === "live" && <button className="ghost" onClick={reset}>Cancel · upload a photo instead</button>}
        {mode === "preview" && canAnalyse && (
          <button className="primary" onClick={() => { handedOff.current = true; onAnalyse({ img: pending!.img, url: pending!.url, det: det! }); }}>
            {report!.failed ? "Analyse anyway" : "Analyse my face"}
          </button>
        )}
        {mode === "preview" && (
          <div className="row">
            <button style={{ flex: 1 }} onClick={() => { setMsg(null); setMode("live"); }}>Take a photo</button>
            <button style={{ flex: 1 }} onClick={openPicker}>Upload a photo</button>
          </div>
        )}
      </div>
      <p className="small muted">{modelLine}</p>
    </section>
  );
}
