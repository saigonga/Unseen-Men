"use client";

import { useEffect, useState } from "react";
import StepBar from "../StepBar";

interface ScanningProps {
  url: string;
}

interface StepItem {
  name: string;
  value: string;
  status: "done" | "now" | "wait";
}

export default function Scanning({ url }: ScanningProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(3);
  const [progressPct, setProgressPct] = useState(35);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setActiveStepIndex(4);
      setProgressPct(55);
    }, 700);

    const t2 = setTimeout(() => {
      setActiveStepIndex(5);
      setProgressPct(78);
    }, 1400);

    const t3 = setTimeout(() => {
      setActiveStepIndex(6);
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
    { name: "Landmark mapping", finalVal: "13 points" },
    { name: "Face shape", finalVal: "Oval · 0.93" },
    { name: "Jawline", finalVal: "Defined · 0.88" },
    { name: "Hair texture", finalVal: "Wavy · 0.91" },
    { name: "Beard growth", finalVal: "Classified" },
    { name: "Undertone and contrast", finalVal: "Warm / Medium" },
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
      <StepBar step={3} total={4} />

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
        <span style={{ fontWeight: 600 }}>classifying nine attributes.</span>
      </h1>

      {/* Visual scanning frame */}
      <div
        style={{
          position: "relative",
          border: "1px solid #ECECEA",
          borderRadius: 14,
          background: "#FCFCFB",
          overflow: "hidden",
          aspectRatio: "350/260",
        }}
      >
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.18,
              filter: "grayscale(100%)",
            }}
          />
        )}

        <div className="scanline" />

        <svg
          viewBox="0 0 350 260"
          role="img"
          aria-label="Line drawing of a face with landmarks and facial thirds being measured"
          style={{ width: "100%", height: "100%", display: "block", position: "relative" }}
        >
          <g stroke="#C9BFB3" strokeWidth="1" strokeDasharray="4 5">
            <line x1="30" y1="46" x2="230" y2="46" />
            <line x1="30" y1="98" x2="230" y2="98" />
            <line x1="30" y1="160" x2="230" y2="160" />
            <line x1="30" y1="232" x2="230" y2="232" />
            <line x1="130" y1="16" x2="130" y2="246" />
          </g>
          <path
            d="M130 28 C170 28 194 54 198 90 C202 122 198 144 192 162 C184 186 170 208 152 220 C142 227 136 228 130 228 C124 228 118 227 108 220 C90 208 76 186 68 162 C62 144 58 122 62 90 C66 54 90 28 130 28 Z"
            fill="none"
            stroke="#1B1815"
            strokeWidth="1.3"
          />
          <g fill="none" stroke="#1B1815" strokeWidth="1" strokeLinecap="round">
            <path d="M90 98 C102 93 114 94 122 98" />
            <path d="M138 98 C146 94 158 93 170 98" />
            <path d="M95 114 C102 109 114 109 120 114 C114 118 102 118 95 114 Z" />
            <path d="M140 114 C146 109 158 109 165 114 C158 118 146 118 140 114 Z" />
            <path d="M122 164 C127 169 133 169 138 164" />
            <path d="M114 190 C124 194 136 194 146 190" />
          </g>
          <g stroke="#4F2C1D" strokeWidth="1.2">
            <line x1="62" y1="130" x2="198" y2="130" />
          </g>
          <g fill="#FFFFFF" stroke="#1B1815" strokeWidth="1">
            <circle cx="130" cy="46" r="3" />
            <circle cx="62" cy="130" r="3" />
            <circle cx="198" cy="130" r="3" />
            <circle cx="130" cy="228" r="3" />
            <circle cx="96" cy="98" r="2.5" />
            <circle cx="164" cy="98" r="2.5" />
          </g>
          <g stroke="#1B1815" strokeWidth="0.8">
            <line x1="246" y1="46" x2="246" y2="98" />
            <line x1="246" y1="100" x2="246" y2="160" />
            <line x1="246" y1="162" x2="246" y2="232" />
            <line x1="240" y1="46" x2="252" y2="46" />
            <line x1="240" y1="98" x2="252" y2="98" />
            <line x1="240" y1="160" x2="252" y2="160" />
            <line x1="240" y1="232" x2="252" y2="232" />
          </g>
          <g fontFamily="var(--font-body)" fontSize="11.5" fill="#1B1815">
            <text x="258" y="70">
              Upper
            </text>
            <text x="258" y="128">
              Middle
            </text>
            <text x="258" y="194">
              Lower
            </text>
          </g>
          <g fontFamily="var(--font-body)" fontSize="10" fill="#4F2C1D">
            <text x="258" y="84">
              0.32
            </text>
            <text x="258" y="142">
              0.34
            </text>
            <text x="258" y="208">
              measuring
            </text>
          </g>
        </svg>
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
