"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detectFast, averageDetections } from "@/lib/detector";
import type { Detection } from "@/lib/detector";
import { liveInstruction, metrics, isFemale } from "@/lib/quality";
import { LIVE } from "@/lib/capture.config";
import { measure } from "@/lib/faceShape";
import type { Measures } from "@/lib/faceShape";

export type CameraProblem = "denied" | "nocamera" | "unsupported" | "insecure" | "inapp" | "female";
export interface LiveShot { canvas: HTMLCanvasElement; det: Detection; frames: Measures[] }

type Phase = "intro" | "starting" | "tracking" | "capturing" | "sweep";

export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Line\/|Snapchat|musical_ly|Twitter/i.test(navigator.userAgent);
}

export function cameraSupport(): CameraProblem | null {
  if (isInAppBrowser()) return "inapp";
  if (typeof window !== "undefined" && !window.isSecureContext) return "insecure";
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported";
  return null;
}

const nextFrame = () => new Promise(r => requestAnimationFrame(() => r(null)));
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function grab(video: HTMLVideoElement) {
  const c = document.createElement("canvas");
  c.width = video.videoWidth; c.height = video.videoHeight;
  c.getContext("2d")!.drawImage(video, 0, 0); // un-mirrored: the analysis sees the real face
  return c;
}

export default function LiveCamera({ onShot, onProblem }: { onShot: (s: LiveShot) => void; onProblem: (p: CameraProblem) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runId = useRef(0);
  const manual = useRef(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [hint, setHint] = useState("Fit your face in the oval");
  const [green, setGreen] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  const stop = useCallback(() => {
    runId.current++;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);
  useEffect(() => stop, [stop]);

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
    return { canvas: best.c, det: averageDetections(shots.map(s => s.d)), frames: shots.map(s => measure(s.d.P)) };
  }

  async function run() {
    const id = ++runId.current;
    const video = videoRef.current!;
    let okSince = 0, lastCx = 0, femaleVotes: number[] = [], frame = 0;
    setPhase("tracking");
    while (runId.current === id) {
      await nextFrame();
      if (video.readyState < 2) continue;
      frame++;
      const withGender = frame % 5 === 0;
      const d = await detectFast(video, withGender);
      if (runId.current !== id) return;

      if (d && withGender) {
        femaleVotes = [...femaleVotes.slice(-5), d.femaleP];
        const avg = femaleVotes.reduce((s, v) => s + v, 0) / femaleVotes.length;
        if (femaleVotes.length >= 3 && isFemale({ ...d, femaleP: avg })) { stop(); onProblem("female"); return; }
      }

      let ins = liveInstruction(video, d);
      if (!ins && d) {
        const cx = (d.box.x + d.box.width / 2) / video.videoWidth;
        if (Math.abs(cx - lastCx) > 0.04) ins = "Hold still";
        lastCx = cx;
      }
      const now = performance.now();
      if (ins && !manual.current) { okSince = 0; setGreen(false); setCount(null); setHint(ins); continue; }

      okSince ||= now;
      setGreen(true); setHint(manual.current ? "Hold still…" : "Perfect, hold still");
      const total = manual.current ? 0 : LIVE.holdMs + LIVE.countdown * 1000;
      const left = Math.ceil((total - (now - okSince)) / 1000);
      setCount(left > 0 ? left : null);
      if (now - okSince < total) continue;

      // Capture: average several frames' landmarks for a steadier measurement.
      setPhase("capturing"); setCount(null); setHint("Capturing…");
      const shot = await captureFrames(video, id);
      if (runId.current !== id) return;
      if (!shot) { manual.current = false; okSince = 0; setPhase("tracking"); setHint("Hold still and try again"); continue; }
      if (isFemale(shot.det)) { stop(); onProblem("female"); return; }

      // Sweep: mostly for the experience (and reels).
      setPhase("sweep");
      setHint("Turn slowly left…");
      await sleep(LIVE.sweepMs / 2);
      if (runId.current !== id) return;
      setHint("…now right");
      await sleep(LIVE.sweepMs / 2);
      if (runId.current !== id) return;
      stop();
      onShot(shot);
      return;
    }
  }

  async function start() {
    const problem = cameraSupport();
    if (problem) return onProblem(problem);
    setPhase("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();
      run();
    } catch (e) {
      stop();
      const name = e instanceof DOMException ? e.name : "";
      onProblem(name === "NotAllowedError" || name === "SecurityError" ? "denied" : name === "NotFoundError" || name === "OverconstrainedError" ? "nocamera" : "unsupported");
    }
  }

  const live = phase !== "intro";
  return (
    <div className="stack">
      <div className={`frame cam${green ? " ok" : ""}`}>
        <video ref={videoRef} playsInline muted autoPlay hidden={!live} className="mirror" />
        <div className="oval" />
        {count !== null && <div className="count" aria-live="assertive">{count}</div>}
        {(phase === "sweep" || phase === "capturing") && <div className="scanline" />}
        {live && <p className="hint cam-hint" aria-live="polite">{phase === "starting" ? "Starting camera…" : hint}</p>}
        {!live && <p className="hint">Fit your face in the oval</p>}
      </div>
      {phase === "intro" && (
        <>
          <p className="small muted">We&apos;ll ask to use your front camera. Your face is measured on this phone; the video is never recorded or uploaded.</p>
          <button className="primary" onClick={start}>Start camera</button>
        </>
      )}
      {phase === "tracking" && (
        <button className="shutter" aria-label="Take photo now" onClick={() => { manual.current = true; }}>
          <span />
        </button>
      )}
    </div>
  );
}
