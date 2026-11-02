"use client";

import { useState } from "react";
import StepBar from "../StepBar";
import type { AgeBracket, Beard, Concern } from "@/lib/content";

export interface Answers {
  age: AgeBracket;
  beard: Beard;
  concern: Concern | null;
  haircutFrequency?: string;
}

const CUT_FREQUENCIES = [
  { id: "2weeks", label: "Every 2 weeks" },
  { id: "3-4weeks", label: "Every 3 to 4 weeks" },
  { id: "2months", label: "Every 2 months" },
  { id: "less", label: "Less often" },
];

const BEARDS: { id: Beard; label: string; desc: string }[] = [
  { id: "none", label: "Clean shave", desc: "No facial hair right now" },
  { id: "stubble", label: "Stubble", desc: "Short shadow to heavy stubble" },
  { id: "full", label: "Full beard", desc: "Established beard with defined length" },
];

const AGES: { id: AgeBracket; label: string }[] = [
  { id: "18-24", label: "18 to 24" },
  { id: "25-34", label: "25 to 34" },
  { id: "35-44", label: "35 to 44" },
  { id: "45+", label: "45 and older" },
];

interface QuestionsProps {
  initial: Answers | null;
  onDone: (a: Answers) => void;
  onBack: () => void;
}

export default function Questions({ initial, onDone, onBack }: QuestionsProps) {
  const [subStep, setSubStep] = useState<1 | 2 | 3>(1);
  const [haircutFreq, setHaircutFreq] = useState(initial?.haircutFrequency ?? "3-4weeks");
  const [beard, setBeard] = useState<Beard>(initial?.beard ?? "stubble");
  const [age, setAge] = useState<AgeBracket>(initial?.age ?? "25-34");
  const [concern, setConcern] = useState<Concern | null>(initial?.concern ?? null);

  function handleContinue() {
    if (subStep === 1) {
      setSubStep(2);
    } else if (subStep === 2) {
      setSubStep(3);
    } else {
      onDone({
        age,
        beard,
        concern,
        haircutFrequency: haircutFreq,
      });
    }
  }

  function handleBack() {
    if (subStep > 1) {
      setSubStep((prev) => (prev - 1) as 1 | 2);
    } else {
      onBack();
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        minHeight: 680,
        boxSizing: "border-box",
        background: "#FFFFFF",
        color: "#1B1815",
        padding: "18px 20px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <StepBar step={4} total={4} />

      {/* Sub-step 1: Haircut frequency */}
      {subStep === 1 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#4F2C1D",
              }}
            >
              Question 1 of 3
            </span>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-heading)",
                fontWeight: 400,
                fontSize: 26,
                lineHeight: 1.16,
                letterSpacing: "-0.03em",
                color: "#4F2C1D",
              }}
            >
              How often do you get a haircut?
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#5C4F47" }}>
              Used to time hairstyle recommendations and trim reminders.
            </p>
          </div>

          <fieldset
            style={{
              border: 0,
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <legend
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
              }}
            >
              Haircut frequency
            </legend>
            {CUT_FREQUENCIES.map((opt) => {
              const on = haircutFreq === opt.id;
              return (
                <label
                  key={opt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    border: on ? "1px solid #111111" : "1px solid #ECECEA",
                    borderRadius: 10,
                    padding: "14px 16px",
                    minHeight: 54,
                    boxSizing: "border-box",
                    cursor: "pointer",
                    background: on ? "#FAFAF9" : "#FFFFFF",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontWeight: on ? 500 : 400 }}>{opt.label}</span>
                  <input
                    type="radio"
                    name="cut"
                    checked={on}
                    onChange={() => setHaircutFreq(opt.id)}
                    style={{
                      width: 18,
                      height: 18,
                      margin: 0,
                      accentColor: "#111111",
                      cursor: "pointer",
                    }}
                  />
                </label>
              );
            })}
          </fieldset>
          <div style={{ fontSize: 13, color: "#7A6A60", borderTop: "1px solid #DDD9D3", paddingTop: 12 }}>
            Next: current beard state and age profile.
          </div>
        </>
      )}

      {/* Sub-step 2: Beard State */}
      {subStep === 2 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#4F2C1D",
              }}
            >
              Question 2 of 3
            </span>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-heading)",
                fontWeight: 400,
                fontSize: 26,
                lineHeight: 1.16,
                letterSpacing: "-0.03em",
                color: "#4F2C1D",
              }}
            >
              What is your beard status right now?
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#5C4F47" }}>
              Helps us recommend whether to grow, trim, or shape for your jawline.
            </p>
          </div>

          <fieldset
            style={{
              border: 0,
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {BEARDS.map((b) => {
              const on = beard === b.id;
              return (
                <label
                  key={b.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    border: on ? "1px solid #111111" : "1px solid #ECECEA",
                    borderRadius: 10,
                    padding: "14px 16px",
                    minHeight: 54,
                    boxSizing: "border-box",
                    cursor: "pointer",
                    background: on ? "#FAFAF9" : "#FFFFFF",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: on ? 500 : 400 }}>{b.label}</div>
                    <div style={{ fontSize: 12, color: "#8A8A85" }}>{b.desc}</div>
                  </div>
                  <input
                    type="radio"
                    name="beard"
                    checked={on}
                    onChange={() => setBeard(b.id)}
                    style={{
                      width: 18,
                      height: 18,
                      margin: 0,
                      accentColor: "#111111",
                      cursor: "pointer",
                    }}
                  />
                </label>
              );
            })}
          </fieldset>
          <div style={{ fontSize: 13, color: "#7A6A60", borderTop: "1px solid #DDD9D3", paddingTop: 12 }}>
            Next: age bracket for grooming routine calibration.
          </div>
        </>
      )}

      {/* Sub-step 3: Age Bracket & Skin Concern */}
      {subStep === 3 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#4F2C1D",
              }}
            >
              Question 3 of 3
            </span>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-heading)",
                fontWeight: 400,
                fontSize: 26,
                lineHeight: 1.16,
                letterSpacing: "-0.03em",
                color: "#4F2C1D",
              }}
            >
              Your age bracket
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "#5C4F47" }}>
              Calibrates skin texture advice and appropriate grooming routines.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 8,
            }}
          >
            {AGES.map((a) => {
              const on = age === a.id;
              return (
                <label
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    border: on ? "1px solid #111111" : "1px solid #ECECEA",
                    borderRadius: 10,
                    background: on ? "#FAFAF9" : "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontWeight: on ? 500 : 400 }}>{a.label}</span>
                  <input
                    type="radio"
                    name="age"
                    checked={on}
                    onChange={() => setAge(a.id)}
                    style={{
                      width: 16,
                      height: 16,
                      margin: 0,
                      accentColor: "#111111",
                    }}
                  />
                </label>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#111111" }}>
              Primary skin concern (optional)
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                { id: "oil" as Concern, label: "T-zone shine / oiliness" },
                { id: "acne" as Concern, label: "Breakouts & texture" },
                { id: "spots" as Concern, label: "Uneven tone" },
                { id: "dull" as Concern, label: "Dull, tired look" },
              ].map((c) => {
                const sel = concern === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setConcern(sel ? null : c.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12.5,
                      border: sel ? "1px solid #111111" : "1px solid #ECECEA",
                      background: sel ? "#111111" : "#FFFFFF",
                      color: sel ? "#FFFFFF" : "#5F5F5B",
                      cursor: "pointer",
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Navigation Buttons */}
      <div style={{ marginTop: "auto", display: "flex", gap: 8, paddingTop: 16 }}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            flex: "0 0 auto",
            background: "#FFFFFF",
            color: "#111111",
            border: "1px solid #D9D9D6",
            borderRadius: 8,
            minHeight: 52,
            padding: "0 22px",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary"
          style={{
            flex: 1,
            minHeight: 52,
            borderRadius: 8,
          }}
        >
          {subStep === 3 ? "Complete analysis" : "Continue"}
        </button>
      </div>
    </div>
  );
}
