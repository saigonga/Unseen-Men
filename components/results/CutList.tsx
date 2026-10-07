import type { Pair } from "@/lib/content";
import type { RankedCut } from "@/lib/faceShape";
import { TRAIT_LABEL } from "@/lib/faceShape";
import StyleArt from "./StyleArt";
import { SeeOnMe } from "./TryOnContext";

export function PairList({ items, avoid = false, art, tryOn = false }: { items: Pair[]; avoid?: boolean; art?: "cut" | "beard"; tryOn?: boolean }) {
  return (
    <div className={`cuts${avoid ? " avoid" : ""}`}>
      {items.map(([n, w], i) => (
        <div className={`cut${art ? " has-art" : ""}`} key={n}>
          {art ? <StyleArt kind={art} name={n} /> : <span className="n">{i + 1}</span>}
          <div>
            {art && <span className={`n-small${avoid ? " bad" : ""}`}>{avoid ? "Avoid" : `0${i + 1}`}</span>}
            <strong>{n}</strong><p>{w}</p>
            {tryOn && art && <SeeOnMe mode={art === "cut" ? "hair" : "beard"} cut={art === "cut" ? n : undefined} beard={art === "beard" ? n : undefined} />}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BestCuts({ cuts, tryOn = false }: { cuts: RankedCut[]; tryOn?: boolean }) {
  return (
    <div className="cuts">
      {cuts.map((c, i) => (
        <div className="cut has-art" key={c.n}>
          <StyleArt kind="cut" name={c.n} />
          <div>
            <span className="n-small">0{i + 1}{i === 0 ? " · Best match" : ""}</span>
            <strong>{c.n}</strong>
            <p>{c.why}</p>
            {c.hits.length > 0 && (
              <div className="ingr" style={{ marginTop: 6 }}>
                {c.hits.map(h => <span key={h}>Suits your {TRAIT_LABEL[h].toLowerCase()}</span>)}
              </div>
            )}
            {tryOn && <SeeOnMe mode="hair" cut={c.n} />}
          </div>
        </div>
      ))}
    </div>
  );
}
