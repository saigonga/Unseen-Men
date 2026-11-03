"use client";

import type { ShapeKey } from "@/lib/content";
import type { FaceResult } from "@/lib/faceShape";
import { getFacialThirds, STYLING_OBJECTIVES, type AnyPoint } from "@/lib/styling";

interface FacialThirdsSectionProps {
  shapeKey: ShapeKey;
  result: FaceResult;
  points?: AnyPoint[];
}

export default function FacialThirdsSection({
  shapeKey,
  result,
  points,
}: FacialThirdsSectionProps) {
  const thirds = getFacialThirds(points);
  const obj = STYLING_OBJECTIVES[shapeKey] || STYLING_OBJECTIVES.square;

  return (
    <div
      style={{
        border: "1px solid #DDD9D3",
        borderRadius: "4px 16px 4px 4px",
        padding: "18px 16px",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#4F2C1D",
              fontWeight: 600,
            }}
          >
            01 THE FACE · PROPORTIONS & THIRDS
          </span>
          <h3
            style={{
              margin: "3px 0 0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(18px, 4vw, 20px)",
              fontWeight: 500,
              color: "#111111",
            }}
          >
            Facial Architecture & Thirds
          </h3>
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#4F2C1D",
            background: "#F4EDE4",
            padding: "3px 8px",
            borderRadius: 4,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {thirds.upperPct}/{thirds.midPct}/{thirds.lowerPct}
        </span>
      </div>

      {/* Proportions Stacked Visual */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 12,
            borderRadius: 6,
            overflow: "hidden",
            background: "#EFEFEA",
          }}
        >
          <div
            title={`Upper (Forehead): ${thirds.upperPct}%`}
            style={{
              width: `${thirds.upperPct}%`,
              background: "#4F2C1D",
              transition: "width 0.4s ease",
            }}
          />
          <div
            title={`Mid (Brow to Nose): ${thirds.midPct}%`}
            style={{
              width: `${thirds.midPct}%`,
              background: "#8C5E45",
              transition: "width 0.4s ease",
            }}
          />
          <div
            title={`Lower (Nose to Chin): ${thirds.lowerPct}%`}
            style={{
              width: `${thirds.lowerPct}%`,
              background: "#BA977A",
              transition: "width 0.4s ease",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 6,
            fontSize: 11.5,
            marginTop: 4,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#777672", fontSize: 10.5, lineHeight: 1.2 }}>Upper (Forehead)</span>
            <span style={{ fontWeight: 600, color: "#111111", fontSize: 13, marginTop: 2 }}>{thirds.upperPct}%</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#777672", fontSize: 10.5, lineHeight: 1.2 }}>Mid (Brow - Nose)</span>
            <span style={{ fontWeight: 600, color: "#111111", fontSize: 13, marginTop: 2 }}>{thirds.midPct}%</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#777672", fontSize: 10.5, lineHeight: 1.2 }}>Lower (Nose - Chin)</span>
            <span style={{ fontWeight: 600, color: "#111111", fontSize: 13, marginTop: 2 }}>{thirds.lowerPct}%</span>
          </div>
        </div>
      </div>

      {/* Styling Objective Box */}
      <div
        style={{
          background: "#FAF7F2",
          border: "1px solid #E6DCCD",
          borderRadius: 8,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: "#4F2C1D",
          }}
        >
          {obj.headline}
        </span>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "#2E2D2A" }}>
          {obj.objective}
        </p>
        <div style={{ marginTop: 4, fontSize: 12, color: "#6B584C", fontStyle: "italic" }}>
          Rule: {obj.coreRule}
        </div>
      </div>

      {/* Standout Features */}
      {result.traits.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#4F2C1D", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Structural Highlights
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {result.traits.map((t) => (
              <span
                key={t.key}
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  background: "#F6F5F2",
                  border: "1px solid #E3E2DC",
                  borderRadius: 999,
                  color: "#2C2B29",
                }}
              >
                ✓ {t.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
