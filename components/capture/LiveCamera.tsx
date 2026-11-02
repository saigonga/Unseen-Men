"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detectFast, averageDetections } from "@/lib/detector";
import type { Detection } from "@/lib/detector";
import { liveInstruction, metrics, isFemale } from "@/lib/quality";
import { LIVE } from "@/lib/capture.config";
import { measure } from "@/lib/faceShape";
import type { Measures } from "@/lib/faceShape";

export type CameraProblem = "denied" | "nocamera" | "unsupported" | "insecure" | "inapp" | "female";
export interface LiveShot {
  canvas: HTMLCanvasElement;
  det: Detection;
  frames: Measures[];
}

type Phase = "intro" | "starting" | "tracking" | "capturing" | "sweep";

export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Line\/|Snapchat|musical_ly|Twitter/i.test(
    navigator.userAgent
  );
}

export function cameraSupport(): CameraProblem | null {
  if (isInAppBrowser()) return "inapp";
  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "0.0.0.0";
    if (!window.isSecureContext && !isLocal) return "insecure";
  }
  const hasGetUserMedia =
    typeof navigator !== "undefined" &&
    !!(
      navigator.mediaDevices?.getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia ||
      (navigator as any).getUserMedia
    );
  if (!hasGetUserMedia) return "unsupported";
  return null;
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function grab(video: HTMLVideoElement) {
  const c = document.createElement("canvas");
  c.width = video.videoWidth;
  c.height = video.videoHeight;
  c.getContext("2d")!.drawImage(video, 0, 0); // un-mirrored for face analysis
  return c;
}

