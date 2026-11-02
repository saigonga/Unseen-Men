"use client";

import { useState } from "react";

interface LandingPageProps {
  onStart: () => void;
}

type SampleTab = "overview" | "structure";

const SHAPE_LIST: [string, string][] = [
  ["Round", "M20 6 C32 6 36 16 36 26 C36 38 30 46 20 46 C10 46 4 38 4 26 C4 16 8 6 20 6 Z"],
  ["Oval", "M20 3 C31 3 35 13 35 24 C35 37 28 47 20 47 C12 47 5 37 5 24 C5 13 9 3 20 3 Z"],
  ["Square", "M6 8 Q6 4 12 4 L28 4 Q34 4 34 8 L34 38 Q34 46 26 46 L14 46 Q6 46 6 38 Z"],
  ["Oblong", "M10 4 L30 4 Q34 4 34 10 L34 40 Q34 47 26 47 L14 47 Q6 47 6 40 L6 10 Q6 4 10 4 Z"],
  ["Heart", "M4 10 Q4 4 12 4 L28 4 Q36 4 36 10 C36 26 28 40 20 47 C12 40 4 26 4 10 Z"],
  ["Diamond", "M20 3 L33 20 C34 30 28 40 20 47 C12 40 6 30 7 20 Z"],
];

const MORE_ATTRS = [
  { code: "A03", name: "Forehead height", value: "Medium" },
  { code: "A04", name: "Hair texture", value: "Wavy" },
  { code: "A05", name: "Hair density", value: "Full" },
  { code: "A06", name: "Beard growth", value: "Medium" },
  { code: "A08", name: "Face width", value: "Medium, 135 to 140 mm frames" },
  { code: "A09", name: "Visible skin cues", value: "T-zone shine" },
];

