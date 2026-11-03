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
import FacialThirdsSection from "../results/FacialThirdsSection";
import EyewearSection from "../results/EyewearSection";
import BarberGuideSection from "../results/BarberGuideSection";
import ColorPaletteSection from "../results/ColorPaletteSection";
import WhatsAppConcierge from "../results/WhatsAppConcierge";
import { getFacialThirds, BARBER_GUIDE_BY_SHAPE, EYEWEAR_BY_SHAPE, UNDERTONE_PALETTES } from "@/lib/styling";
import type { Answers } from "./Questions";
import type { Photo } from "../FaceScanApp";
import type { UserLeadProfile } from "./RegisterLead";

interface Unlocked extends Lead {
  code: string;
  position: number;
  referrals: number;
}

type ReportTab = "all" | "structure" | "frames" | "haircuts" | "beard" | "colour" | "routine";

function extractJpeg(img: HTMLImageElement): string | null {
  try {
    const c = document.createElement("canvas");
    const nw = img.naturalWidth || img.width;
    const nh = img.naturalHeight || img.height;
    if (!nw || !nh) return null;
    const maxW = 800;
    const scale = nw > maxW ? maxW / nw : 1;
    c.width = Math.round(nw * scale);
    c.height = Math.round(nh * scale);
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.85);
  } catch {
    return null;
  }
}

export default function Results({
  answers,
  photo,
  result,
  userLead,
  onRestart,
}: {
  answers: Answers;
  photo: Photo;
  result: FaceResult;
  userLead?: UserLeadProfile | null;
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

  // Auto-register lead when upfront details were provided
  useEffect(() => {
    if (userLead && !unlocked) {
      const photoBase64 = extractJpeg(photo.img) || (photo.url.startsWith("data:") ? photo.url : null);
      fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userLead.name,
          contact: userLead.phone,
          phone: userLead.phone,
          email: userLead.email,
          ageBracket: answers.age,
          faceShape: sh.name,
          skinConcern: answers.concern,
          photoBase64,
          memberNumber: surpriseNumber,
          styling: {
            facialThirds: getFacialThirds(photo.det.P),
            barberGuide: BARBER_GUIDE_BY_SHAPE[result.key],
            eyewear: EYEWEAR_BY_SHAPE[result.key],
            palette: UNDERTONE_PALETTES.warm_golden,
            topCuts: result.cuts,
            avoidCuts: result.avoid,
          },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            setUnlocked({
              name: data.name || userLead.name,
              mobile: userLead.phone,
              email: userLead.email,
              code: data.referralCode || newCode(),
              position: data.waitlistPosition || 1,
              referrals: data.referralCount || 0,
              memberNumber: data.memberNumber || parseInt(surpriseNumber, 10),
            });
          }
        })
        .catch((err) => console.warn("Auto-register fallback:", err));
    }
  }, [userLead, unlocked, photo, answers, sh.name, result, surpriseNumber]);

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
              UNSEEN MEN · THE EDIT
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
              {unlocked ? `${unlocked.name}'s Lookbook` : "Facial Analysis Lookbook"}
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
              gap: 12,
              fontSize: 13,
              color: "#8A8A85",
              borderTop: "1px solid #F0F0EE",
              paddingTop: 10,
              paddingBottom: 2,
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
            }}
          >
            {(
              [
                ["all", "All Report"],
                ["structure", "01 Face"],
                ["frames", "02 Frames"],
                ["haircuts", "03 Hair"],
                ["beard", "04 Grooming"],
                ["colour", "05 Colour"],
                ["routine", "Routine"],
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
                    padding: "6px 4px 8px",
                    color: active ? "#111111" : "#8A8A85",
                    fontWeight: active ? 600 : 400,
                    borderBottom: active ? "2px solid #111111" : "2px solid transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Area */}
        <div style={{ padding: "20px clamp(14px, 3.5vw, 24px) 32px", display: "flex", flexDirection: "column", gap: 20 }}>
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
                    <span style={{ marginRight: 6 }}>~</span>Face Shape
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

              {/* 01 Facial Thirds & Proportions Section */}
              <FacialThirdsSection
                shapeKey={result.key}
                result={result}
                points={photo.det.P}
              />

              {/* Facial Mesh Photo Canvas */}
              <div
                style={{
                  border: "1px solid #DDD9D3",
                  borderRadius: "6px 20px 6px 6px",
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

          {/* SECTION 2: EYEWEAR & FRAMES */}
          {(activeTab === "all" || activeTab === "frames") && (
            <EyewearSection shapeKey={result.key} />
          )}

          {/* SECTION 3: TOP RECOMMENDED HAIRCUTS & BARBER SPECIFICATIONS */}
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
                  03 THE HAIR · HAIRCUTS
                </span>
                <h3
                  style={{
                    margin: "4px 0 0",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 500,
                    fontSize: 20,
                  }}
                >
                  Curated Cuts for Your Architecture
                </h3>
              </div>

              <BestCuts
                cuts={result.cuts}
                tryOn
              />

              {/* Barber Instruction Card */}
              <BarberGuideSection shapeKey={result.key} />

              {unlocked && (
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      fontSize: 16,
                      color: "#111111",
                      marginBottom: 10,
                    }}
                  >
                    Haircuts to Avoid
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

          {/* SECTION 4: BEARD VERDICT */}
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
                  04 THE GROOMING · FACIAL HAIR
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

          {/* SECTION 5: COLOUR & WARDROBE PALETTES */}
          {(activeTab === "colour" || (activeTab === "all" && unlocked)) && (
            <ColorPaletteSection palette={UNDERTONE_PALETTES.warm_golden} />
          )}

          {/* SECTION 6: ROUTINE */}
          {(activeTab === "routine" || (activeTab === "all" && unlocked)) && (
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

          {/* UNLOCK GATE (Fallback only if user bypassed lead registration) */}
          {!unlocked && (
            <div style={{ marginTop: 8 }}>
              <UnlockForm
                result={result}
                memberNumber={surpriseNumber}
                ageBracket={answers.age}
                skinConcern={answers.concern}
                photo={photo}
                onUnlock={unlock}
              />
            </div>
          )}

          {/* UNLOCKED FULL SUITE: WhatsApp Concierge, Skin, PDF, Share, Rewards */}
          {unlocked && (
            <div ref={fullRef} style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 12 }}>
              {/* WhatsApp Stylist Concierge */}
              <WhatsAppConcierge
                name={unlocked.name}
                memberNumber={unlocked.memberNumber || surpriseNumber}
                faceShape={sh.name}
                referralCode={unlocked.code}
              />

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
