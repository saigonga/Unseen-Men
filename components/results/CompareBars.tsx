import { pct } from "@/lib/faceShape";
import type { ZScores } from "@/lib/faceShape";
import { TRAIT_Z } from "@/lib/faceShape.config";

const BARS: [keyof ZScores, string, string, string][] = [
  ["R", "Face length", "Shorter", "Longer"],
  ["J", "Jaw width", "Narrower", "Wider"],
  ["F", "Forehead width", "Narrower", "Wider"],
  ["K", "Chin", "Pointed", "Broad"],
  ["A", "Jaw angle", "Soft", "Sharp"],
];

export default function CompareBars({ z }: { z: ZScores }) {
  return (
    <div className="meas">
      {BARS.map(([k, label, lo, hi]) => {
        const v = z[k], pos = Math.max(3, Math.min(97, 50 + v * 16));
        const strong = Math.abs(v) >= TRAIT_Z;
        // Never show "top 0%" at the extremes.
        const share = Math.max(1, v > 0 ? 100 - pct(v) : pct(v));
        const tag = !strong ? "Average" : `${v > 0 ? hi : lo} · ${v > 0 ? "top" : "bottom"} ${share}%`;
        return (
          <div key={k}>
            <div className="bar-head"><span>{label}</span><b className={strong ? "hl" : ""}>{tag}</b></div>
            <div className="track"><i style={{ left: `${pos}%` }} /></div>
            <div className="bar-ends"><span>{lo}</span><span>{hi}</span></div>
          </div>
        );
      })}
    </div>
  );
}
