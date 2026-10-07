import { SKIN_AREAS } from "@/lib/content";
import type { SkinRead as SkinReadData } from "@/lib/skin";

/** Phase 1: placeholder. Phase 4 adds the server route (Claude API) and the "Run my skin read" button. */
export default function SkinRead({ data }: { data: SkinReadData | null }) {
  return (
    <div className="stack">
      <h3>Skin read</h3>
      {!data && (
        <p className="small muted">
          Coming soon: Claude looks at a cropped photo of your face for one read and describes what&apos;s visible. The photo is deleted right after. It&apos;s grooming advice, not a medical diagnosis.
        </p>
      )}
      {data && <SkinResult o={data} />}
    </div>
  );
}

function SkinResult({ o }: { o: SkinReadData }) {
  const obs = o.observations.filter(x => SKIN_AREAS[x.area]);
  return (
    <div className="stack">
      {o.quality !== "good" && <div className="notice">Photo quality: {o.quality}. {o.quality_note}</div>}
      <div>
        {obs.map(x => {
          const a = SKIN_AREAS[x.area], act = x.level !== "none";
          return (
            <div className="skin-row" key={x.area}>
              <strong>{a.label}</strong><span className={`lvl ${x.level}`}>{x.level}</span><p>{x.note}</p>
              {act && <div className="ingr">{a.ing.map(i => <span key={i}>{i}</span>)}</div>}
              {act && <span className="sku">→ {a.sku}</span>}
            </div>
          );
        })}
      </div>
      {o.see_dermatologist && <div className="notice bad">Some of what we see is worth showing a dermatologist. Products help, but a doctor can treat it properly.</div>}
      <p className="small muted">Grooming guidance, not medical advice.</p>
    </div>
  );
}
