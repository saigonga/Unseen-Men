import type { Pair } from "@/lib/content";
import type { RankedCut } from "@/lib/faceShape";
import { TRAIT_LABEL } from "@/lib/faceShape";
import StyleArt from "./StyleArt";
import { SeeOnMe } from "./TryOnContext";

export function PairList({
  items,
  avoid = false,
  art,
  tryOn = false,
}: {
  items: Pair[];
  avoid?: boolean;
  art?: "cut" | "beard";
  tryOn?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map(([n, w], i) => (
        <div
          key={n}
          style={{
            border: avoid ? "1px solid #EFEAE3" : "1px solid #DDD9D3",
            borderRadius: "3px 14px 3px 3px",
            padding: 16,
            background: avoid ? "#FAF9F7" : "#FFFFFF",
            display: "grid",
            gridTemplateColumns: art ? "84px minmax(0, 1fr)" : "32px minmax(0, 1fr)",
            gap: 16,
            alignItems: "center",
          }}
        >
          {art ? (
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 8,
                background: "#FBF8F3",
                border: "1px solid #EFEAE3",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
              }}
            >
              <StyleArt kind={art} name={n} />
            </div>
          ) : (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontVariantNumeric: "tabular-nums",
                fontSize: 13,
                color: "#7A6A60",
                fontWeight: 600,
              }}
            >
              0{i + 1}
            </span>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <strong
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 16,
                  fontWeight: 500,
                  color: avoid ? "#7A6A60" : "#1B1815",
                }}
              >
                {n}
              </strong>
              <span
                style={{
                  fontSize: 11,
                  border: avoid ? "1px solid #E57373" : "1px solid #DDD9D3",
                  color: avoid ? "#C62828" : "#4F2C1D",
                  borderRadius: 999,
                  padding: "1px 8px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {avoid ? "Avoid" : `Option 0${i + 1}`}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: "#5C4F47", lineHeight: 1.5 }}>
              {w}
            </p>
            {tryOn && art && (
              <div style={{ marginTop: 4 }}>
                <SeeOnMe
                  mode={art === "cut" ? "hair" : "beard"}
                  cut={art === "cut" ? n : undefined}
                  beard={art === "beard" ? n : undefined}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BestCuts({
  cuts,
  tryOn = false,
}: {
  cuts: RankedCut[];
  tryOn?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {cuts.map((c, i) => (
        <div
          key={c.n}
          style={{
            border: "1px solid #DDD9D3",
            borderRadius: "3px 14px 3px 3px",
            padding: 16,
            background: "#FFFFFF",
            display: "grid",
            gridTemplateColumns: "88px minmax(0, 1fr)",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 8,
              background: "#FBF8F3",
              border: "1px solid #EFEAE3",
              overflow: "hidden",
              display: "grid",
              placeItems: "center",
            }}
          >
            <StyleArt kind="cut" name={c.n} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <strong
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 16.5,
                  fontWeight: 600,
                  color: "#1B1815",
                }}
              >
                {c.n}
              </strong>
              <span
                style={{
                  fontSize: 11,
                  border: i === 0 ? "1px solid #4F2C1D" : "1px solid #DDD9D3",
                  color: i === 0 ? "#4F2C1D" : "#7A6A60",
                  background: i === 0 ? "#F4EDE4" : "transparent",
                  borderRadius: 999,
                  padding: "2px 8px",
                  fontWeight: 600,
                }}
              >
                {i === 0 ? "★ Top Match" : `0${i + 1}`}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: "#5C4F47", lineHeight: 1.5 }}>
              {c.why}
            </p>
            {c.hits.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 2,
                }}
              >
                {c.hits.map((h) => (
                  <span
                    key={h}
                    style={{
                      background: "#F2E9DB",
                      color: "#4F2C1D",
                      borderRadius: 6,
                      padding: "3px 8px",
                      fontSize: 11.5,
                      fontWeight: 500,
                    }}
                  >
                    Suits your {TRAIT_LABEL[h].toLowerCase()}
                  </span>
                ))}
              </div>
            )}
            {tryOn && (
              <div style={{ marginTop: 4 }}>
                <SeeOnMe mode="hair" cut={c.n} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
