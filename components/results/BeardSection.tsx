import { SHAPES } from "@/lib/content";
import type { Beard, ShapeKey } from "@/lib/content";
import { PairList } from "./CutList";

export default function BeardSection({
  shape,
  beard,
  tweaks,
}: {
  shape: ShapeKey;
  beard: Beard;
  tweaks: string[];
}) {
  const b = SHAPES[shape].beard;
  const name = SHAPES[shape].name.toLowerCase();
  const forYou = tweaks.length ? ` For your face specifically: ${tweaks.join(" ")}` : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-heading)",
            fontWeight: 500,
            fontSize: 18,
            color: "#4F2C1D",
          }}
        >
          {beard === "none" ? "Beard recommendation" : "Beard shaping guidance"}
        </h3>
        <span
          style={{
            fontSize: 11.5,
            border: "1px solid #DDD9D3",
            borderRadius: 999,
            padding: "2px 10px",
            color: "#4F2C1D",
            background: "#F4EDE4",
            fontWeight: 500,
          }}
        >
          {b.v === "Yes" ? (beard === "none" ? "Recommended" : "Suits your jaw") : "Optional"}
        </span>
      </div>

      <div
        style={{
          border: "1px solid #DDD9D3",
          borderRadius: "3px 14px 3px 3px",
          padding: 16,
          background: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 13, color: "#7A6A60" }}>
          {beard === "none"
            ? `You're clean-shaven now. If you choose to grow facial hair, here is how to shape it for a ${name} face:`
            : `You have ${beard === "full" ? "a full beard" : "stubble"} now. Here is the optimum contouring for a ${name} face:`}
        </div>
        <p style={{ margin: 0, fontSize: 14, color: "#1B1815", lineHeight: 1.55 }}>
          {beard === "none" ? b.text : b.keep}
          {forYou}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#4F2C1D" }}>
          Recommended beard styles
        </span>
        <PairList items={b.styles} art="beard" tryOn />
      </div>
    </div>
  );
}
