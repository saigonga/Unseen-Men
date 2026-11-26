"use client";

import { useEffect, useRef, useState } from "react";
import { drawCard } from "@/lib/storyCard";
import { buildPdf, preloadPdf } from "@/lib/pdf";
import type { PdfData } from "@/lib/pdf";
import { saveFile } from "@/lib/download";
import SaveImageButton from "./SaveImageButton";
import { loadImage } from "@/lib/image";
import { shapeHeadline } from "@/lib/faceShape";
import type { Photo } from "../FaceScanApp";
import { useTryOn, lookKey } from "./TryOnContext";

export default function ShareSection({
  pdf,
  photo,
  beardStyle,
}: {
  pdf: PdfData;
  photo: Photo;
  beardStyle: string;
}) {
  const cardRef = useRef<HTMLCanvasElement>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [showPhoto, setShowPhoto] = useState(true);
  const [preferTryOn, setPreferTryOn] = useState(true);
  const { result, code } = pdf;
  const t = useTryOn();

  const tryOn = [
    lookKey("both", result.cuts[0].n, beardStyle),
    lookKey("hair", result.cuts[0].n),
    lookKey("beard", undefined, beardStyle),
  ]
    .map((k) => t?.looks[k])
    .find((l) => l?.status === "done")?.img ?? null;

  useEffect(() => {
    preloadPdf();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCardReady(false);
    (async () => {
      let tryOnImg: HTMLImageElement | null = null;
      if (showPhoto && preferTryOn && tryOn) {
        tryOnImg = await loadImage(tryOn).catch(() => null);
      }
      if (cancelled || !cardRef.current) return;
      await drawCard(cardRef.current, {
        shape: result.key,
        headline: shapeHeadline(result),
        code,
        photo: showPhoto ? { img: photo.img, det: photo.det } : null,
        tryOn: tryOnImg,
      });
      if (!cancelled) setCardReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [result, code, photo, beardStyle, showPhoto, preferTryOn, tryOn]);

  async function downloadPdf() {
    setBusy(true);
    setMsg("");
    try {
      const how = await saveFile(
        await buildPdf({ ...pdf, tryOn }),
        `nodd-men-report-${pdf.name.toLowerCase().replace(/[^a-z]+/g, "-")}.pdf`
      );
      if (how === "downloaded") setMsg("Report download requested.");
      if (how === "shared") setMsg("Report shared. Choose 'Save to Files' to keep a copy.");
    } catch (e) {
      console.error(e);
      setMsg("The file wasn't saved. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #DDD9D3",
        borderRadius: "3px 14px 3px 3px",
        padding: 20,
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-heading)",
            fontWeight: 500,
            fontSize: 18,
            color: "#4F2C1D",
          }}
        >
          Export & Story Card
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#7A6A60" }}>
          Share your 9:16 Instagram story card or download the full private PDF report.
        </p>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 240,
          margin: "0 auto",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #DDD9D3",
          boxShadow: "0 8px 24px -12px rgba(0,0,0,0.15)",
        }}
      >
        <canvas
          ref={cardRef}
          width={1080}
          height={1920}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", fontSize: 13 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!showPhoto}
            onChange={(e) => setShowPhoto(!e.target.checked)}
            style={{ accentColor: "#4F2C1D" }}
          />
          <span>Hide my photo on card</span>
        </label>

        {tryOn && showPhoto && (
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={preferTryOn}
              onChange={(e) => setPreferTryOn(e.target.checked)}
              style={{ accentColor: "#4F2C1D" }}
            />
            <span>Use AI try-on preview</span>
          </label>
        )}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <SaveImageButton canvas={() => cardRef.current} filename={`nodd-men-${result.key}.png`} label="Save story card" disabled={!cardReady} />
        <button
          type="button"
          disabled={busy}
          onClick={downloadPdf}
          className="btn-primary"
          style={{ flex: 1, padding: "12px 0", fontSize: 14 }}
        >
          {busy ? "Building PDF…" : "Download PDF report"}
        </button>
      </div>

      {msg && (
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            color: "#4F2C1D",
            textAlign: "center",
            fontWeight: 500,
          }}
          role="status"
        >
          {msg}
        </p>
      )}
    </div>
  );
}
