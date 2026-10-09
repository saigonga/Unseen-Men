"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import StepBar from "./StepBar";
import Landing from "./screens/Landing";
import Questions from "./screens/Questions";
import type { Answers } from "./screens/Questions";
import Tips from "./screens/Tips";
import Capture from "./screens/Capture";
import Scanning from "./screens/Scanning";
import Results from "./screens/Results";
import { loadDetector } from "@/lib/detector";
import type { Detection } from "@/lib/detector";
import { analyse, analyseMeasures } from "@/lib/faceShape";
import type { FaceResult, Measures } from "@/lib/faceShape";
import { captureReferral } from "@/lib/referral";
import dynamic from "next/dynamic";

const DebugPanel = dynamic(() => import("./DebugPanel"), { ssr: false });

export type ScreenId = "start" | "inputs" | "tips" | "capture" | "scan" | "results";
export const ORDER: ScreenId[] = ["start", "inputs", "tips", "capture", "scan", "results"];

/** `m` = robust (median) measurements; falls back to the single detection if missing. */
export interface Photo { img: HTMLImageElement; url: string; det: Detection; m?: Measures }
export type ModelState = "loading" | "ready" | "error";

export default function FaceScanApp() {
  const searchParams = useSearchParams();
  const isDebug = searchParams.has("debug");
  const [screen, setScreen] = useState<ScreenId>("start");
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [result, setResult] = useState<FaceResult | null>(null);
  const [model, setModel] = useState<ModelState>("loading");
  const referredBy = useRef<string | null>(null);

  useEffect(() => {
    referredBy.current = captureReferral();
    loadDetector().then(() => setModel("ready")).catch(e => { console.error(e); setModel("error"); });
  }, []);

  const go = useCallback((id: ScreenId) => { setScreen(id); window.scrollTo({ top: 0 }); }, []);

  const startAnalysis = useCallback(async (p: Photo) => {
    if (!answers) return;
    setPhoto(prev => { if (prev && prev.url !== p.url) URL.revokeObjectURL(prev.url); return p; });
    go("scan");
    const r = p.m ? analyseMeasures(p.m, answers.beard) : analyse(p.det.P, answers.beard);
    await new Promise(res => setTimeout(res, 2700));
    setResult(r);
    go("results");
  }, [answers, go]);

  const restart = useCallback(() => {
    setPhoto(prev => { if (prev) URL.revokeObjectURL(prev.url); return null; });
    setResult(null);
    go("capture");
  }, [go]);

  return (
    <div className="wrap">
      <StepBar index={ORDER.indexOf(screen)} total={ORDER.length} />
      {screen === "start" && <Landing onStart={() => go("inputs")} />}
      {screen === "inputs" && <Questions initial={answers} onDone={a => { setAnswers(a); go("tips"); }} />}
      {screen === "tips" && <Tips onNext={() => go("capture")} />}
      {screen === "capture" && <Capture model={model} onAnalyse={startAnalysis} />}
      {screen === "scan" && photo && <Scanning url={photo.url} />}
      {screen === "results" && photo && result && answers && (
        <Results answers={answers} photo={photo} result={result} onRestart={restart} />
      )}
      {isDebug && screen === "results" && photo && result && answers && (
        <DebugPanel img={photo.img} det={photo.det} result={result} beard={answers.beard} />
      )}
    </div>
  );
}