export default function LandingPage({ onStart }: LandingPageProps) {
  const [selectedShape, setSelectedShape] = useState("Oval");
  const [activeTab, setActiveTab] = useState<SampleTab>("structure");

  return (
    <div
      style={{
        background: "#FFFFFF",
        color: "#111111",
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        fontSize: 15,
        lineHeight: 1.6,
        minHeight: "100vh",
      }}
    >
      {/* 1. Header */}
      <header
        style={{
          borderBottom: "1px solid #ECECEA",
          position: "sticky",
          top: 0,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(8px)",
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 32px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: "0.08em",
                color: "#4F2C1D",
              }}
            >
              NODD MEN
            </span>
            <span style={{ fontSize: 13, color: "#8A8A85" }}>Facial Analysis</span>
          </div>

          <nav
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 28,
              fontSize: 14,
              color: "#5F5F5B",
            }}
          >
            <a href="#how" style={{ color: "inherit" }}>
              How it works
            </a>
            <a href="#analysis" style={{ color: "inherit" }}>
              The analysis
            </a>
            <a href="#report" style={{ color: "inherit" }}>
              Sample report
            </a>
            <a href="#privacy" style={{ color: "inherit" }}>
              Privacy
            </a>
            <a href="#faq" style={{ color: "inherit" }}>
              FAQ
            </a>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 14 }}>
            <a href="https://noddmen.com" style={{ color: "inherit" }}>
              noddmen.com
            </a>
            <button
              type="button"
              onClick={onStart}
              className="btn-primary"
              style={{
                padding: "10px 18px",
                fontSize: 14,
              }}
            >
              Start analysis
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "72px 32px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 20,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #ECECEA",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 13,
            color: "#5F5F5B",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "#E0A526",
            }}
          />
          Free for Founding Members until 13 December 2026
        </span>

        <h1
          style={{
            margin: 0,
            fontFamily: "'Sora', sans-serif",
            fontWeight: 400,
            fontSize: "clamp(34px, 5vw, 60px)",
            lineHeight: 1.06,
            letterSpacing: "-0.035em",
            maxWidth: 900,
          }}
        >
          A precise analysis of your face,{" "}
          <span style={{ fontWeight: 600, color: "#4F2C1D" }}>built for men's grooming.</span>
        </h1>

        <p style={{ margin: 0, fontSize: 18, color: "#5F5F5B", maxWidth: 640 }}>
          One front-facing photo. Facial landmarks are mapped and nine structural attributes classified,
          then matched to the haircuts, frames, colours and beard styles that suit you.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            marginTop: 4,
          }}
        >
          <button
            type="button"
            onClick={onStart}
            className="btn-primary"
            style={{
              padding: "15px 26px",
              fontSize: 15,
            }}
          >
            Start my analysis
          </button>
          <a
            href="#report"
            className="btn-secondary"
            style={{
              padding: "14px 22px",
              fontSize: 15,
            }}
          >
            View a sample report
          </a>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px 28px",
            fontSize: 13,
            color: "#8A8A85",
            marginTop: 4,
          }}
        >
          <span>Photo deleted after analysis</span>
          <span>No age, ethnicity or attractiveness scoring</span>
          <span>Takes about 60 seconds</span>
        </div>
      </section>

      {/* 3. Facial Architecture Diagram */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{ border: "1px solid #ECECEA", borderRadius: 16, overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: "1px solid #ECECEA",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "#8A8A85",
            }}
          >
            <span>FRONT VIEW · SAMPLE ANALYSIS</span>
            <span>13 LANDMARKS · 6 RATIOS</span>
          </div>

          <svg
            viewBox="0 0 1136 580"
            role="img"
            aria-label="Front-view facial diagram with midline, facial thirds, bizygomatic and bigonial widths, gonial angle and lettered landmark callouts"
            style={{ width: "100%", height: "auto", display: "block", background: "#FCFCFB" }}
          >
            <g stroke="#EFEFEC" strokeWidth="1">
              <line x1="0" y1="145" x2="1136" y2="145" />
              <line x1="0" y1="290" x2="1136" y2="290" />
              <line x1="0" y1="435" x2="1136" y2="435" />
              <line x1="284" y1="0" x2="284" y2="580" />
              <line x1="568" y1="0" x2="568" y2="580" />
              <line x1="852" y1="0" x2="852" y2="580" />
            </g>
            <g stroke="#BDBDB8" strokeWidth="1" strokeDasharray="4 5">
              <line x1="300" y1="150" x2="836" y2="150" />
              <line x1="300" y1="230" x2="836" y2="230" />
              <line x1="300" y1="355" x2="836" y2="355" />
              <line x1="300" y1="500" x2="836" y2="500" />
              <line x1="568" y1="40" x2="568" y2="548" />
            </g>
            <path
              d="M568 70 C648 70 708 120 720 200 C730 260 724 310 710 350 C698 395 672 440 634 472 C610 492 590 500 568 500 C546 500 526 492 502 472 C464 440 438 395 426 350 C412 310 406 260 416 200 C428 120 488 70 568 70 Z"
              fill="none"
              stroke="#111111"
              strokeWidth="1.4"
            />
            <g fill="none" stroke="#111111" strokeWidth="1.1" strokeLinecap="round">
              <path d="M724 245 C744 240 752 262 748 290 C744 318 734 332 720 330" />
              <path d="M412 245 C392 240 384 262 388 290 C392 318 402 332 416 330" />
              <path d="M508 486 L504 556" />
              <path d="M628 486 L632 556" />
              <path d="M438 162 C478 112 658 112 698 162" stroke="#8A8A85" />
              <path d="M478 230 C503 220 533 222 548 230" />
              <path d="M588 230 C603 222 633 220 658 230" />
              <path d="M486 262 C500 252 526 252 540 262 C526 270 500 270 486 262 Z" />
              <path d="M596 262 C610 252 636 252 650 262 C636 270 610 270 596 262 Z" />
              <circle cx="513" cy="262" r="5.5" />
              <circle cx="623" cy="262" r="5.5" />
              <path d="M556 268 L552 336" stroke="#BDBDB8" />
              <path d="M544 352 C554 362 582 362 592 352" />
              <path d="M528 404 C553 412 583 412 608 404" />
              <path d="M540 414 C558 421 578 421 596 414" stroke="#8A8A85" />
            </g>
            <g stroke="#4F2C1D" strokeWidth="1.3">
              <line x1="413" y1="282" x2="723" y2="282" />
              <line x1="413" y1="274" x2="413" y2="290" />
              <line x1="723" y1="274" x2="723" y2="290" />
              <line x1="446" y1="414" x2="690" y2="414" />
              <line x1="446" y1="406" x2="446" y2="422" />
              <line x1="690" y1="406" x2="690" y2="422" />
            </g>
            <path d="M452 370 A40 40 0 0 0 478 444" fill="none" stroke="#4F2C1D" strokeWidth="1.3" />
            <g fill="#FFFFFF" stroke="#111111" strokeWidth="1.2">
              <circle cx="568" cy="150" r="4.5" />
              <circle cx="568" cy="230" r="4.5" />
              <circle cx="568" cy="355" r="4.5" />
              <circle cx="568" cy="500" r="4.5" />
              <circle cx="413" cy="282" r="4.5" />
              <circle cx="723" cy="282" r="4.5" />
              <circle cx="446" cy="414" r="4.5" />
              <circle cx="690" cy="414" r="4.5" />
              <circle cx="513" cy="262" r="4" fill="#4F2C1D" stroke="#4F2C1D" />
              <circle cx="623" cy="262" r="4" fill="#4F2C1D" stroke="#4F2C1D" />
            </g>
            <g fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#4F2C1D">
              <text x="735" y="286">BIZYGOMATIC 1.00</text>
              <text x="702" y="418">BIGONIAL 0.78</text>
              <text x="382" y="440">122°</text>
            </g>
            <g fontFamily="JetBrains Mono, monospace" fontSize="10.5" fill="#8A8A85">
              <text x="846" y="194">UPPER THIRD 0.32</text>
              <text x="846" y="296">MIDDLE THIRD 0.34</text>
              <text x="846" y="432">LOWER THIRD 0.34</text>
              <text x="576" y="52">MIDLINE</text>
            </g>
            <g fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#111111">
              <text x="578" y="146">TRICHION (Tr)</text>
              <text x="578" y="226">GLABELLA (G)</text>
              <text x="578" y="351">SUBNASALE (Sn)</text>
              <text x="578" y="496">MENTON (Me)</text>
              <text x="328" y="278">ZYGION (Zy)</text>
              <text x="372" y="410">GONION (Go)</text>
            </g>
          </svg>
        </div>
      </section>

      {/* 4. The Analysis Section (#analysis) */}
      <section
        id="analysis"
        style={{
          background: "#FAFAF9",
          borderTop: "1px solid #ECECEA",
          borderBottom: "1px solid #ECECEA",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "88px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 20,
            }}
          >
            <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#8A8A85", letterSpacing: "0.04em" }}>
                The analysis
              </span>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(28px, 4vw, 40px)",
                  lineHeight: 1.12,
                  letterSpacing: "-0.03em",
                }}
              >
                Nine attributes, each with{" "}
                <span style={{ fontWeight: 600 }}>a clear role</span> in your recommendations.
              </h2>
            </div>
            <p style={{ margin: 0, maxWidth: 380, color: "#5F5F5B" }}>
              Every result is shown against its full range, so it is clear where you sit and why a
              recommendation follows from it.
            </p>
          </div>

          {/* 3 Featured Attribute Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {/* Card 1: Jawline */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #ECECEA",
                borderRadius: 14,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", justifySelf: "space-between", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500, fontSize: 17 }}>
                  Jawline
                </span>
                <span
                  style={{
                    fontSize: 12,
                    border: "1px solid #ECECEA",
                    borderRadius: 999,
                    padding: "2px 10px",
                    color: "#4F2C1D",
                  }}
                >
                  Defined
                </span>
              </div>

              <svg
                viewBox="0 0 300 140"
                role="img"
                aria-label="Lower face contour with the jaw angle marked"
                style={{ width: "100%", height: "auto", background: "#FCFCFB", borderRadius: 8 }}
              >
                <path
                  d="M40 20 C46 60 62 92 96 116 C116 130 134 134 150 134 C166 134 184 130 204 116 C238 92 254 60 260 20"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="1.3"
                />
                <g stroke="#4F2C1D" strokeWidth="1.2">
                  <line x1="58" y1="74" x2="242" y2="74" />
                </g>
                <path d="M66 54 A26 26 0 0 0 82 98" fill="none" stroke="#4F2C1D" strokeWidth="1.2" />
                <g fill="#FFFFFF" stroke="#111111" strokeWidth="1.1">
                  <circle cx="58" cy="74" r="3.5" />
                  <circle cx="242" cy="74" r="3.5" />
                  <circle cx="150" cy="134" r="3.5" />
                </g>
                <text x="96" y="70" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#4F2C1D">
                  124°
                </text>
              </svg>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ position: "relative", height: 18 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 8,
                      height: 2,
                      background: "#ECECEA",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "58%",
                      top: 4,
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: "#4F2C1D",
                      transform: "translateX(-50%)",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11.5,
                    color: "#8A8A85",
                  }}
                >
                  <span>Rounded</span>
                  <span style={{ color: "#4F2C1D", fontWeight: 500 }}>Defined</span>
                  <span>Angular</span>
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "#5F5F5B",
                  borderTop: "1px solid #F0F0EE",
                  paddingTop: 12,
                }}
              >
                Drives beard length and neckline. A defined jaw needs only light shadow to maintain structure;
                heavy beards soften the angle.
              </p>
            </div>

            {/* Card 2: Facial thirds */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #ECECEA",
                borderRadius: 14,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500, fontSize: 17 }}>
                  Facial thirds
                </span>
                <span
                  style={{
                    fontSize: 12,
                    border: "1px solid #ECECEA",
                    borderRadius: 999,
                    padding: "2px 10px",
                    color: "#4F2C1D",
                  }}
                >
                  Balanced
                </span>
              </div>

              <div
                style={{
                  background: "#FCFCFB",
                  borderRadius: 8,
                  padding: "16px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {[
                  { name: "Upper", v: "0.32", pos: "45%" },
                  { name: "Middle", v: "0.34", pos: "55%" },
                  { name: "Lower", v: "0.34", pos: "55%" },
                ].map((th) => (
                  <div key={th.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "#5F5F5B",
                      }}
                    >
                      <span>{th.name}</span>
                      <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{th.v}</span>
                    </div>
                    <div style={{ position: "relative", height: 8 }}>
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: 3,
                          height: 2,
                          background: "#ECECEA",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: th.pos,
                          top: 0,
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: "#4F2C1D",
                          transform: "translateX(-50%)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11.5,
                  color: "#8A8A85",
                }}
              >
                <span>Short lower</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: "#4F2C1D",
                    }}
                  />
                  You
                </span>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "#5F5F5B",
                  borderTop: "1px solid #F0F0EE",
                  paddingTop: 12,
                }}
              >
                Drives fringe and volume. Balanced thirds suit most heights on top; no fringe correction is
                needed.
              </p>
            </div>

            {/* Card 3: Face shape */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #ECECEA",
                borderRadius: 14,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500, fontSize: 17 }}>
                  Face shape
                </span>
                <span
                  style={{
                    fontSize: 12,
                    border: "1px solid #ECECEA",
                    borderRadius: 999,
                    padding: "2px 10px",
                    color: "#4F2C1D",
                  }}
                >
                  {selectedShape}
                </span>
              </div>

              <div
                style={{
                  background: "#FCFCFB",
                  borderRadius: 8,
                  padding: "14px 10px",
                  display: "grid",
                  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                  gap: 4,
                }}
              >
                {SHAPE_LIST.map(([name, d]) => {
                  const on = selectedShape === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setSelectedShape(name)}
                      style={{
                        background: on ? "#F4EDE4" : "transparent",
                        border: "none",
                        borderRadius: 6,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 0",
                        cursor: "pointer",
                      }}
                    >
                      <svg width="30" height="38" viewBox="0 0 40 50" aria-hidden="true">
                        <path
                          d={d}
                          fill="none"
                          stroke={on ? "#4F2C1D" : "#BDBDB8"}
                          strokeWidth="1.6"
                        />
                      </svg>
                      <span
                        style={{
                          fontSize: 10.5,
                          color: on ? "#4F2C1D" : "#8A8A85",
                          fontWeight: on ? 600 : 400,
                        }}
                      >
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 8,
                  fontSize: 12.5,
                }}
              >
                <div style={{ border: "1px solid #F0F0EE", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ color: "#8A8A85" }}>Length : width</div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace" }}>1.31</div>
                </div>
                <div style={{ border: "1px solid #F0F0EE", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ color: "#8A8A85" }}>Confidence</div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace" }}>0.93</div>
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "#5F5F5B",
                  borderTop: "1px solid #F0F0EE",
                  paddingTop: 12,
                }}
              >
                Drives haircuts and frames. Oval proportions take most cuts; textured crops and side parts suit
                best.
              </p>
            </div>
          </div>

          {/* 6 Grid Attributes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              border: "1px solid #ECECEA",
              borderRadius: 14,
              background: "#FFFFFF",
              overflow: "hidden",
            }}
          >
            {MORE_ATTRS.map((m) => (
              <div
                key={m.code}
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid #F0F0EE",
                  borderRight: "1px solid #F0F0EE",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "baseline",
                }}
              >
                <span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: "#8A8A85",
                      marginRight: 10,
                    }}
                  >
                    {m.code}
                  </span>
                  {m.name}
                </span>
                <span style={{ fontSize: 13, color: "#4F2C1D" }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Sample Report Section (#report) */}
      <section
        id="report"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "88px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 36,
        }}
      >
        <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#8A8A85", letterSpacing: "0.04em" }}>Sample report</span>
          <h2
            style={{
              margin: 0,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 40px)",
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
            }}
          >
            Every finding comes with{" "}
            <span style={{ fontWeight: 600 }}>an explanation and an action.</span>
          </h2>
        </div>

        <div
          style={{
            border: "1px solid #ECECEA",
            borderRadius: 16,
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "240px minmax(0, 1fr)",
            boxShadow: "0 24px 48px -32px rgba(17,17,17,0.25)",
          }}
        >
          {/* Sidebar */}
          <aside
            style={{
              background: "#FAFAF9",
              borderRight: "1px solid #ECECEA",
              padding: "22px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontSize: 14,
            }}
          >
            <div
              style={{
                padding: "0 8px 14px",
                borderBottom: "1px solid #ECECEA",
                marginBottom: 10,
              }}
            >
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500 }}>Rohan's Report</div>
              <div style={{ fontSize: 12, color: "#8A8A85" }}>29 October 2026 · Member #0347</div>
            </div>

            {(
              [
                ["overview", "Overview"],
                ["structure", "Face structure"],
              ] as [SampleTab, string][]
            ).map(([t, label]) => {
              const active = activeTab === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 6,
                    background: active ? "#FFFFFF" : "transparent",
                    border: active ? "1px solid #ECECEA" : "1px solid transparent",
                    fontWeight: active ? 500 : 400,
                    color: active ? "#111111" : "#5F5F5B",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 14,
                  }}
                >
                  {label}
                </button>
              );
            })}

            <div
              style={{
                marginTop: "auto",
                fontSize: 11.5,
                color: "#8A8A85",
                padding: "12px 8px 0",
                borderTop: "1px solid #ECECEA",
              }}
            >
              Sample data. Style guidance, not a medical assessment.
            </div>
          </aside>

          {/* Report Content Body */}
          <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 500,
                  fontSize: 22,
                  textTransform: "capitalize",
                }}
              >
                {activeTab === "structure" ? "Face structure" : "Overview"}
              </h3>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "#8A8A85",
                }}
              >
                SECTION 2 OF 6
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {/* Width profile chart */}
              <div
                style={{
                  border: "1px solid #ECECEA",
                  borderRadius: 12,
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    color: "#8A8A85",
                  }}
                >
                  WIDTH PROFILE, RELATIVE TO CHEEKBONES
                </div>
                <svg
                  viewBox="0 0 320 150"
                  role="img"
                  aria-label="Bar chart of forehead, cheekbone and jaw widths relative to cheekbone width, with a typical oval band"
                  style={{ width: "100%", height: "auto" }}
                >
                  <g stroke="#F0F0EE" strokeWidth="1">
                    <line x1="90" y1="10" x2="90" y2="130" />
                    <line x1="160" y1="10" x2="160" y2="130" />
                    <line x1="230" y1="10" x2="230" y2="130" />
                    <line x1="300" y1="10" x2="300" y2="130" />
                  </g>
                  <rect x="216" y="14" width="56" height="112" fill="#EFE7DD" opacity="0.7" />
                  <g fill="#4F2C1D">
                    <rect x="90" y="22" width="174" height="16" rx="2" />
                    <rect x="90" y="62" width="210" height="16" rx="2" />
                    <rect x="90" y="102" width="162" height="16" rx="2" />
                  </g>
                  <g fontFamily="Space Grotesk, sans-serif" fontSize="12" fill="#5F5F5B">
                    <text x="0" y="34">
                      Forehead
                    </text>
                    <text x="0" y="74">
                      Cheekbones
                    </text>
                    <text x="0" y="114">
                      Jaw
                    </text>
                  </g>
                  <g fontFamily="JetBrains Mono, monospace" fontSize="10.5" fill="#111111">
                    <text x="270" y="34">
                      0.83
                    </text>
                    <text x="304" y="74" fill="#5F5F5B">
                      1.00
                    </text>
                    <text x="258" y="114">
                      0.77
                    </text>
                  </g>
                  <g fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="#8A8A85">
                    <text x="86" y="146">
                      0.4
                    </text>
                    <text x="154" y="146">
                      0.6
                    </text>
                    <text x="224" y="146">
                      0.8
                    </text>
                    <text x="292" y="146">
                      1.0
                    </text>
                  </g>
                </svg>
                <div style={{ fontSize: 12, color: "#8A8A85" }}>
                  Shaded band: typical range for an oval face.
                </div>
              </div>

              {/* Explanation */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    color: "#8A8A85",
                  }}
                >
                  EXPLANATION
                </div>
                <p style={{ margin: 0, color: "#333330" }}>
                  Your cheekbones are the widest point of the face, with the forehead slightly narrower and
                  the jaw clearly defined at 0.77 of cheekbone width. Combined with a length-to-width ratio of
                  1.31, this places you firmly in the oval range.
                </p>
                <p style={{ margin: 0, color: "#333330" }}>
                  In practice, most haircut shapes work. Volume on top keeps the length in proportion; very
                  wide sides would hide the cheekbone line.
                </p>
              </div>
            </div>

            {/* Recommended Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: "#8A8A85",
                }}
              >
                RECOMMENDED ACTIONS
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  {
                    title: "Textured crop",
                    cat: "Hairstyle",
                    upkeep: "Low",
                    basis: "Oval shape, balanced thirds",
                    note: "Ask for: scissor-cut top, number 2 on the sides.",
                  },
                  {
                    title: "Matte finish SPF fluid",
                    cat: "Skin routine",
                    upkeep: "Daily",
                    basis: "Balanced tone, light T-zone",
                    note: "Apply 2 pumps every morning after washing with cool water.",
                  },
                  {
                    title: "Short boxed beard",
                    cat: "Beard",
                    upkeep: "Medium",
                    basis: "Defined jaw, medium growth",
                    note: "Keep cheek line low and the neckline one finger above the Adam’s apple.",
                  },
                ].map((a) => (
                  <div
                    key={a.title}
                    style={{
                      border: "1px solid #ECECEA",
                      borderRadius: 12,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500, fontSize: 15.5 }}>
                      {a.title}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto minmax(0, 1fr)",
                        gap: "4px 12px",
                        fontSize: 12.5,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10.5,
                          color: "#8A8A85",
                          paddingTop: 2,
                        }}
                      >
                        CATEGORY
                      </span>
                      <span>{a.cat}</span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10.5,
                          color: "#8A8A85",
                          paddingTop: 2,
                        }}
                      >
                        UPKEEP
                      </span>
                      <span>{a.upkeep}</span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10.5,
                          color: "#8A8A85",
                          paddingTop: 2,
                        }}
                      >
                        BASED ON
                      </span>
                      <span>{a.basis}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "#5F5F5B",
                        background: "#FAFAF9",
                        borderRadius: 8,
                        padding: "8px 10px",
                      }}
                    >
                      {a.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works Section (#how) */}
      <section id="how" style={{ borderTop: "1px solid #ECECEA" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "88px 32px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 64,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#8A8A85", letterSpacing: "0.04em" }}>How it works</span>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 400,
                fontSize: "clamp(28px, 4vw, 40px)",
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
              }}
            >
              Three steps, <span style={{ fontWeight: 600 }}>about a minute.</span>
            </h2>
            <div
              style={{
                marginTop: 16,
                border: "1px dashed #D9D9D6",
                borderRadius: 14,
                padding: 22,
                display: "flex",
                gap: 18,
                alignItems: "center",
              }}
            >
              <svg width="64" height="80" viewBox="0 0 64 80" aria-hidden="true">
                <rect x="1" y="1" width="62" height="78" rx="8" fill="#FAFAF9" stroke="#D9D9D6" />
                <path
                  d="M32 16 C44 16 49 25 49 36 C49 49 41 60 32 60 C23 60 15 49 15 36 C15 25 20 16 32 16 Z"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="1.2"
                />
              </svg>
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10.5,
                    letterSpacing: "0.08em",
                    color: "#8A8A85",
                  }}
                >
                  POSE REQUIRED
                </div>
                <div style={{ fontWeight: 500 }}>Front face, neutral expression</div>
                <div style={{ fontSize: 13, color: "#5F5F5B" }}>Natural light, glasses off, forehead clear.</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {[
              {
                num: "01",
                title: "Pose & capture",
                desc: "Front-facing selfie in natural light. Glasses and caps off. Takes 15 seconds.",
              },
              {
                num: "02",
                title: "Landmark mapping",
                desc: "Forty-six key points are mapped across the jaw, cheekbones, brow, nose and chin.",
              },
              {
                num: "03",
                title: "Grooming report",
                desc: "Your face shape, top three haircuts, beard guide, frame styles and colour recommendations.",
              },
            ].map((step) => (
              <div key={step.num} style={{ display: "flex", gap: 20 }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    color: "#4F2C1D",
                    fontWeight: 500,
                  }}
                >
                  {step.num}
                </span>
                <div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500, fontSize: 18 }}>
                    {step.title}
                  </div>
                  <p style={{ margin: "4px 0 0", color: "#5F5F5B" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Privacy Section (#privacy) */}
      <section
        id="privacy"
        style={{
          background: "#FAFAF9",
          borderTop: "1px solid #ECECEA",
          borderBottom: "1px solid #ECECEA",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "72px 32px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 64,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#8A8A85", letterSpacing: "0.04em" }}>Privacy</span>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 400,
                fontSize: 36,
                lineHeight: 1.14,
                letterSpacing: "-0.03em",
              }}
            >
              Your photo is used once,{" "}
              <span style={{ fontWeight: 600 }}>then deleted.</span>
            </h2>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #ECECEA",
              borderRadius: 14,
              overflow: "hidden",
              fontSize: 14.5,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px minmax(0, 1fr)",
                padding: "16px 20px",
                borderBottom: "1px solid #F0F0EE",
              }}
            >
              <span style={{ color: "#8A8A85" }}>Photo</span>
              <span>Analysed once, then discarded. Never stored.</span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px minmax(0, 1fr)",
                padding: "16px 20px",
                borderBottom: "1px solid #F0F0EE",
              }}
            >
              <span style={{ color: "#8A8A85" }}>Kept</span>
              <span>Written results only, such as "oval face, wavy hair".</span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px minmax(0, 1fr)",
                padding: "16px 20px",
                borderBottom: "1px solid #F0F0EE",
              }}
            >
              <span style={{ color: "#8A8A85" }}>Identifiers</span>
              <span>No account required for the analysis.</span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px minmax(0, 1fr)",
                padding: "16px 20px",
              }}
            >
              <span style={{ color: "#8A8A85" }}>Security</span>
              <span>Landmark mapping runs on your device or in memory.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Questions (FAQ) Section (#faq) */}
      <section
        id="faq"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "72px 32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 64,
        }}
      >
        <h2 style={{ margin: 0, fontFamily: "'Sora', sans-serif", fontWeight: 400, fontSize: 36, letterSpacing: "-0.03em" }}>
          Questions
        </h2>

        <div>
          <details style={{ borderTop: "1px solid #ECECEA", padding: "18px 0" }}>
            <summary style={{ fontWeight: 500, fontSize: 16 }}>Is the analysis free?</summary>
            <p style={{ margin: "8px 0 0", color: "#5F5F5B" }}>
              Yes. The analysis, the report and every recommendation until launch cost nothing.
            </p>
          </details>

          <details style={{ borderTop: "1px solid #ECECEA", padding: "18px 0" }}>
            <summary style={{ fontWeight: 500, fontSize: 16 }}>How accurate is it?</summary>
            <p style={{ margin: "8px 0 0", color: "#5F5F5B" }}>
              Each result shows a confidence level. If a photo is unclear, a retake is requested rather than
              a guess.
            </p>
          </details>

          <details style={{ borderTop: "1px solid #ECECEA", padding: "18px 0" }}>
            <summary style={{ fontWeight: 500, fontSize: 16 }}>Can I join without the camera?</summary>
            <p style={{ margin: "8px 0 0", color: "#5F5F5B" }}>
              Yes. Select a face shape from a reference chart and receive the same program.
            </p>
          </details>

          <details style={{ borderTop: "1px solid #ECECEA", padding: "18px 0" }}>
            <summary style={{ fontWeight: 500, fontSize: 16 }}>What happens to my photo?</summary>
            <p style={{ margin: "8px 0 0", color: "#5F5F5B" }}>
              It is discarded the moment landmarks are measured. We retain written proportions only.
            </p>
          </details>

          <details style={{ borderTop: "1px solid #ECECEA", padding: "18px 0" }}>
            <summary style={{ fontWeight: 500, fontSize: 16 }}>When does Nodd Men launch?</summary>
            <p style={{ margin: "8px 0 0", color: "#5F5F5B" }}>
              The store opens to everyone at 10 am on Sunday 13 December 2026.
            </p>
          </details>

          <details style={{ borderTop: "1px solid #ECECEA", borderBottom: "1px solid #ECECEA", padding: "18px 0" }}>
            <summary style={{ fontWeight: 500, fontSize: 16 }}>What are Founding Members?</summary>
            <p style={{ margin: "8px 0 0", color: "#5F5F5B" }}>
              Men who complete the analysis receive a permanent member number and priority access to the product pre-order.
            </p>
          </details>
        </div>
      </section>

      {/* 9. Closing CTA Section */}
      <section style={{ borderTop: "1px solid #ECECEA" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "72px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 400,
              fontSize: 40,
              letterSpacing: "-0.03em",
            }}
          >
            Know your face{" "}
            <span style={{ fontWeight: 600, color: "#4F2C1D" }}>before you style it.</span>
          </h2>
          <p style={{ margin: 0, color: "#5F5F5B" }}>Founding Member numbers close on 13 December 2026.</p>
          <button
            type="button"
            onClick={onStart}
            className="btn-primary"
            style={{
              padding: "15px 28px",
              fontSize: 15,
            }}
          >
            Start my analysis
          </button>
        </div>
      </section>

      {/* 10. Footer */}
      <footer style={{ borderTop: "1px solid #ECECEA" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "24px 32px 36px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 12.5,
            color: "#8A8A85",
          }}
        >
          <span>
            Recommendations are style guidance generated with AI and are not medical advice. Results shown
            are sample data.
          </span>
          <span style={{ display: "flex", gap: 20 }}>
            <a href="#" style={{ color: "#8A8A85" }}>
              Privacy policy
            </a>
            <a href="https://noddmen.com" style={{ color: "#8A8A85" }}>
              noddmen.com
            </a>
            <span>© 2026 Grit Sense Pvt Ltd</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
