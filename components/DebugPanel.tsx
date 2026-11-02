"use client";

import { useEffect, useRef, useState } from "react";
import type { Detection } from "@/lib/detector";
import type { FaceResult, Measures, ZScores } from "@/lib/faceShape";
import { measure, zScores, shapeScores } from "@/lib/faceShape";
import type { RobustMeasures } from "@/lib/robust";
import { drawOverlay } from "@/lib/overlay";
import { isMediaPipeReady } from "@/lib/mediapipe";
import { SHAPES } from "@/lib/content";
import type { ShapeKey } from "@/lib/content";

interface Props {
  img: HTMLImageElement;
  det: Detection;
  result: FaceResult;
  robust?: RobustMeasures | null;
  beard: "none" | "stubble" | "full" | null;
}

export default function DebugPanel({ img, det, result, robust, beard }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [show478, setShow478] = useState(true);

  useEffect(() => {
    if (canvasRef.current) drawOverlay(canvasRef.current, img, det, false, show478);
  }, [img, det, show478]);

  const m: Measures = robust?.m ?? measure(det.P);
  const z: ZScores = zScores(m, beard);
  const scores = shapeScores(z);
  const sorted = (Object.entries(scores) as [ShapeKey, number][]).sort((a, b) => b[1] - a[1]);

  const fmt = (v: number) => v.toFixed(4);
  const fmtZ = (v: number) => (v >= 0 ? "+" : "") + v.toFixed(3);

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, background: "#111", color: "#eee", fontFamily: "monospace", fontSize: 12, overflow: "auto", zIndex: 9999, padding: 12, borderLeft: "2px solid #333" }}>
      <h3 style={{ margin: "0 0 8px", color: "#c9a46a" }}>Debug Panel</h3>

      <div style={{ marginBottom: 8, color: "#888" }}>
        Engine: <b style={{ color: "#0f0" }}>{det.P478 ? "MediaPipe 478" : "face-api 68"}</b>
        {" | "}MediaPipe ready: {isMediaPipeReady() ? "yes" : "no"}
      </div>

      {det.P478 && (
        <label style={{ display: "block", marginBottom: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={show478} onChange={e => setShow478(e.target.checked)} /> Show 478 mesh
        </label>
      )}

      <canvas ref={canvasRef} style={{ width: "100%", marginBottom: 8, borderRadius: 4 }} />

      {det.pose && (
        <div style={{ marginBottom: 8 }}>
          <b style={{ color: "#c9a46a" }}>Head Pose (native)</b>
          <div>yaw: {det.pose.yaw.toFixed(1)}° | pitch: {det.pose.pitch.toFixed(1)}° | roll: {det.pose.roll.toFixed(1)}°</div>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <b style={{ color: "#c9a46a" }}>Raw Measurements</b>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid #444" }}><th style={{ textAlign: "left" }}>Key</th><th>Value</th><th>z-score</th></tr></thead>
          <tbody>
            {(["R", "J", "F", "K", "G"] as const).map(k => (
              <tr key={k} style={{ borderBottom: "1px solid #222" }}>
                <td>{k}</td>
                <td style={{ textAlign: "right" }}>{fmt(m[k])}</td>
                <td style={{ textAlign: "right", color: Math.abs(z[k]) > 1 ? "#f88" : "#8f8" }}>{fmtZ(z[k])}</td>
              </tr>
            ))}
            <tr style={{ borderBottom: "1px solid #222" }}>
              <td>A</td><td style={{ textAlign: "right" }}>—</td>
              <td style={{ textAlign: "right", color: Math.abs(z.A) > 1 ? "#f88" : "#8f8" }}>{fmtZ(z.A)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {robust && (
        <div style={{ marginBottom: 8 }}>
          <b style={{ color: "#c9a46a" }}>Robust (n={robust.n})</b>
          <div style={{ color: "#888" }}>
            Spread: {(["R", "J", "F", "K", "G"] as const).map(k => `${k}=${robust.spread[k].toFixed(4)}`).join(" ")}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <b style={{ color: "#c9a46a" }}>Shape Scores (raw → softmax)</b>
        {sorted.map(([key, score]) => {
          const pct = result.ranked.find(r => r[0] === key)?.[1] ?? 0;
          return (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid #222", color: key === result.key ? "#c9a46a" : "#aaa" }}>
              <span>{key === result.key ? "► " : "  "}{key}</span>
              <span>{score.toFixed(3)} → {(pct * 100).toFixed(1)}%</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 8, color: "#888" }}>
        femaleP: {det.femaleP.toFixed(3)} | landmarks: {det.P.length} | 478: {det.P478?.length ?? "n/a"}
      </div>

      <div style={{ color: "#c9a46a", fontWeight: "bold" }}>
        Result: {result.key} ({SHAPES[result.key].name})
        {result.lean && ` — leaning ${result.lean}`}
      </div>
    </div>
  );
}