export default function LiveCamera({
  onShot,
  onProblem,
}: {
  onShot: (s: LiveShot) => void;
  onProblem: (p: CameraProblem) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runId = useRef(0);
  const manual = useRef(false);
  const onShotRef = useRef(onShot);
  const onProblemRef = useRef(onProblem);
  onShotRef.current = onShot;
  onProblemRef.current = onProblem;

  const [phase, setPhase] = useState<Phase>("starting");
  const [hint, setHint] = useState("Fit your face in the oval");
  const [green, setGreen] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  const stop = useCallback(() => {
    runId.current++;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  async function captureFrames(video: HTMLVideoElement, id: number): Promise<LiveShot | null> {
    const shots: { c: HTMLCanvasElement; d: Detection; score: number }[] = [];
    for (let i = 0; i < LIVE.frames * 2 && shots.length < LIVE.frames; i++) {
      if (runId.current !== id) return null;
      const c = grab(video);
      const d = await detectFast(c, true);
      if (d && (manual.current || liveInstruction(c, d) === null)) {
        const m = metrics(c, d);
        shots.push({ c, d, score: m.yaw * 100 + m.roll + m.mouth * 100 });
      }
      await sleep(60);
    }
    if (shots.length < Math.ceil(LIVE.frames / 2)) return null;
    const best = shots.reduce((a, b) => (b.score < a.score ? b : a));
    return {
      canvas: best.c,
      det: averageDetections(shots.map((s) => s.d)),
      frames: shots.map((s) => measure(s.d.P)),
    };
  }

  const run = useCallback(
    async (id: number) => {
      const video = videoRef.current;
      if (!video) return;
      let okSince = 0,
        lastCx = 0,
        femaleVotes: number[] = [],
        frame = 0;
      setPhase("tracking");

      while (runId.current === id) {
        await nextFrame();
        if (runId.current !== id) return;
        if (video.readyState < 2 || video.videoWidth === 0) continue;
        frame++;
        const withGender = frame % 5 === 0;
        const d = await detectFast(video, withGender);
        if (runId.current !== id) return;

        if (d && withGender) {
          femaleVotes = [...femaleVotes.slice(-5), d.femaleP];
          const avg = femaleVotes.reduce((s, v) => s + v, 0) / femaleVotes.length;
          if (femaleVotes.length >= 3 && isFemale({ ...d, femaleP: avg })) {
            stop();
            onProblemRef.current("female");
            return;
          }
        }

        let ins = liveInstruction(video, d);
        if (!ins && d) {
          const cx = (d.box.x + d.box.width / 2) / video.videoWidth;
          if (Math.abs(cx - lastCx) > 0.04) ins = "Hold still";
          lastCx = cx;
        }
        const now = performance.now();
        if (ins && !manual.current) {
          okSince = 0;
          setGreen(false);
          setCount(null);
          setHint(ins);
          continue;
        }

        // Everything passes
        if (!okSince) okSince = now;
        const elapsed = now - okSince;
        setGreen(true);

        const remain = Math.max(0, LIVE.holdMs - elapsed);
        if (remain > 0) {
          setCount(Math.ceil(remain / 1000));
          setHint("Hold still…");
        } else {
          setCount(null);
          setPhase("capturing");
          setHint("Capturing…");
          const shot = await captureFrames(video, id);
          if (runId.current !== id) return;
          if (!shot) {
            okSince = 0;
            setPhase("tracking");
            continue;
          }
          setPhase("sweep");
          setHint("Scanning jawline confidence…");
          await sleep(LIVE.sweepMs);
          if (runId.current !== id) return;
          stop();
          onShotRef.current(shot);
          return;
        }
      }
    },
    [stop]
  );

  const start = useCallback(async () => {
    const problem = cameraSupport();
    if (problem) return onProblemRef.current(problem);

    const id = ++runId.current;
    setPhase("starting");

    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 960 } },
            audio: false,
          });
        } catch {
          // Fallback to basic video for desktop webcams
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      } else {
        const legacyGUM =
          (navigator as any).webkitGetUserMedia ||
          (navigator as any).mozGetUserMedia ||
          (navigator as any).getUserMedia;
        if (legacyGUM) {
          stream = await new Promise<MediaStream>((res, rej) =>
            legacyGUM.call(navigator, { video: true }, res, rej)
          );
        } else {
          throw new DOMException("Browser does not support camera API", "NotSupportedError");
        }
      }

      // If unmounted or a newer start() was triggered while awaiting getUserMedia, clean up and exit
      if (runId.current !== id) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }

      if (!stream) {
        throw new DOMException("Could not acquire video stream", "NotFoundError");
      }

      const v = videoRef.current;
      if (!v) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      // Stop any previous stream before attaching the new one
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = stream;
      v.srcObject = stream;

      try {
        await v.play();
      } catch (playErr: any) {
        if (runId.current !== id) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        // Ignore AbortError when autoPlay is already handling playback
        if (playErr?.name !== "AbortError") {
          throw playErr;
        }
      }

      if (runId.current !== id) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      run(id);
    } catch (e: any) {
      if (runId.current !== id) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }
      stop();
      console.warn("Live camera start failed:", e);
      const name = e instanceof DOMException ? e.name : e?.name || "";
      onProblemRef.current(
        name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError"
          ? "denied"
          : name === "NotFoundError" || name === "DevicesNotFoundError"
          ? "nocamera"
          : "unsupported"
      );
    }
  }, [run, stop]);

  useEffect(() => {
    start();
    return () => {
      stop();
    };
  }, [start, stop]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
      {/* Video Viewport Frame */}
      <div
        style={{
          position: "relative",
          border: green ? "2px solid #2F7D4F" : "1px solid #ECECEA",
          borderRadius: 14,
          background: "#F4F4F2",
          overflow: "hidden",
          aspectRatio: "350/450",
          display: "grid",
          placeItems: "center",
          transition: "border-color 0.2s ease",
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)", // Mirrored preview
          }}
        />

        {/* Wireframe Guides Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            display: "grid",
            placeItems: "center",
          }}
        >
          {/* Oval Guide */}
          <div
            style={{
              width: "66%",
              aspectRatio: "3/4",
              border: `2px dashed ${green ? "#2F7D4F" : "#111111"}`,
              borderRadius: "50%",
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.22)",
              transition: "border-color 0.2s ease",
            }}
          />

          {/* Crosshair Lines */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: 1,
              background: "#E2E2DF",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "47%",
              height: 1,
              background: "#E2E2DF",
            }}
          />

          {/* Corner brackets */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              width: 24,
              height: 24,
              borderTop: "2px solid #111111",
              borderLeft: "2px solid #111111",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 24,
              height: 24,
              borderTop: "2px solid #111111",
              borderRight: "2px solid #111111",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              width: 24,
              height: 24,
              borderBottom: "2px solid #111111",
              borderLeft: "2px solid #111111",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              width: 24,
              height: 24,
              borderBottom: "2px solid #111111",
              borderRight: "2px solid #111111",
            }}
          />
        </div>

        {/* Countdown */}
        {count !== null && (
          <div
            style={{
              position: "absolute",
              zIndex: 10,
              fontFamily: "var(--font-heading)",
              fontSize: 84,
              fontWeight: 700,
              color: "#FFFFFF",
              textShadow: "0 2px 20px rgba(0,0,0,0.8)",
            }}
          >
            {count}
          </div>
        )}

        {(phase === "sweep" || phase === "capturing") && <div className="scanline" />}

        {/* Dynamic Instruction Pill */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#FFFFFF",
            border: "1px solid #ECECEA",
            borderRadius: 999,
            padding: "6px 16px",
            fontSize: 12.5,
            color: green ? "#2F7D4F" : "#111111",
            fontWeight: 500,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            zIndex: 10,
          }}
        >
          {phase === "starting" ? "Starting camera…" : hint}
        </div>
      </div>

      {/* Real-time Quality Indicators */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          border: "1px solid #ECECEA",
          borderRadius: 10,
          fontSize: 12.5,
          background: "#FFFFFF",
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
                background: green ? "#2F7D4F" : "#E0A526",
              }}
            />
            {green ? "Even" : "Checking"}
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
                background: green ? "#2F7D4F" : "#E0A526",
              }}
            />
            {green ? "Centred" : "Align face"}
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
                background: green ? "#2F7D4F" : "#E0A526",
              }}
            />
            {green ? "Look ahead" : "Level head"}
          </div>
        </div>
      </div>

      {/* Shutter & Instructions Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "8px 4px",
        }}
      >
        <span style={{ color: "#8A8A85", fontSize: 12, maxWidth: 110 }}>
          Glasses and caps off
        </span>

        <button
          type="button"
          aria-label="Take photo"
          onClick={() => {
            manual.current = true;
          }}
          style={{
            width: 68,
            height: 68,
            borderRadius: 999,
            border: "1px solid #111111",
            background: "#FFFFFF",
            padding: 5,
            cursor: "pointer",
          }}
        >
          <span
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              borderRadius: 999,
              background: "#111111",
            }}
          />
        </button>

        <span style={{ color: "#8A8A85", fontSize: 12, maxWidth: 110, textAlign: "right" }}>
          Captures when all checks pass
        </span>
      </div>
    </div>
  );
}
