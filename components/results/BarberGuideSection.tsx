"use client";

import { useState } from "react";
import type { ShapeKey } from "@/lib/content";
import { BARBER_GUIDE_BY_SHAPE } from "@/lib/styling";

interface BarberGuideSectionProps {
  shapeKey: ShapeKey;
}

export default function BarberGuideSection({ shapeKey }: BarberGuideSectionProps) {
  const [copied, setCopied] = useState(false);
  const guide = BARBER_GUIDE_BY_SHAPE[shapeKey] || BARBER_GUIDE_BY_SHAPE.square;

  function handleCopy() {
    const text = `UNSEEN MEN · Barber Instructions
Direction: ${guide.primaryDirection}
Top Length: ${guide.topLength}
Sides & Back: ${guide.sidesLength}
Taper Style: ${guide.taper}
Styling Product: ${guide.stylingProduct}
Note: ${guide.notes}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        border: "1px solid #DDD9D3",
        borderRadius: "4px 16px 4px 4px",
        padding: "20px 22px",
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
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#4F2C1D",
              fontWeight: 600,
            }}
          >
            03 THE HAIR · BARBER INSTRUCTION CARD
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
            Exact Salon & Clipper Specs
          </h3>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: copied ? "#2E5C38" : "#F4EDE4",
            color: copied ? "#FFFFFF" : "#4F2C1D",
            border: "1px solid #DDD9D3",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {copied ? "Copied ✓" : "Copy for Barber"}
        </button>
      </div>

      <p style={{ margin: 0, fontSize: 13.5, color: "#5F5E59", lineHeight: 1.45 }}>
        Show these exact measurements and clipper guards directly to your hairstylist or barber.
      </p>

      {/* Structured Clipper & Length Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10,
        }}
      >
        <div
          style={{
            background: "#FAF9F6",
            border: "1px solid #ECECEA",
            borderRadius: 8,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, color: "#8A8A85", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Top Length
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111111" }}>
            {guide.topLength}
          </span>
        </div>

        <div
          style={{
            background: "#FAF9F6",
            border: "1px solid #ECECEA",
            borderRadius: 8,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, color: "#8A8A85", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Sides & Back
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111111" }}>
            {guide.sidesLength}
          </span>
        </div>

        <div
          style={{
            background: "#FAF9F6",
            border: "1px solid #ECECEA",
            borderRadius: 8,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, color: "#8A8A85", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Taper Type
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111111" }}>
            {guide.taper}
          </span>
        </div>

        <div
          style={{
            background: "#FAF9F6",
            border: "1px solid #ECECEA",
            borderRadius: 8,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, color: "#8A8A85", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Finishing Product
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111111" }}>
            {guide.stylingProduct}
          </span>
        </div>
      </div>

      {/* Salon Note Box */}
      <div
        style={{
          background: "#FAF7F2",
          border: "1px solid #E6DCCD",
          borderRadius: 8,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: "#4F2C1D", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Barber Dialogue Note
        </span>
        <p style={{ margin: 0, fontSize: 13, color: "#3B332B", lineHeight: 1.45, fontStyle: "italic" }}>
          "{guide.notes}"
        </p>
      </div>
    </div>
  );
}
