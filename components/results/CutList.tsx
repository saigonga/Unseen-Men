import type { Pair } from "@/lib/content";
import type { RankedCut } from "@/lib/faceShape";
import { TRAIT_LABEL } from "@/lib/faceShape";

export function PairList({ items, avoid = false }: { items: Pair[]; avoid?: boolean }) {
  return (
    <div className={`cuts${avoid ? " avoid" : ""}`}>
      {items.map(([n, w], i) => (
        <div className="cut" key={n}><span className="n">{i + 1}</span><div><strong>{n}</strong><p>{w}</p></div></div>
      ))}
    </div>
  );
}

export function BestCuts({ cuts }: { cuts: RankedCut[] }) {
  return (
    <div className="cuts">
      {cuts.map((c, i) => (
        <div className="cut" key={c.n}>
          <span className="n">{i + 1}</span>
          <div>
            <strong>{c.n}</strong>
            <p>{c.why}</p>
            {c.hits.length > 0 && (
              <div className="ingr" style={{ marginTop: 6 }}>
                {c.hits.map(h => <span key={h}>Suits your {TRAIT_LABEL[h].toLowerCase()}</span>)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
