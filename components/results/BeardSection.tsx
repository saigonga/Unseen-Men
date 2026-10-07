import { SHAPES } from "@/lib/content";
import type { Beard, ShapeKey } from "@/lib/content";
import { PairList } from "./CutList";

/** Advice depends on what he has now: no beard → which beard would suit; stubble/full → how to shape it. */
export default function BeardSection({ shape, beard, tweaks }: { shape: ShapeKey; beard: Beard; tweaks: string[] }) {
  const b = SHAPES[shape].beard, name = SHAPES[shape].name.toLowerCase();
  const forYou = tweaks.length ? ` For your face specifically: ${tweaks.join(" ")}` : "";

  if (beard === "none") {
    return (
      <div className="stack">
        <div className="row"><h3>Beard verdict</h3><span className={`pill ${b.cls}`}>{b.v === "Yes" ? "A beard would help" : "Optional"}</span></div>
        <p className="small muted">You&apos;re clean-shaven now. If you grow one, these suit a {name} face best:</p>
        <p>{b.text}{forYou}</p>
        <PairList items={b.styles} art="beard" />
      </div>
    );
  }
  return (
    <div className="stack">
      <div className="row"><h3>Your beard</h3><span className={`pill ${b.cls}`}>{b.v === "Yes" ? "Suits you" : "Optional"}</span></div>
      <p className="small muted">You have {beard === "full" ? "a full beard" : "stubble"} now. Here&apos;s how to shape it for a {name} face:</p>
      <p>{b.keep}{forYou}</p>
      <h3 style={{ fontSize: "1.05rem" }}>Best beard styles for your face</h3>
      <PairList items={b.styles} art="beard" />
    </div>
  );
}
