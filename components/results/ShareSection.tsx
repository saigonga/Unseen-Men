"use client";

import { useEffect, useRef, useState } from "react";
import { drawCard } from "@/lib/storyCard";
import { buildPdf, preloadPdf } from "@/lib/pdf";
import type { PdfData } from "@/lib/pdf";
import { saveFile, canvasToBlob } from "@/lib/download";

export default function ShareSection({ pdf }: { pdf: PdfData }) {
  const cardRef = useRef<HTMLCanvasElement>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState<"card" | "pdf" | null>(null);
  const { result, code } = pdf;

  useEffect(() => {
    preloadPdf();
    if (cardRef.current) drawCard(cardRef.current, { shape: result.key, cut: result.cuts[0].n, code });
  }, [result, code]);

  async function run(kind: "card" | "pdf") {
    setBusy(kind); setMsg("");
    try {
      if (kind === "card") await saveFile(await canvasToBlob(cardRef.current!), `unseen-men-${result.key}.png`);
      else await saveFile(await buildPdf(pdf), "unseen-men-face-report.pdf");
    } catch (e) {
      console.error(e);
      setMsg("The file wasn't saved. Try again.");
    } finally { setBusy(null); }
  }

  return (
    <div className="stack">
      <h3>Share your result</h3>
      <p className="small muted">The story card shows only your face shape and cut. Your skin read stays in your private PDF.</p>
      <canvas ref={cardRef} width={1080} height={1920} className="cardprev" />
      <div className="row">
        <button style={{ flex: 1 }} disabled={busy !== null} onClick={() => run("card")}>{busy === "card" ? "Saving…" : "Save story card"}</button>
        <button style={{ flex: 1 }} disabled={busy !== null} onClick={() => run("pdf")}>{busy === "pdf" ? "Saving…" : "Save PDF report"}</button>
      </div>
      {msg && <p className="small muted">{msg}</p>}
    </div>
  );
}
