"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detectFast } from "@/lib/detector";
import type { Detection } from "@/lib/detector";
import { liveInstruction, metrics, isFemale, headYawDeg } from "@/lib/quality";
import { LIVE, LIVE_Q } from "@/lib/capture.config";
import { measureDetection } from "@/lib/faceShape";
import { drawLiveScannerHud } from "@/lib/overlay";

export type CameraProblem = "denied" | "nocamera" | "unsupported" | "insecure" | "inapp" | "female";
export interface LiveShot {
  canvas: HTMLCanvasElement;
  det: Detection;
  frames: Detection[];
}

type Phase = "intro" | "starting" | "tracking" | "capturing" | "sweep";
type TurnCue = "none" | "left" | "right" | "center";

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
  c.getContext("2d", { willReadFrequently: true })!.drawImage(video, 0, 0); // un-mirrored for face analysis
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
  const hudCanvasRef = useRef<HTMLCanvasElement>(null);
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
  const [sweepPct, setSweepPct] = useState(0);
  const [turnCue, setTurnCue] = useState<TurnCue>("none");
  const [ringCoverage, setRingCoverage] = useState<{ top: number; left: number; right: number }>({
    top: 0,
    left: 0,
    right: 0,
  });
  const [telemetry, setTelemetry] = useState<{
    r: string;
    j: string;
    g: string;
    yaw: string;
    pts: number;
    frames: number;
  } | null>(null);

  const stop = useCallback(() => {
    runId.current++;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  async function captureFrames(video: HTMLVideoElement, id: number): Promise<{ shot: LiveShot; frontYaw: number } | null> {
    const shots: { c: HTMLCanvasElement; d: Detection; score: number; yaw: number }[] = [];
    for (let i = 0; i < LIVE.frames * 2 && shots.length < LIVE.frames; i++) {
      if (runId.current !== id) return null;
      const c = grab(video);
      const d = await detectFast(c, shots.length === 0);
      if (d && hudCanvasRef.current) {
        drawLiveScannerHud(hudCanvasRef.current, video, d, true, "capturing");
      }
      if (d && liveInstruction(c, d) === null) {
        const m = metrics(c, d);
        shots.push({
          c,
          d,
          score: m.yaw * 100 + m.roll + m.mouth * 100,
          yaw: headYawDeg(d) ?? 0,
        });
      }
      setRingCoverage({ top: Math.min(1, shots.length / LIVE.frames), left: 0, right: 0 });
      await sleep(45);
    }
    if (shots.length < Math.ceil(LIVE.frames / 2)) return null;
    const best = shots.reduce((a, b) => (b.score < a.score ? b : a));
    const yaws = shots.map((s) => s.yaw).sort((a, b) => a - b);
    const frontYaw = yaws[Math.floor(yaws.length / 2)] ?? 0;
    return {
      frontYaw,
      shot: {
        canvas: best.c,
        det: { ...best.d, femaleP: shots[0].d.femaleP },
        frames: shots.map((s) => s.d),
      },
    };
  }

  /** Guided Lenskart-style multi-angle 3D sweep: turn left, turn right, return to center. */
  async function guided3DSweep(
    video: HTMLVideoElement,
    id: number,
    frontYaw: number
  ): Promise<void> {
    let leftCount = 0;
    let rightCount = 0;
    let firstDir: "left" | "right" | null = null;
    let stage: "turn1" | "turn2" | "center" = "turn1";
    let stageStart = performance.now();
    const minNeeded = LIVE.sideFrames;
    let centerCount = 0;

    setPhase("sweep");
    setTurnCue("left");

    while (runId.current === id) {
      if (manual.current && leftCount + rightCount >= 2) break;
      const elapsed = performance.now() - stageStart;

      const sd = await detectFast(video, false);
      if (runId.current !== id) break;

      if (sd) {
        const sm = metrics(video, sd);
        const yaw = headYawDeg(sd) ?? frontYaw;
        const dyaw = yaw - frontYaw;
        const cleanExpr = sm.mouth < LIVE_Q.mouthMax && sm.smile < LIVE_Q.smileMax && sm.roll < 14;

        if (hudCanvasRef.current) {
          drawLiveScannerHud(hudCanvasRef.current, video, sd, cleanExpr, "sweep");
        }

        if (stage === "turn1") {
          if (Math.abs(dyaw) >= LIVE.turnDeg && cleanExpr) {
            if (!firstDir) firstDir = dyaw < 0 ? "left" : "right";
            if ((firstDir === "left" && dyaw <= -LIVE.turnDeg) || (firstDir === "right" && dyaw >= LIVE.turnDeg)) {
              if (firstDir === "left") leftCount++;
              else rightCount++;
            }
          }
          const done1 = firstDir === "left" ? leftCount : rightCount;
          if (done1 >= minNeeded || elapsed > LIVE.turnTimeoutMs) {
            stage = "turn2";
            stageStart = performance.now();
            setTurnCue(firstDir === "right" ? "left" : "right");
          }
        } else if (stage === "turn2") {
          const oppDir = firstDir === "right" ? "left" : "right";
          const hitOpp = oppDir === "left" ? dyaw <= -LIVE.turnDeg : dyaw >= LIVE.turnDeg;
          if (hitOpp && cleanExpr) {
            if (oppDir === "left") leftCount++;
            else rightCount++;
          }
          const done2 = oppDir === "left" ? leftCount : rightCount;
          if (done2 >= minNeeded || elapsed > LIVE.turnTimeoutMs) {
            stage = "center";
            stageStart = performance.now();
            setTurnCue("center");
          }
        } else {
          if (Math.abs(dyaw) <= 8 && cleanExpr) {
            centerCount++;
          }
          if (centerCount >= 3 || elapsed > 2500) break;
        }

        const lPct = Math.min(1, leftCount / minNeeded);
        const rPct = Math.min(1, rightCount / minNeeded);
        setRingCoverage({ top: 1, left: lPct, right: rPct });
        const overall = Math.round(((1 + lPct + rPct) / 3) * 100);
        setSweepPct(overall);

        const mm = measureDetection(sd);
        const yawInt = Math.round(yaw);
        setTelemetry({
          r: mm.R.toFixed(2),
          j: mm.J.toFixed(2),
          g: `${Math.round(mm.G)}°`,
          yaw: `${yawInt >= 0 ? "+" : ""}${yawInt}°`,
          pts: sd.P478 ? 478 : 68,
          frames: leftCount + rightCount,
        });

        if (!cleanExpr && sm.mouth >= LIVE_Q.mouthMax) {
          setHint("Keep your mouth closed while turning");
        } else if (stage === "turn1") {
          setHint("Step 2/3 · Turn slowly left (~15°)");
        } else if (stage === "turn2") {
          setHint(
            firstDir === "right"
              ? "Step 3/3 · Now turn slowly the other way"
              : "Step 3/3 · Now turn slowly right (~15°)"
          );
        } else {
          setHint("Look back at the centre…");
        }
      } else {
        setHint("Keep your face in view while turning");
        if (elapsed > LIVE.turnTimeoutMs) break;
      }

      await sleep(45);
    }

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
      setTurnCue("none");
      setRingCoverage({ top: 0, left: 0, right: 0 });

      while (runId.current === id) {
        await nextFrame();
        if (runId.current !== id) return;
        if (video.readyState < 2 || video.videoWidth === 0) continue;
        frame++;
        const withGender = frame % 8 === 0;
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

        if (d && frame % 2 === 0) {
          const m = measureDetection(d);
          const yawDeg = d.pose ? Math.round(d.pose.yaw) : 0;
          setTelemetry({
            r: m.R.toFixed(2),
            j: m.J.toFixed(2),
            g: `${Math.round(m.G)}°`,
            yaw: `${yawDeg >= 0 ? "+" : ""}${yawDeg}°`,
            pts: d.P478 ? 478 : 68,
            frames: 0,
          });
        } else if (!d) {
          setTelemetry(null);
        }

        let ins = liveInstruction(video, d);
        if (!ins && d && !manual.current) {
          const cx = (d.box.x + d.box.width / 2) / video.videoWidth;
          if (Math.abs(cx - lastCx) > 0.04) ins = "Hold still";
          lastCx = cx;
        }

        if (hudCanvasRef.current) {
          drawLiveScannerHud(hudCanvasRef.current, video, d, Boolean(d && !ins), "tracking");
        }

        const now = performance.now();
        if (ins) {
          manual.current = false;
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
        if (remain > 0 && !manual.current) {
          setCount(Math.ceil(remain / 1000));
          setHint("Step 1/3 · Straight ahead · Hold still…");
        } else {
          setCount(null);
          setPhase("capturing");
          setHint("Step 1/3 · Locking front 3D mesh…");
          const captured = await captureFrames(video, id);
          if (runId.current !== id) return;
          if (!captured) {
            manual.current = false;
            okSince = 0;
            setPhase("tracking");
            continue;
          }
          await guided3DSweep(video, id, captured.frontYaw);
          if (runId.current !== id) return;
          stop();
          onShotRef.current(captured.shot);
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

        {/* Real-time 3D Biometric AR Mesh & Caliper Canvas */}
        <canvas
          ref={hudCanvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
            pointerEvents: "none",
          }}
        />

        {/* Lenskart-style Top Biometric Telemetry HUD */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.06em",
              color: green ? "#2ECF7F" : "#FFFFFF",
              background: "rgba(17, 17, 17, 0.72)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              padding: "4px 9px",
              borderRadius: 6,
              border: `1px solid ${green ? "rgba(46, 207, 127, 0.45)" : "rgba(255, 255, 255, 0.18)"}`,
            }}
          >
            {telemetry
              ? telemetry.frames > 0
                ? `${telemetry.frames} 3D FRAMES · ${telemetry.yaw}`
                : `${telemetry.pts} PT 3D MESH · ${telemetry.yaw}`
              : "3D CRANIOFACIAL SCANNER"}
          </span>

          {telemetry && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.04em",
                color: "#E0A526",
                background: "rgba(17, 17, 17, 0.72)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                padding: "4px 9px",
                borderRadius: 6,
                border: "1px solid rgba(224, 165, 38, 0.35)",
              }}
            >
              L:W {telemetry.r} · JAW {telemetry.j} · {telemetry.g}
            </span>
          )}
        </div>

        {/* Wireframe Guides Overlay + Lenskart-style 36-segment 3D Coverage Ring */}
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
              border: `2px dashed ${green ? "#2ECF7F" : "#111111"}`,
              borderRadius: "50%",
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.22)",
              transition: "border-color 0.2s ease",
              position: "relative",
              display: "grid",
              placeItems: "center",
            }}
          >
            {/* 36-tick segmented 3D sweep coverage ring around oval */}
            <svg
              viewBox="0 0 240 310"
              style={{
                position: "absolute",
                inset: "-10px",
                width: "calc(100% + 20px)",
                height: "calc(100% + 20px)",
                overflow: "visible",
              }}
            >
              {Array.from({ length: 36 }).map((_, i) => {
                // Angle from top clockwise: 0 = top center
                const aDeg = i * 10 - 90;
                const rad = (aDeg * Math.PI) / 180;
                const r1x = 114, r1y = 148, r2x = 123, r2y = 160;
                const x1 = 120 + Math.cos(rad) * r1x;
                const y1 = 155 + Math.sin(rad) * r1y;
                const x2 = 120 + Math.cos(rad) * r2x;
                const y2 = 155 + Math.sin(rad) * r2y;

                // Top band: i in [33..35, 0..3], Right band: [4..17], Left band: [19..32]
                let active = false;
                if (i <= 3 || i >= 33) {
                  active = ringCoverage.top > 0.15;
                } else if (i >= 4 && i <= 17) {
                  const pos = (i - 4) / 13;
                  active = pos < ringCoverage.right;
                } else if (i >= 19 && i <= 32) {
                  const pos = (32 - i) / 13;
                  active = pos < ringCoverage.left;
                } else {
                  active = ringCoverage.left >= 0.9 && ringCoverage.right >= 0.9;
                }

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={active ? "#2ECF7F" : "rgba(255,255,255,0.28)"}
                    strokeWidth={active ? 3 : 1.6}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            {/* Directional Left / Right Turn Arrows during 3D sweep */}
            {turnCue === "left" && (
              <div
                style={{
                  position: "absolute",
                  left: -18,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(17,17,17,0.82)",
                  color: "#2ECF7F",
                  borderRadius: 999,
                  width: 34,
                  height: 34,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  border: "1px solid rgba(46,207,127,0.6)",
                }}
              >
                ←
              </div>
            )}
            {turnCue === "right" && (
              <div
                style={{
                  position: "absolute",
                  right: -18,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(17,17,17,0.82)",
                  color: "#2ECF7F",
                  borderRadius: 999,
                  width: 34,
                  height: 34,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  border: "1px solid rgba(46,207,127,0.6)",
                }}
              >
                →
              </div>
            )}
          </div>

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

        {/* Dynamic Instruction Pill + 3D Sweep Progress */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255, 255, 255, 0.96)",
            border: "1px solid #ECECEA",
            borderRadius: 999,
            padding: "6px 16px",
            fontSize: 12.5,
            color: green ? "#2F7D4F" : "#111111",
            fontWeight: 500,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>{phase === "starting" ? "Starting 3D scanner…" : hint}</span>
          {phase === "sweep" && (
            <div
              style={{
                width: 140,
                height: 3,
                background: "#ECECEA",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${sweepPct}%`,
                  height: "100%",
                  background: "#2F7D4F",
                  transition: "width 0.08s linear",
                }}
              />
            </div>
          )}
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
