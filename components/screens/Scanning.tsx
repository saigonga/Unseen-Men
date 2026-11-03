"use client";

import { useEffect, useRef, useState } from "react";
import StepBar from "../StepBar";
import { drawOverlay } from "@/lib/overlay";
import type { Photo } from "../FaceScanApp";

interface ScanningProps {
  url?: string;
  photo?: Photo;
}

interface StepItem {
  name: string;
  value: string;
  status: "done" | "now" | "wait";
}

export default function Scanning({ url, photo }: ScanningProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(2);
  const [progressPct, setProgressPct] = useState(35);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && photo?.img && photo?.det) {
      drawOverlay(canvasRef.current, photo.img, photo.det, true);
    }
  }, [photo]);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setActiveStepIndex(3);
      setProgressPct(55);
    }, 700);

    const t2 = setTimeout(() => {
      setActiveStepIndex(4);
      setProgressPct(78);
    }, 1400);

    const t3 = setTimeout(() => {
      setActiveStepIndex(5);
      setProgressPct(100);
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const baseSteps: { name: string; finalVal: string }[] = [
    { name: "Photo quality check", finalVal: "Passed" },
    { name: "Landmark mapping", finalVal: "68 points" },
    { name: "Face shape architecture", finalVal: "Computed" },
    { name: "Jawline & gonial angle", finalVal: "Measured" },
    { name: "Facial thirds", finalVal: "Calculated" },
    { name: "Proportions vs population norms", finalVal: "Indexed" },
  ];

  const steps: StepItem[] = baseSteps.map((s, idx) => {
    if (idx < activeStepIndex) {
      return { name: s.name, value: s.finalVal, status: "done" };
    }
    if (idx === activeStepIndex) {
      return { name: s.name, value: "In progress", status: "now" };
    }
    return { name: s.name, value: "Queued", status: "wait" };
  });

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        minHeight: 740,
        boxSizing: "border-box",
        background: "#FFFFFF",
        color: "#1B1815",
        padding: "18px 20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <StepBar step={3} total={3} />

      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-heading)",
          fontWeight: 400,
          fontSize: 24,
          lineHeight: 1.18,
          letterSpacing: "-0.03em",
          color: "#4F2C1D",
        }}
      >
        Mapping landmarks and{" "}
        <span style={{ fontWeight: 600 }}>classifying your architecture.</span>
      </h1>

      {/* Visual scanning frame — Real user photo with real mapped landmarks, perfectly centered */}
      <div
        style={{
          position: "relative",
          border: "1px solid #ECECEA",
          borderRadius: 14,
          background: "#111111",
          overflow: "hidden",
          aspectRatio: "350/260",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {photo?.img && photo?.det ? (
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="Scanning photo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )
        )}

        {/* Animated Laser Scanline moving down */}
        <div className="scanline" />

        {/* Live HUD telemetry badges */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.08em",
              color: "#FFFFFF",
              background: "rgba(0, 0, 0, 0.68)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              padding: "3px 8px",
              borderRadius: 4,
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            MAPPING REAL LANDMARKS
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.08em",
              color: "#E0A526",
              background: "rgba(0, 0, 0, 0.68)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              padding: "3px 8px",
              borderRadius: 4,
              border: "1px solid rgba(224, 165, 38, 0.3)",
            }}
          >
            {activeStepIndex >= 4 ? "ARCHITECTURE COMPUTED" : "SCANNING"}
          </span>
        </div>

        {/* Bottom HUD info */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            pointerEvents: "none",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9.5,
            color: "rgba(255, 255, 255, 0.8)",
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            padding: "4px 8px",
            borderRadius: 4,
          }}
        >
          <span>POINTS: 68 MAPPED</span>
          <span>FACIAL PROPORTIONS: 100% MATCHED</span>
        </div>
      </div>

      {/* Checklist box */}
      <div
        style={{
          border: "1px solid #ECECEA",
          borderRadius: 12,
          fontSize: 13.5,
          overflow: "hidden",
        }}
      >
        {steps.map((s, i) => {
          const isDone = s.status === "done";
          const isNow = s.status === "now";

          return (
            <div
              key={s.name}
              style={{
                display: "grid",
                gridTemplateColumns: "18px minmax(0, 1fr) auto",
                gap: 10,
                alignItems: "center",
                padding: "8px 14px",
                borderTop: i === 0 ? "none" : "1px solid #F0F0EE",
                color: isDone || isNow ? "#111111" : "#8A8A85",
                background: isNow ? "#FCFCFB" : "#FFFFFF",
                transition: "background 0.2s ease",
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  boxSizing: "border-box",
                  border: isDone
                    ? "1px solid #111111"
                    : isNow
                    ? "1px solid #4F2C1D"
                    : "1px solid #D9D9D6",
                  background: isDone ? "#111111" : "#FFFFFF",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isDone && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 999,
                      background: "#FFFFFF",
                    }}
                  />
                )}
                {isNow && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: "#4F2C1D",
                    }}
                  />
                )}
              </span>
              <span style={{ fontWeight: isNow ? 500 : 400 }}>{s.name}</span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontVariantNumeric: "tabular-nums",
                  fontSize: 11,
                  color: isNow ? "#4F2C1D" : "#7A6A60",
                  fontWeight: isNow ? 600 : 400,
                }}
              >
                {s.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Footer */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 2, background: "#DDD9D3", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: 2,
              width: `${progressPct}%`,
              background: "#4F2C1D",
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12.5,
            color: "#7A6A60",
          }}
        >
          <span>{Math.min(9, Math.round((progressPct / 100) * 9))} of 9 attributes</span>
          <span>Photo saved to your profile</span>
        </div>
      </div>
    </div>
  );
}
