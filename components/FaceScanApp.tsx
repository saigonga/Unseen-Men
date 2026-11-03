"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import LandingPage from "./LandingPage";
import RegisterLead from "./screens/RegisterLead";
import type { UserLeadProfile } from "./screens/RegisterLead";
import Capture from "./screens/Capture";
import Scanning from "./screens/Scanning";
import Questions from "./screens/Questions";
import type { Answers } from "./screens/Questions";
import Results from "./screens/Results";
import { loadDetector } from "@/lib/detector";
import type { Detection } from "@/lib/detector";
import { analyse, analyseMeasures } from "@/lib/faceShape";
import type { FaceResult, Measures } from "@/lib/faceShape";
import { captureReferral } from "@/lib/referral";
import dynamic from "next/dynamic";

const DebugPanel = dynamic(() => import("./DebugPanel"), { ssr: false });

export type ScreenId = "landing" | "register" | "capture" | "scan" | "questions" | "results";

export interface Photo {
  img: HTMLImageElement;
  url: string;
  det: Detection;
  m?: Measures;
}

export type ModelState = "loading" | "ready" | "error";

export default function FaceScanApp() {
  const searchParams = useSearchParams();
  const isDebug = searchParams.has("debug");

  const [screen, setScreen] = useState<ScreenId>("landing");
  const [initialCaptureMode, setInitialCaptureMode] = useState<"live" | "choose">("live");
  const [answers, setAnswers] = useState<Answers>({
    age: "25-34",
    beard: "stubble",
    concern: null,
    haircutFrequency: "3-4weeks",
  });
  const [userLead, setUserLead] = useState<UserLeadProfile | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("unseen_lead");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [result, setResult] = useState<FaceResult | null>(null);
  const [model, setModel] = useState<ModelState>("loading");
  const referredBy = useRef<string | null>(null);

  useEffect(() => {
    referredBy.current = captureReferral();
    loadDetector()
      .then(() => setModel("ready"))
      .catch((e) => {
        console.error(e);
        setModel("error");
      });
  }, []);

  const go = useCallback((id: ScreenId) => {
    setScreen(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCaptureComplete = useCallback(
    async (p: Photo) => {
      setPhoto((prev) => {
        if (prev && prev.url !== p.url) URL.revokeObjectURL(prev.url);
        return p;
      });

      // Show the animated landmark mapping analysis
      go("scan");

      // Compute measurements
      const r = p.m ? analyseMeasures(p.m, answers.beard) : analyse(p.det.P, answers.beard);
      setResult(r);

      // Allow 2.4s for scanning animation to complete
      await new Promise((res) => setTimeout(res, 2400));
      go("questions");
    },
    [answers.beard, go]
  );

  const handleQuestionsDone = useCallback(
    (updatedAnswers: Answers) => {
      setAnswers(updatedAnswers);
      // Re-analyse if beard status was changed
      if (photo) {
        const r = photo.m
          ? analyseMeasures(photo.m, updatedAnswers.beard)
          : analyse(photo.det.P, updatedAnswers.beard);
        setResult(r);
      }
      go("results");
    },
    [go, photo]
  );

  const restart = useCallback(() => {
    setPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setResult(null);
    go("register");
  }, [go]);

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      {/* 1. Full Editorial Landing Page */}
      {screen === "landing" && (
        <LandingPage onStart={() => go("register")} />
      )}

      {/* 2. Step 1: Upfront Compulsory Lead Registration (Name, WhatsApp, Email) */}
      {screen === "register" && (
        <div style={{ padding: "20px 16px 40px", display: "grid", placeItems: "center" }}>
          <RegisterLead
            initial={userLead || undefined}
            onProceed={(profile, mode) => {
              setUserLead(profile);
              try {
                localStorage.setItem("unseen_lead", JSON.stringify(profile));
              } catch {}
              setInitialCaptureMode(mode);
              go("capture");
            }}
            onClose={() => go("landing")}
          />
        </div>
      )}

      {/* 3. Step 2: Photo Capture */}
      {screen === "capture" && (
        <div style={{ padding: "20px 16px 40px", display: "grid", placeItems: "center" }}>
          <Capture
            model={model}
            initialMode={initialCaptureMode}
            onAnalyse={handleCaptureComplete}
            onClose={() => go("landing")}
          />
        </div>
      )}

      {/* 4. Step 3: Analysis in Progress */}
      {screen === "scan" && photo && (
        <div style={{ padding: "20px 16px 40px", display: "grid", placeItems: "center" }}>
          <Scanning url={photo.url} />
        </div>
      )}

      {/* 5. Step 4: Questions */}
      {screen === "questions" && (
        <div style={{ padding: "20px 16px 40px", display: "grid", placeItems: "center" }}>
          <Questions
            initial={answers}
            onDone={handleQuestionsDone}
            onBack={() => go("capture")}
          />
        </div>
      )}

      {/* 6. Step 5 & 6: Report */}
      {screen === "results" && photo && result && (
        <div style={{ padding: "24px 16px 64px", display: "grid", placeItems: "center" }}>
          <Results
            answers={answers}
            photo={photo}
            result={result}
            userLead={userLead}
            onRestart={restart}
          />
        </div>
      )}

      {isDebug && screen === "results" && photo && result && (
        <DebugPanel
          img={photo.img}
          det={photo.det}
          result={result}
          beard={answers.beard}
        />
      )}
    </div>
  );
}
