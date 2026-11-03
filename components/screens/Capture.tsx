"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detect } from "@/lib/detector";
import type { Detection } from "@/lib/detector";
import { checkQuality, MEN_ONLY_MSG } from "@/lib/quality";
import type { QualityReport } from "@/lib/quality";
import { drawOverlay } from "@/lib/overlay";
import { canvasToBlob } from "@/lib/download";
import { loadImage } from "@/lib/image";
import { robustMeasures } from "@/lib/robust";
import type { Measures } from "@/lib/faceShape";
import LiveCamera, { cameraSupport } from "../capture/LiveCamera";
import type { CameraProblem, LiveShot } from "../capture/LiveCamera";
import type { ModelState, Photo } from "../FaceScanApp";
import StepBar from "../StepBar";

interface Pending {
  img: HTMLImageElement;
  url: string;
  source: "camera" | "upload";
  det?: Detection;
  frames?: Measures[];
}

type Msg = { text: string; bad: boolean } | null;
type Mode = "live" | "preview" | "choose";

const PROBLEM_TEXT: Record<CameraProblem, string> = {
  denied: "Camera access was blocked. Please allow camera permissions in your browser or system settings, then tap Try Camera Again.",
  nocamera: "No camera was detected on this device. Upload a photo instead.",
  unsupported: "Could not open camera stream. Make sure no other application is using your webcam, or upload a photo instead.",
  insecure: "The live camera requires a secure link (https or localhost). Upload a photo instead.",
  inapp: "In-app browsers often block camera access. Open this link in Chrome or Safari, or upload a photo.",
  female: MEN_ONLY_MSG,
};

