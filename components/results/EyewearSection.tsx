"use client";

import { useState } from "react";
import type { ShapeKey } from "@/lib/content";
import { EYEWEAR_BY_SHAPE } from "@/lib/styling";

interface EyewearSectionProps {
  shapeKey: ShapeKey;
}

export default function EyewearSection({ shapeKey }: EyewearSectionProps) {
  const [subTab, setSubTab] = useState<"optical" | "sunglasses" | "avoid">("optical");
  const advice = EYEWEAR_BY_SHAPE[shapeKey] || EYEWEAR_BY_SHAPE.square;

  return (
    <div
      style={{
        border: "1px solid #DDD9D3",
        borderRadius: "4px 16px 4px 4px",
        padding: "20px 22px",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#4F2C1D",
            fontWeight: 600,
          }}
        >
          02 THE FRAMES · SPECS & SUNGLASSES
        </span>
        <h3
          style={{
            margin: "4px 0 0",
            fontFamily: "var(--font-heading)",
            fontSize: 20,
            fontWeight: 500,
            color: "#111111",
          }}
        >
          {advice.headline}
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#5F5E59", lineHeight: 1.45 }}>
          {advice.objective}
        </p>
      </div>

      {/* Subtab Buttons */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid #EFEFEA",
          paddingBottom: 8,
        }}
      >
        <button
          type="button"
          onClick={() => setSubTab("optical")}
          style={{
            background: subTab === "optical" ? "#111111" : "#F6F5F2",
            color: subTab === "optical" ? "#FFFFFF" : "#555450",
            border: "none",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Optical Specs (3)
        </button>
        <button
          type="button"
          onClick={() => setSubTab("sunglasses")}
          style={{
            background: subTab === "sunglasses" ? "#111111" : "#F6F5F2",
            color: subTab === "sunglasses" ? "#FFFFFF" : "#555450",
            border: "none",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Sunglasses (3)
        </button>
        <button
          type="button"
          onClick={() => setSubTab("avoid")}
          style={{
            background: subTab === "avoid" ? "#7A2016" : "#F6F5F2",
            color: subTab === "avoid" ? "#FFFFFF" : "#7A2016",
            border: "none",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Frames to Avoid
        </button>
      </div>

      {/* Optical Frames */}
      {subTab === "optical" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {advice.optical.map((f, i) => (
            <div
              key={f.name}
              style={{
                border: "1px solid #ECECEA",
                borderRadius: 8,
                padding: "14px 16px",
                background: "#FAF9F6",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#4F2C1D",
                      background: "#EBE3D7",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    0{i + 1}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 15, color: "#111111" }}>{f.name}</span>
                </div>
                <span style={{ fontSize: 11, color: "#777672", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Optical
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: "#484743", lineHeight: 1.45 }}>
                {f.desc}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                {f.suits.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 11.5,
                      padding: "2px 8px",
                      background: "#FFFFFF",
                      border: "1px solid #DDDCD6",
                      borderRadius: 4,
                      color: "#4F2C1D",
                    }}
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sunglasses */}
      {subTab === "sunglasses" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {advice.sunglasses.map((f, i) => (
            <div
              key={f.name}
              style={{
                border: "1px solid #ECECEA",
                borderRadius: 8,
                padding: "14px 16px",
                background: "#FAF9F6",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#4F2C1D",
                      background: "#EBE3D7",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    0{i + 1}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 15, color: "#111111" }}>{f.name}</span>
                </div>
                <span style={{ fontSize: 11, color: "#777672", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Sun
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: "#484743", lineHeight: 1.45 }}>
                {f.desc}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                {f.suits.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 11.5,
                      padding: "2px 8px",
                      background: "#FFFFFF",
                      border: "1px solid #DDDCD6",
                      borderRadius: 4,
                      color: "#4F2C1D",
                    }}
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Frames to Avoid */}
      {subTab === "avoid" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {advice.avoid.map((f) => (
            <div
              key={f.name}
              style={{
                border: "1px solid #F2D2CE",
                borderRadius: 8,
                padding: "12px 14px",
                background: "#FDF8F7",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#BF3622", fontWeight: 700, fontSize: 14 }}>✕</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#7A2016" }}>{f.name}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#5A302B", lineHeight: 1.4 }}>
                {f.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
