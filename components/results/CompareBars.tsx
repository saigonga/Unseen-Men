import { pct } from "@/lib/faceShape";
import type { ZScores } from "@/lib/faceShape";
import { TRAIT_Z } from "@/lib/faceShape.config";

const BARS: [keyof ZScores, string, string, string][] = [
  ["R", "Face length", "Shorter", "Longer"],
  ["J", "Jaw width", "Narrower", "Wider"],
  ["F", "Forehead width", "Narrower", "Wider"],
  ["K", "Chin contour", "Pointed", "Broad"],
  ["A", "Jawline angle", "Soft", "Defined"],
];

export default function CompareBars({ z }: { z: ZScores }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {BARS.map(([k, label, lo, hi]) => {
        const v = z[k];
        const pos = Math.max(5, Math.min(95, 50 + v * 16));
        const strong = Math.abs(v) >= TRAIT_Z;
        const share = Math.max(1, v > 0 ? 100 - pct(v) : pct(v));
        const tag = !strong ? "Average" : `${v > 0 ? hi : lo} · ${v > 0 ? "top" : "bottom"} ${share}%`;

        return (
          <div
            key={k}
            style={{
              border: "1px solid #DDD9D3",
              borderRadius: "3px 14px 3px 3px",
              padding: "12px 14px",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                fontSize: 13,
              }}
            >
              <span style={{ fontWeight: 500, color: "#1B1815" }}>{label}</span>
              <span
                style={{
                  fontSize: 11.5,
                  color: strong ? "#4F2C1D" : "#7A6A60",
                  fontWeight: strong ? 600 : 400,
                  border: strong ? "1px solid #DDD9D3" : "none",
                  borderRadius: 999,
                  padding: strong ? "1px 8px" : 0,
                }}
              >
                {tag}
              </span>
            </div>

            <div style={{ position: "relative", height: 16 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 7,
                  height: 2,
                  background: "#E6E0D8",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 2,
                  width: 1,
                  height: 12,
                  background: "#7A6A60",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `${pos}%`,
                  top: 1,
                  width: 14,
                  height: 14,
                  marginLeft: -7,
                  borderRadius: 999,
                  background: "#4F2C1D",
                  border: "3px solid #FFFFFF",
                  boxShadow: "0 0 0 1px #4F2C1D",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#7A6A60",
              }}
            >
              <span>{lo}</span>
              <span>Average</span>
              <span>{hi}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
