"use client";

import { useState } from "react";
import { UNDERTONE_PALETTES, type ColorPalette } from "@/lib/styling";

interface ColorPaletteSectionProps {
  palette?: ColorPalette;
}

export default function ColorPaletteSection({ palette = UNDERTONE_PALETTES.warm_golden }: ColorPaletteSectionProps) {
  const [selectedHex, setSelectedHex] = useState<string | null>(null);

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
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
            05 THE COLOUR · WARDROBE
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                display: "inline-block",
                width: 13,
                height: 13,
                borderRadius: "50%",
                background: palette.sampleHex,
                border: "1px solid #DDD",
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#111111" }}>
              {palette.undertoneName}
            </span>
          </div>
        </div>
        <h3
          style={{
            margin: "3px 0 0",
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(18px, 4vw, 20px)",
            fontWeight: 500,
            color: "#111111",
          }}
        >
          Your Personal Color Direction
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#5F5E59", lineHeight: 1.45 }}>
          {palette.undertoneDesc}
        </p>
      </div>

      {/* 8 Base Neutrals (4 per row on mobile) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#4F2C1D", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            8 Base Neutrals (Jackets & Trousers)
          </span>
          {selectedHex && (
            <span style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: "#666" }}>
              {selectedHex}
            </span>
          )}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 7,
          }}
        >
          {palette.baseNeutrals.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSelectedHex(`${c.name} (${c.hex})`)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 36,
                  borderRadius: 6,
                  background: c.hex,
                  border: "1px solid rgba(0,0,0,0.12)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                }}
              />
              <span
                style={{
                  fontSize: 10.5,
                  color: "#333",
                  textAlign: "center",
                  lineHeight: 1.2,
                  fontWeight: 500,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 12 Matching Shirt & Apparel Colors (4 per row on mobile) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#4F2C1D", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          12 Flattering Shirt & Knitwear Shades
        </span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 7,
          }}
        >
          {palette.matchingColors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSelectedHex(`${c.name} (${c.hex})`)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 36,
                  borderRadius: 6,
                  background: c.hex,
                  border: "1px solid rgba(0,0,0,0.12)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                }}
              />
              <span
                style={{
                  fontSize: 10.5,
                  color: "#333",
                  textAlign: "center",
                  lineHeight: 1.2,
                  fontWeight: 500,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4 Colors to Avoid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#7A2016", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Wardrobe Shades to Avoid
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 8 }}>
          {palette.avoidColors.map((c) => (
            <div
              key={c.name}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 6,
                background: "#FDF8F7",
                border: "1px solid #F2D2CE",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 4,
                  background: c.hex,
                  border: "1px solid rgba(0,0,0,0.15)",
                  flexShrink: 0,
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#7A2016" }}>{c.name}</span>
                <span style={{ fontSize: 11.5, color: "#5A302B", lineHeight: 1.35 }}>{c.reason}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
