"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo } from "../FaceScanApp";
import type { Look, Lookbook } from "@/lib/lookbook";
import { lookDescription, lookTitle } from "@/lib/lookbook";
import { drawLookCard } from "@/lib/lookbookCanvas";
import { canvasToBlob, saveFile } from "@/lib/download";

function LookCard({ look, book, photo, index }: { look: Look; book: Lookbook; photo: Photo; index: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const title = lookTitle(look);

  useEffect(() => {
    if (canvas.current) drawLookCard(canvas.current, photo.img, photo.det, look);
  }, [look, photo]);

  async function save() {
    if (!canvas.current) return;
    setBusy(true);
    setStatus("");
    try {
      const blob = await canvasToBlob(canvas.current, "image/jpeg", 0.92);
      const outcome = await saveFile(blob, `nodd-men-look-${index + 1}.jpg`);
      if (outcome === "downloaded") setStatus("Look saved.");
      if (outcome === "shared") setStatus("Look shared.");
    } catch {
      setStatus("Could not save this look. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article style={{ border: "1px solid #DDD9D3", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      <canvas ref={canvas} role="img" aria-label={`Your selfie with ${title.toLowerCase()}`}
        width={640} height={800} style={{ display: "block", width: "100%", height: "auto", background: "#17120f" }} />
      <div style={{ padding: 12, display: "grid", gap: 8, justifyItems: "start" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#5C4F47" }}>{lookDescription(book.shape, look)}</p>
        <button type="button" className="btn-secondary" disabled={busy} aria-label={`Save ${title}`} onClick={save}>Save look</button>
        {status && <span role="status" style={{ fontSize: 12 }}>{status}</span>}
      </div>
    </article>
  );
}

export default function LookbookSection({ book, photo }: { book: Lookbook; photo: Photo }) {
  return (
    <section aria-labelledby="lookbook-title" style={{ display: "grid", gap: 14 }}>
      <div>
        <h2 id="lookbook-title" style={{ margin: 0, fontSize: 22 }}>Your personal lookbook</h2>
        <p style={{ margin: "4px 0 0", color: "#5C4F47", fontSize: 13 }}>Try eight looks on your selfie. Hair and beard filters show a stylized preview.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 185px), 1fr))", gap: 12 }}>
        {book.looks.map((look, index) => <LookCard key={index} look={look} book={book} photo={photo} index={index} />)}
      </div>
    </section>
  );
}
