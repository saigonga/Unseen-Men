"use client";

import { useEffect, useRef, useState } from "react";
import { SHAPES, ROUTINES } from "@/lib/content";
import type { FaceResult } from "@/lib/faceShape";
import { drawOverlay } from "@/lib/overlay";
import { newCode } from "@/lib/referral";
import CompareBars from "../results/CompareBars";
import { BestCuts, PairList } from "../results/CutList";
import UnlockForm from "../results/UnlockForm";
import type { Lead } from "../results/UnlockForm";
import BeardSection from "../results/BeardSection";
import TryOn from "../results/TryOn";
import SkinRead from "../results/SkinRead";
import ShareSection from "../results/ShareSection";
import Rewards from "../results/Rewards";
import type { Answers } from "./Questions";
import type { Photo } from "../FaceScanApp";

interface Unlocked extends Lead { code: string; position: number }

export default function Results({ answers, photo, result, onRestart }: { answers: Answers; photo: Photo; result: FaceResult; onRestart: () => void }) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [unlocked, setUnlocked] = useState<Unlocked | null>(null);
  const [tryOn, setTryOn] = useState<string | null>(null);
  const fullRef = useRef<HTMLDivElement>(null);
  const sh = SHAPES[result.key];
  const p1 = result.ranked[0][1];
  const beardStyle = sh.beard.styles[0][0];

  useEffect(() => { if (canvas) drawOverlay(canvas, photo.img, photo.det, true); }, [canvas, photo]);
  useEffect(() => { if (unlocked) fullRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [unlocked]);

  const why = result.traits.length
    ? `What sets your face apart: ${result.traits.slice(0, 3).map(t => t.label.toLowerCase()).join(", ")}.`
    : "Nothing stands out strongly, which is what makes a face oval and balanced.";
  const beardNote = answers.beard === "full" ? " Your beard hides part of the jawline, so we weighted the jaw reading less." : "";

  function unlock(l: Lead) {
    // Placeholder: phase 5 saves the lead to Supabase and returns a real code + position.
    setUnlocked({ ...l, code: newCode(), position: 400 + Math.floor(Math.random() * 90) });
  }

  return (
    <section className="stack">
      <span className="eyebrow">Your result</span>
      <div className="verdict">
        <span className="muted small">Your face shape</span>
        <span className="shape">{sh.name}</span>
        <span className="lean">
          {result.lean ? `Leaning ${SHAPES[result.lean].name} · ` : ""}{Math.round(p1 * 100)}% match
        </span>
        <p>{sh.desc} {why}{beardNote}</p>
      </div>
      <div className="frame auto"><canvas ref={setCanvas} /></div>
      <h3>How your face compares</h3>
      <CompareBars z={result.z} />
      <div className="stack">
        <h3>Top 3 cuts for you</h3>
        <BestCuts cuts={result.cuts} />
      </div>

      {!unlocked && <UnlockForm onUnlock={unlock} />}

      {unlocked && (
        <div className="stack" ref={fullRef}>
          <TryOn photo={photo} cut={result.cuts[0].n} beard={beardStyle} onImage={setTryOn} />
          <hr />
          <div className="stack">
            <h3>Cuts to avoid</h3>
            <PairList items={result.avoid} avoid art="cut" />
          </div>
          <hr />
          <BeardSection shape={result.key} beard={answers.beard} tweaks={result.beardTweaks} />
          <hr />
          <SkinRead data={null} />
          <hr />
          <div className="stack">
            <h3>Your routine <span className="muted small" style={{ fontFamily: "var(--mono)" }}>{answers.age}</span></h3>
            <ol className="routine">{ROUTINES[answers.age].map(r => <li key={r}><span>{r}</span></li>)}</ol>
          </div>
          <hr />
          <ShareSection
            photo={photo}
            beardStyle={beardStyle}
            pdf={{ name: unlocked.name, mobile: unlocked.mobile, email: unlocked.email, age: answers.age, beard: answers.beard, result, skin: null, code: unlocked.code, faceImage: canvas, tryOn }}
          />
          <Rewards code={unlocked.code} position={unlocked.position} referrals={0} />
          <button className="ghost" onClick={onRestart}>Scan another face</button>
        </div>
      )}
      <p className="devnote">
        Prototype note: faces are compared against norms from 28 sample portraits. Replace them with norms from 50+ Indian male selfies, checked by a barber, before launch. Product slots show where Nordman SKUs plug in.
      </p>
    </section>
  );
}