export default function Capture({
  model,
  onAnalyse,
  initialMode = "live",
  onClose,
}: {
  model: ModelState;
  onAnalyse: (p: Photo) => void;
  initialMode?: Mode;
  onClose?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pending, setPending] = useState<Pending | null>(null);
  const [det, setDet] = useState<Detection | null>(null);
  const [report, setReport] = useState<QualityReport | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);
  const [measures, setMeasures] = useState<Measures | null>(null);
  const handedOff = useRef(false);

  const pendingRef = useRef<Pending | null>(null);
  pendingRef.current = pending;

  useEffect(
    () => () => {
      if (!handedOff.current && pendingRef.current) {
        URL.revokeObjectURL(pendingRef.current.url);
      }
    },
    []
  );

  useEffect(() => {
    // Only pre-check if we are not actively in "live" mode
    if (initialMode === "live") return;
    const p = cameraSupport();
    if (p) {
      setMode("choose");
      setMsg({ text: PROBLEM_TEXT[p], bad: false });
    }
  }, [initialMode]);

  const inspect = useCallback(async (p: Pending) => {
    setBusy(true);
    setMsg(null);
    setReport(null);
    setDet(null);
    setMeasures(null);

    try {
      const d = p.det ?? (await detect(p.img));
      if (!d) {
        setMsg({
          text: "No face found. Hold the phone straight and try again.",
          bad: true,
        });
        return;
      }
      const q = checkQuality(p.img, d);
      const mRes = (await robustMeasures(p.img, d, p.frames ?? []))?.m ?? null;
      setMeasures(mRes);
      setDet(d);
      setReport(q);

      // If taken via live camera and quality checks pass, move ahead automatically to analysis!
      if (p.source === "camera" && !q.blocking && q.failed === 0) {
        handedOff.current = true;
        onAnalyse({
          img: p.img,
          url: p.url,
          det: d,
          m: mRes ?? undefined,
        });
        return;
      }

      if (q.blocking) {
        setMsg({ text: `${q.blocking} You can still tap "Analyse anyway" or retake.`, bad: false });
      } else if (q.failed) {
        setMsg({
          text: `${q.failed} quality check${q.failed > 1 ? "s" : ""} need attention. You can proceed anyway or retake.`,
          bad: false,
        });
      }
    } catch (e) {
      console.error(e);
      setMsg({ text: "Could not read this photo. Try another one.", bad: true });
    } finally {
      setBusy(false);
    }
  }, [onAnalyse]);

  useEffect(() => {
    if (model === "ready" && pending && !det && !report && !busy && !msg?.bad) {
      inspect(pending);
    }
  }, [model, pending, det, report, busy, msg, inspect]);

  useEffect(() => {
    if (pending && det && overlayRef.current) {
      drawOverlay(overlayRef.current, pending.img, det, false);
    }
  }, [pending, det]);

  function setNew(p: Pending) {
    if (pendingRef.current) URL.revokeObjectURL(pendingRef.current.url);
    setPending(p);
    setDet(null);
    setReport(null);
    setMsg(null);
    setMode("preview");
    if (model === "ready") inspect(p);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    try {
      setNew({ img: await loadImage(url), url, source: "upload" });
    } catch {
      URL.revokeObjectURL(url);
      setMsg({ text: "Could not open that image file.", bad: true });
    }
  }

  async function onShot(s: LiveShot) {
    const url = URL.createObjectURL(await canvasToBlob(s.canvas, "image/jpeg", 0.92));
    setNew({ img: await loadImage(url), url, source: "camera", det: s.det, frames: s.frames });
  }

  function onProblem(p: CameraProblem) {
    setMode("choose");
    setMsg({ text: PROBLEM_TEXT[p], bad: true });
  }

  const openPicker = () => {
    if (fileRef.current) {
      fileRef.current.value = "";
      fileRef.current.click();
    }
  };

  const canAnalyse = Boolean(pending && det && report);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        minHeight: 740,
        boxSizing: "border-box",
        background: "#FFFFFF",
        color: "#1B1815",
        padding: "18px 20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <StepBar step={2} total={4} onClose={onClose} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-heading)",
            fontWeight: 500,
            fontSize: 20,
            letterSpacing: "-0.02em",
            color: "#4F2C1D",
          }}
        >
          Front view
        </h1>
        <span style={{ fontSize: 12.5, color: "#7A6A60" }}>Neutral expression</span>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

      {/* Live Camera View */}
      {mode === "live" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
          <LiveCamera onShot={onShot} onProblem={onProblem} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              type="button"
              onClick={openPicker}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 13,
                color: "#7A6A60",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Or pick an existing photo from gallery
            </button>
          </div>
        </div>
      )}

      {/* Preview or Choose View */}
      {mode !== "live" && (
        <>
          <div
            style={{
              position: "relative",
              border: "1px solid #DDD9D3",
              borderRadius: "6px 40px 6px 6px",
              background: "#F1F1F1",
              overflow: "hidden",
              aspectRatio: "350/440",
              display: "grid",
              placeItems: "center",
            }}
          >
            {pending ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pending.url}
                alt="Your selfie"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <svg
                viewBox="0 0 350 500"
                role="img"
                aria-label="Camera view with an oval face guide"
                style={{ width: "100%", height: "100%", display: "block" }}
              >
                <g stroke="#E6E0D8" strokeWidth="1">
                  <line x1="175" y1="0" x2="175" y2="500" />
                  <line x1="0" y1="236" x2="350" y2="236" />
                </g>
                <path
                  d="M175 90 C240 90 266 144 266 214 C266 282 250 332 216 364 C198 380 186 388 175 388 C164 388 152 380 134 364 C100 332 84 282 84 214 C84 144 110 90 175 90 Z"
                  fill="none"
                  stroke="#1B1815"
                  strokeWidth="1.4"
                  strokeDasharray="5 5"
                />
                <g stroke="#1B1815" strokeWidth="1.2" fill="none" strokeLinecap="round">
                  <path d="M40 70 V40 H70" />
                  <path d="M280 40 H310 V70" />
                  <path d="M310 410 V440 H280" />
                  <path d="M70 440 H40 V410" />
                </g>
                <g stroke="#4F2C1D" strokeWidth="1">
                  <line x1="120" y1="200" x2="150" y2="200" />
                  <line x1="200" y1="200" x2="230" y2="200" />
                </g>
                <g fontFamily="var(--font-body)" fontSize="9.5" fill="#7A6A60">
                  <text x="40" y="472">
                    DISTANCE 42 CM
                  </text>
                  <text x="236" y="472">
                    TILT 2°
                  </text>
                  <text x="236" y="196">
                    EYE LINE
                  </text>
                </g>
              </svg>
            )}

            <canvas
              ref={overlayRef}
              hidden={!det}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            />
          </div>

          {/* Quality indicators */}
          {report && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                border: "1px solid #ECECEA",
                borderRadius: 10,
                fontSize: 12.5,
              }}
            >
              <div style={{ padding: "9px 10px", borderRight: "1px solid #ECECEA" }}>
                <div style={{ color: "#8A8A85" }}>Light</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: report.checks.find((c) => c.id === "lighting")?.ok
                        ? "#2F7D4F"
                        : "#E0A526",
                    }}
                  />
                  {report.checks.find((c) => c.id === "lighting")?.ok ? "Even" : "Check light"}
                </div>
              </div>
              <div style={{ padding: "9px 10px", borderRight: "1px solid #ECECEA" }}>
                <div style={{ color: "#8A8A85" }}>Framing</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background:
                        report.checks.find((c) => c.id === "distance")?.ok &&
                        report.checks.find((c) => c.id === "centred")?.ok
                          ? "#2F7D4F"
                          : "#E0A526",
                    }}
                  />
                  {report.checks.find((c) => c.id === "distance")?.ok &&
                  report.checks.find((c) => c.id === "centred")?.ok
                    ? "Centred"
                    : "Framing"}
                </div>
              </div>
              <div style={{ padding: "9px 10px" }}>
                <div style={{ color: "#8A8A85" }}>Angle</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background:
                        report.checks.find((c) => c.id === "straight")?.ok &&
                        report.checks.find((c) => c.id === "level")?.ok
                          ? "#2F7D4F"
                          : "#E0A526",
                    }}
                  />
                  {report.checks.find((c) => c.id === "straight")?.ok &&
                  report.checks.find((c) => c.id === "level")?.ok
                    ? "Look ahead"
                    : "Level head"}
                </div>
              </div>
            </div>
          )}

          {msg && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                background: msg.bad ? "#FDF2F0" : "#FBF8F3",
                color: msg.bad ? "#C62828" : "#5C4F47",
                border: msg.bad ? "1px solid #FFCDD2" : "1px solid #DDD9D3",
              }}
            >
              {msg.text}
            </div>
          )}

          {busy && (
            <div style={{ fontSize: 13, color: "#7A6A60", textAlign: "center" }}>
              Analysing facial landmarks…
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
            {mode === "choose" && (
              <>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setMsg(null);
                    setMode("live");
                  }}
                  disabled={model !== "ready"}
                  style={{ minHeight: 52 }}
                >
                  Open live camera
                </button>
                <button
                  type="button"
                  onClick={openPicker}
                  className="btn-secondary"
                  style={{ minHeight: 50 }}
                >
                  Upload a photo
                </button>
              </>
            )}

            {mode === "preview" && canAnalyse && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  handedOff.current = true;
                  onAnalyse({
                    img: pending!.img,
                    url: pending!.url,
                    det: det!,
                    m: measures ?? undefined,
                  });
                }}
                style={{ minHeight: 52 }}
              >
                {report?.blocking || report?.failed ? "Analyse anyway" : "Continue to analysis"}
              </button>
            )}

            {mode === "preview" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setMsg(null);
                    setMode("live");
                  }}
                  className="btn-secondary"
                  style={{ flex: 1, padding: "10px 0", fontSize: 14 }}
                >
                  Retake photo
                </button>
                <button
                  type="button"
                  onClick={openPicker}
                  className="btn-secondary"
                  style={{ flex: 1, padding: "10px 0", fontSize: 14 }}
                >
                  Pick another
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
