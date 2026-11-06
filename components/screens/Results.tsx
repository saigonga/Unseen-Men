"use client";

import { useEffect, useRef, useState } from "react";
import { SHAPES } from "@/lib/content";
import type { FaceResult } from "@/lib/faceShape";
import { drawOverlay } from "@/lib/overlay";
import { newCode } from "@/lib/referral";
import CompareBars from "../results/CompareBars";
import { TryOnProvider } from "../results/TryOnContext";
import SkinRead from "../results/SkinRead";
import ShareSection from "../results/ShareSection";
import Rewards from "../results/Rewards";
import FacialThirdsSection from "../results/FacialThirdsSection";
import WhatsAppConcierge from "../results/WhatsAppConcierge";
import CreativeStudio from "../results/CreativeStudio";
import { getFacialThirds } from "@/lib/styling";
import { getPhotoDataUrl } from "@/lib/photoData";
import type { Answers } from "./Questions";
import type { Photo } from "../FaceScanApp";
import type { UserLeadProfile } from "./RegisterLead";

interface Unlocked {
  name: string;
  mobile: string;
  email: string;
  code: string;
  position: number;
  referrals: number;
  memberNumber: number;
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
  const [surpriseNumber] = useState(() => String(300 + Math.floor(Math.random() * 200)).padStart(4, "0"));
  const [photoPublicUrl, setPhotoPublicUrl] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<Unlocked>(() => ({
    name: userLead?.name || "Founding Member",
    mobile: userLead?.phone || "",
    email: userLead?.email || "",
    code: newCode(),
    position: 1,
    referrals: 0,
    memberNumber: parseInt(surpriseNumber, 10),
  }));
  const fullRef = useRef<HTMLDivElement>(null);

  const sh = SHAPES[result.key];
  const p1 = result.ranked[0][1];
  const beardStyle = sh.beard.styles[0][0];

  useEffect(() => {
    if (canvas) drawOverlay(canvas, photo.img, photo.det, true);
  }, [canvas, photo]);

  // Auto-register lead when upfront details were provided
  useEffect(() => {
    if (userLead) {
      const getBase64 = async () => photo.dataUrl || (await getPhotoDataUrl(photo));
      getBase64().then((photoBase64) => {
        fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userLead.name,
            contact: userLead.phone,
            phone: userLead.phone,
            email: userLead.email,
            ageBracket: userLead.age || answers.age,
            beard: userLead.beard || answers.beard,
            faceShape: sh.name,
            skinConcern: userLead.concern || answers.concern,
            photoBase64,
            memberNumber: surpriseNumber,
            styling: {
              facialThirds: getFacialThirds(photo.det.P),
            },
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.ok) {
              if (data.photoUrl) setPhotoPublicUrl(data.photoUrl);
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
      });
    }
  }, [userLead, photo, answers, sh.name, surpriseNumber]);

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
              {unlocked ? `${unlocked.name}'s Facial Architecture` : "Facial Architecture & Proportions"}
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
        </div>

        {/* Report Content Body — Focused strictly on Facial Architecture & Specifications */}
        <div style={{ padding: "20px clamp(14px, 3.5vw, 24px) 32px", display: "flex", flexDirection: "column", gap: 20 }}>
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

            {/* FULL SUITE: WhatsApp Concierge, Skin, PDF, Share, Rewards */}
            <div ref={fullRef} style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 12 }}>
              {/* WhatsApp Stylist Concierge */}
              <WhatsAppConcierge
                name={unlocked.name}
                memberNumber={unlocked.memberNumber || surpriseNumber}
                faceShape={sh.name}
                referralCode={unlocked.code}
              />

              {/* Creative Studio (Higgsfield AI) */}
              <CreativeStudio
                photoUrl={photoPublicUrl || photo.dataUrl || photo.url}
                faceShape={sh.name}
                cutName={sh.best[0]?.[0] || "Textured Crop"}
                userName={unlocked.name}
                memberNumber={unlocked.memberNumber || surpriseNumber}
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
        </div>
      </div>
    </TryOnProvider>
  );
}
