"use client";

import { useEffect, useRef, useState } from "react";
import { drawCard } from "@/lib/storyCard";
import { buildPdf, preloadPdf } from "@/lib/pdf";
import type { PdfData } from "@/lib/pdf";
import { saveFile, canvasToBlob } from "@/lib/download";
import { loadImage } from "@/lib/image";
import type { Photo } from "../FaceScanApp";

export default function ShareSection({ pdf, photo, beardStyle }: { pdf: PdfData; photo: Photo; beardStyle: string }) {
  const cardRef = useRef<HTMLCanvasElement>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState<"card" | "pdf" | null>(null);
  const [showPhoto, setShowPhoto] = useState(true);
  const [useTryOn, setUseTryOn] = useState(true);
  const { result, code, tryOn } = pdf;

  useEffect(() => { preloadPdf(); }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let tryOnImg: HTMLImageElement | null = null;
      if (showPhoto && useTryOn && tryOn) {
        tryOnImg = await loadImage(tryOn).catch(() => null);
      }
      if (cancelled || !cardRef.current) return;
      await drawCard(cardRef.current, {
        shape: result.key, match: result.ranked[0][1], cut: result.cuts[0].n, beard: beardStyle, code,
        photo: showPhoto ? { img: photo.img, det: photo.det } : null,
        tryOn: tryOnImg,
      });
    })();
    return () => { cancelled = true; };
  }, [result, code, photo, beardStyle, showPhoto, useTryOn, tryOn]);

  async function run(kind: "card" | "pdf") {
    setBusy(kind); setMsg("");
    try {
      const how = kind === "card"
        ? await saveFile(await canvasToBlob(cardRef.current!), `unseen-men-${result.key}.png`)
        : await saveFile(await buildPdf(pdf), `unseen-men-report-${pdf.name.toLowerCase().replace(/[^a-z]+/g, "-")}.pdf`);
      if (how === "downloaded") setMsg(kind === "pdf" ? "Report saved. On a phone, find it in Files → Downloads; on a computer, in your Downloads folder." : "Story card saved to your Downloads.");
      if (how === "shared") setMsg(kind === "pdf" ? "Report shared. Choose “Save to Files” to keep a copy." : "");
    } catch (e) {
      console.error(e);
      setMsg("The file wasn't saved. Try again.");
    } finally { setBusy(null); }
  }

  return (
    <div className="stack">
      <h3>Share your result</h3>
      <p className="small muted">The story card shows your face shape, cut and beard. Your skin read stays in your private PDF.</p>
      <canvas ref={cardRef} width={1080} height={1920} className="cardprev" />
      <div className="row toggles">
        <label className="check small"><input type="checkbox" checked={!showPhoto} onChange={e => setShowPhoto(!e.target.checked)} /><span>Hide my photo</span></label>
        {tryOn && showPhoto && (
          <label className="check small"><input type="checkbox" checked={useTryOn} onChange={e => setUseTryOn(e.target.checked)} /><span>Use my new-look preview</span></label>
        )}
      </div>
      <div className="row">
        <button style={{ flex: 1 }} disabled={busy !== null} onClick={() => run("card")}>{busy === "card" ? "Saving…" : "Save story card"}</button>
        <button style={{ flex: 1 }} className="primary-outline" disabled={busy !== null} onClick={() => run("pdf")}>{busy === "pdf" ? "Building PDF…" : "Download PDF report"}</button>
      </div>
      {msg && <p className="small muted" role="status">{msg}</p>}
    </div>
  );
}
