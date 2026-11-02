import { SKIN_AREAS } from "@/lib/content";
import type { SkinRead as SkinReadData } from "@/lib/skin";

export default function SkinRead({ data }: { data: SkinReadData | null }) {
  return (
    <div
      style={{
        border: "1px solid #DDD9D3",
        borderRadius: "3px 14px 3px 3px",
        padding: 18,
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-heading)",
            fontWeight: 500,
            fontSize: 17,
            color: "#4F2C1D",
          }}
        >
          Skin analysis
        </h3>
        <span
          style={{
            fontSize: 11,
            color: "#7A6A60",
            border: "1px solid #DDD9D3",
            borderRadius: 999,
            padding: "2px 8px",
          }}
        >
          Guidance only
        </span>
      </div>

      {!data && (
        <div style={{ fontSize: 13, color: "#5C4F47", lineHeight: 1.5 }}>
          Coming soon: Claude reads visible skin texture cues from your cropped selfie (oiliness,
          dryness, texture) and matches appropriate Nordman grooming ingredients. Photo is
          discarded immediately.
        </div>
      )}

      {data && <SkinResult o={data} />}
    </div>
  );
}

function SkinResult({ o }: { o: SkinReadData }) {
  const obs = o.observations.filter((x) => SKIN_AREAS[x.area]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {o.quality !== "good" && (
        <div
          style={{
            padding: "10px 14px",
            background: "#FBF8F3",
            border: "1px solid #DDD9D3",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          Photo quality: {o.quality}. {o.quality_note}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {obs.map((x) => {
          const a = SKIN_AREAS[x.area];
          const act = x.level !== "none";
          return (
            <div
              key={x.area}
              style={{
                border: "1px solid #EFEAE3",
                borderRadius: 8,
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ fontSize: 14 }}>{a.label}</strong>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    color: act ? "#4F2C1D" : "#7A6A60",
                    fontWeight: 500,
                  }}
                >
                  {x.level}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#5C4F47" }}>{x.note}</p>
              {act && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {a.ing.map((i) => (
                    <span
                      key={i}
                      style={{
                        background: "#F2E9DB",
                        color: "#4F2C1D",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 11,
                      }}
                    >
                      {i}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {o.see_dermatologist && (
        <div
          style={{
            padding: "10px 14px",
            background: "#FDF2F0",
            border: "1px solid #FFCDD2",
            borderRadius: 8,
            fontSize: 13,
            color: "#C62828",
          }}
        >
          Some observations are worth showing a dermatologist. Style guidance is not a substitute
          for medical advice.
        </div>
      )}
    </div>
  );
}
