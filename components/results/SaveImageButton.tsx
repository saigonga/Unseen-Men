"use client";

import { useState } from "react";
import { canvasToBlob, saveFile } from "@/lib/download";

export default function SaveImageButton({ canvas, filename, label, disabled }: {
  canvas: () => HTMLCanvasElement | null;
  filename: string;
  label: string;
  disabled?: boolean;
}) {
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    const source = canvas();
    if (!source) return;
    setStatus("");
    setPreview("");
    setBusy(true);
    const type = filename.endsWith(".jpg") ? "image/jpeg" : "image/png";

    try {
      const embedded = /Instagram|FBAN|FBAV|FB_IAB/i.test(navigator.userAgent);
      if (!embedded) {
        const outcome = await saveFile(await canvasToBlob(source, type, 0.92), filename);
        if (outcome === "cancelled") return;
        setStatus(outcome === "shared" ? "Image shared." : "Download requested.");
        if (!window.matchMedia("(pointer: coarse)").matches) return;
      }
      setPreview(source.toDataURL(type, 0.92));
    } catch {
      setStatus("Could not prepare the image. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ flex: 1, display: "grid", gap: 8 }}>
      <button type="button" className="btn-secondary" disabled={disabled || busy} onClick={save}>
        {busy ? "Preparing image…" : label}
      </button>
      {status && <span role="status">{status}</span>}
      {preview && (
        <div>
          <p role="status">Press and hold the image, then choose Save Image. If that option is missing, take a screenshot of this preview.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label.replace(/^Save /, "")} style={{ display: "block", width: "100%", maxWidth: 360, height: "auto", WebkitTouchCallout: "default" }} />
          <button type="button" className="btn-secondary" onClick={() => setPreview("")}>Close preview</button>
        </div>
      )}
    </div>
  );
}
