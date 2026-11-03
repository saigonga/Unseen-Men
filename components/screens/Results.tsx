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
import { TryOnProvider, TryOnConsent, SeeOnMe } from "../results/TryOnContext";
import SkinRead from "../results/SkinRead";
import ShareSection from "../results/ShareSection";
import Rewards from "../results/Rewards";
import type { Answers } from "./Questions";
import type { Photo } from "../FaceScanApp";

interface Unlocked extends Lead {
  code: string;
  position: number;
  referrals: number;
}

type ReportTab = "all" | "structure" | "haircuts" | "beard" | "routine";

export default function Results({
  answers,
  photo,
  result,
  onRestart,
}: {
  answers: Answers;
  photo: Photo;
  result: FaceResult;
  onRestart: () => void;
}) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [unlocked, setUnlocked] = useState<Unlocked | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>("all");
  const [surpriseNumber] = useState(() => String(300 + Math.floor(Math.random() * 200)).padStart(4, "0"));
  const fullRef = useRef<HTMLDivElement>(null);

  const sh = SHAPES[result.key];
  const p1 = result.ranked[0][1];
  const beardStyle = sh.beard.styles[0][0];

  useEffect(() => {
    if (canvas) drawOverlay(canvas, photo.img, photo.det, true);
  }, [canvas, photo]);

  useEffect(() => {
    if (unlocked) {
      fullRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [unlocked]);

  const why = result.traits.length
    ? `What sets your face apart: ${result.traits
        .slice(0, 3)
        .map((t) => t.label.toLowerCase())
        .join(", ")}.`
    : "Nothing stands out strongly, which is what makes a face oval and balanced.";

  const beardNote =
    answers.beard === "full"
      ? " Your beard hides part of the jawline, so we weighted the jaw reading less."
      : "";

  function unlock(l: Lead) {
    setUnlocked({
      ...l,
      code: l.referralCode || newCode(),
      position: l.waitlistPosition || 1,
      referrals: l.referralCount || 0,
      memberNumber: l.memberNumber || parseInt(surpriseNumber, 10),
    });
  }

  return (
    <TryOnProvider photo={photo}>
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          margin: "0 auto",
          background: "#FFFFFF",
          color: "#111111",
          borderRadius: 14,
          border: "1px solid #ECECEA",
          overflow: "hidden",
          boxShadow: "0 24px 48px -32px rgba(17,17,17,0.18)",
        }}
      >
        {/* Report Top Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #ECECEA",
            background: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#4F2C1D",
                fontWeight: 600,
              }}
            >
              NODD MEN · REPORT
            </span>
            <span
              style={{
                border: "1px solid #ECECEA",
                color: "#4F2C1D",
                borderRadius: 999,
                padding: "2px 10px",
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {unlocked
                ? `Member #${String(unlocked.memberNumber || surpriseNumber).padStart(4, "0")}`
                : `Reserved #${surpriseNumber}`}
            </span>
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-heading)",
                fontWeight: 500,
                fontSize: "clamp(22px, 3.5vw, 26px)",
                letterSpacing: "-0.02em",
                color: "#111111",
              }}
            >
              {unlocked ? `${unlocked.name}'s Report` : "Facial Analysis Report"}
            </h1>
            <div style={{ fontSize: 13, color: "#8A8A85", marginTop: 2 }}>
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · {Math.round(p1 * 100)}% {sh.name} match
            </div>
          </div>

          {/* Navigation Category Tabs */}
          <div
            style={{
              display: "flex",
              gap: 18,
              fontSize: 13.5,
              color: "#8A8A85",
              borderTop: "1px solid #F0F0EE",
              paddingTop: 12,
              overflowX: "auto",
            }}
          >
            {(
              [
                ["all", "All report"],
                ["structure", "Face structure"],
                ["haircuts", "Haircuts"],
                ["beard", "Beard verdict"],
                ["routine", "Grooming routine"],
              ] as [ReportTab, string][]
            ).map(([tab, label]) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: "transparent",
                    border: "none",
                    paddingBottom: 6,
                    color: active ? "#111111" : "#8A8A85",
                    fontWeight: active ? 500 : 400,
                    borderBottom: active ? "2px solid #111111" : "2px solid transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Area */}
        <div style={{ padding: "24px 24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* SECTION 1: FACE STRUCTURE */}
          {(activeTab === "all" || activeTab === "structure") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Primary Face Shape Card */}
              <div
                style={{
                  border: "1px solid #DDD9D3",
                  borderRadius: "3px 14px 3px 3px",
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  background: "#FFFFFF",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      color: "#4F2C1D",
                      fontSize: 16,
                    }}
                  >
                    <span style={{ marginRight: 6 }}>~</span>Face shape
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      border: "1px solid #DDD9D3",
                      borderRadius: 999,
                      padding: "2px 10px",
                      color: "#4F2C1D",
                      background: "#F4EDE4",
                      fontWeight: 500,
                    }}
                  >
                    {sh.name}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 8,
                    fontSize: 12,
                  }}
                >
                  <div>
                    <div style={{ color: "#7A6A60" }}>Length : width</div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {Math.max(1.15, Math.min(1.5, 1.3 + (result.z?.R || 0) * 0.08)).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#7A6A60" }}>Jaw : cheek</div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {Math.max(0.68, Math.min(0.92, 0.77 + (result.z?.J || 0) * 0.05)).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#7A6A60" }}>Confidence</div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {Math.round(p1 * 100)}%
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 13.5, color: "#5C4F47", lineHeight: 1.5 }}>
                  {sh.desc} {why}
                  {beardNote}
                </div>
              </div>

              {/* Facial Mesh Photo Canvas */}
              <div
                style={{
                  border: "1px solid #DDD9D3",
                  borderRadius: "6px 40px 6px 6px",
                  overflow: "hidden",
                  background: "#FBF8F3",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 11, color: "#7A6A60", letterSpacing: "0.08em" }}>
                  ON-DEVICE MAPPED LANDMARKS
                </div>
                <div style={{ width: "100%", maxHeight: 380, overflow: "hidden", display: "grid", placeItems: "center" }}>
                  <canvas ref={setCanvas} style={{ maxWidth: "100%", height: "auto", borderRadius: 8 }} />
                </div>
              </div>

              {/* Compare Bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#4F2C1D" }}>
                  Nine structural attributes vs population norms
                </span>
                <CompareBars z={result.z} />
              </div>
            </div>
          )}

          {/* SECTION 2: TOP RECOMMENDED HAIRCUTS */}
          {(activeTab === "all" || activeTab === "haircuts") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#4F2C1D",
                  }}
                >
                  Hair
                </span>
                <h3
                  style={{
                    margin: "4px 0 0",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 500,
                    fontSize: 20,
                  }}
                >
                  Top 3 cuts for your face
                </h3>
              </div>

              <BestCuts
                cuts={result.cuts}
                tryOn
              />

              {unlocked && (
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      fontSize: 16,
                      color: "#111111",
                      marginBottom: 10,
                    }}
                  >
                    Cuts to avoid
                  </div>
                  <PairList
                    items={result.avoid}
                    avoid
                    art="cut"
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: BEARD VERDICT (Available in All when unlocked, or directly in Beard tab) */}
          {(activeTab === "beard" || (activeTab === "all" && unlocked)) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#4F2C1D",
                  }}
                >
                  Facial Hair
                </span>
                <h3
                  style={{
                    margin: "4px 0 0",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 500,
                    fontSize: 20,
                  }}
                >
                  Beard verdict & styling
                </h3>
              </div>

              <BeardSection
                shape={result.key}
                beard={answers.beard}
                tweaks={result.beardTweaks}
              />
            </div>
          )}

          {/* SECTION 4: ROUTINE TAB DIRECT VIEW */}
          {activeTab === "routine" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#4F2C1D",
                  }}
                >
                  Grooming Routine
                </span>
                <h3
                  style={{
                    margin: "4px 0 0",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 500,
                    fontSize: 20,
                  }}
                >
                  Your age-bracket routine
                </h3>
              </div>
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
                  <span style={{ fontWeight: 600, color: "#4F2C1D" }}>Daily Steps</span>
                  <span style={{ fontSize: 12, color: "#7A6A60" }}>Bracket: {answers.age}</span>
                </div>
                <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                  {ROUTINES[answers.age].map((r) => (
                    <li key={r}>
                      <span>{r}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* UNLOCK GATE (If not unlocked yet) */}
          {!unlocked && (
            <div style={{ marginTop: 8 }}>
              <UnlockForm
                result={result}
                memberNumber={surpriseNumber}
                ageBracket={answers.age}
                skinConcern={answers.concern}
                onUnlock={unlock}
              />
            </div>
          )}

          {/* UNLOCKED FULL SUITE: Routine, Skin, PDF, Share, Rewards */}
          {unlocked && (
            <div ref={fullRef} style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 12 }}>
              {/* Daily Routine */}
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
                    Your age-bracket routine
                  </h3>
                  <span style={{ fontSize: 12, color: "#7A6A60" }}>Bracket: {answers.age}</span>
                </div>
                <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                  {ROUTINES[answers.age].map((r) => (
                    <li key={r}>
                      <span>{r}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <SkinRead data={null} />

              {/* Share & Download Section */}
              <ShareSection
                photo={photo}
                beardStyle={beardStyle}
                pdf={{
                  name: unlocked.name,
                  mobile: unlocked.mobile,
                  email: unlocked.email,
                  age: answers.age,
                  beard: answers.beard,
                  result,
                  skin: null,
                  code: unlocked.code,
                  faceImage: canvas,
                  tryOn: null,
                }}
              />

              {/* Founding Member Rewards & Position */}
              <Rewards
                code={unlocked.code}
                position={unlocked.position}
                referrals={unlocked.referrals}
                memberNumber={unlocked.memberNumber || surpriseNumber}
              />

              <button
                type="button"
                onClick={onRestart}
                className="btn-secondary"
                style={{ width: "100%", padding: "14px 0", marginTop: 8 }}
              >
                Scan another face
              </button>
            </div>
          )}
        </div>
      </div>
    </TryOnProvider>
  );
}
