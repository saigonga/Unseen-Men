"use client";

import { useState } from "react";
import StepBar from "../StepBar";
import { checkIndianMobile, isEmail } from "@/lib/phone";
import DataUseModal from "./DataUseModal";
import type { AgeBracket, Beard, Concern } from "@/lib/content";

export interface UserLeadProfile {
  name: string;
  phone: string;
  email: string;
  age: AgeBracket;
  beard: Beard;
  concern: Concern | null;
}

interface RegisterLeadProps {
  initial?: Partial<UserLeadProfile>;
  onProceed: (profile: UserLeadProfile, mode: "live" | "choose") => void;
  onClose?: () => void;
}

const AGES: { id: AgeBracket; label: string }[] = [
  { id: "18-24", label: "18–24" },
  { id: "25-34", label: "25–34" },
  { id: "35-44", label: "35–44" },
  { id: "45+", label: "45+" },
];

const BEARDS: { id: Beard; label: string; desc: string }[] = [
  { id: "none", label: "Clean shave", desc: "No facial hair" },
  { id: "stubble", label: "Stubble", desc: "Short shadow" },
  { id: "full", label: "Full beard", desc: "Defined length" },
];

export default function RegisterLead({
  onProceed,
  onClose,
}: RegisterLeadProps) {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [age, setAge] = useState<AgeBracket>("25-34");
  const [beard, setBeard] = useState<Beard>("stubble");
  const [consentAgeAndPhoto, setConsentAgeAndPhoto] = useState<boolean>(false);
  const [consentWhatsApp, setConsentWhatsApp] = useState<boolean>(false);

  const [showDataModal, setShowDataModal] = useState(false);
  const [errs, setErrs] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    consentAgeAndPhoto?: string;
    consentWhatsApp?: string;
  }>({});

  function validate(): { ok: boolean; cleanPhone?: string } {
    const next: typeof errs = {};
    const n = name.trim().replace(/\s+/g, " ");
    const p = phone.trim();
    const e = email.trim().toLowerCase();

    if (!n || n.length < 2) {
      next.name = "Enter your full name (at least 2 letters).";
    }

    let cleanPhone = "";
    if (!p) {
      next.phone = "Enter your WhatsApp mobile number.";
    } else {
      const check = checkIndianMobile(p);
      if (!check.ok) {
        next.phone = check.error;
      } else {
        cleanPhone = check.pretty;
      }
    }

    if (!e) {
      next.email = "Enter your email address.";
    } else if (!isEmail(e)) {
      next.email = "Enter a valid email address.";
    }

    if (!consentAgeAndPhoto) {
      next.consentAgeAndPhoto = "You must confirm you are 18 or older and consent to photo analysis.";
    }

    if (!consentWhatsApp) {
      next.consentWhatsApp = "You must agree to receive your results on WhatsApp.";
    }

    setErrs(next);
    return { ok: Object.keys(next).length === 0, cleanPhone };
  }

  function handleContinue(mode: "live" | "choose") {
    const val = validate();
    if (!val.ok || !val.cleanPhone) return;

    onProceed(
      {
        name: name.trim().replace(/\s+/g, " "),
        phone: val.cleanPhone,
        email: email.trim().toLowerCase(),
        age,
        beard,
        concern: null,
      },
      mode
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
        minHeight: "auto",
        boxSizing: "border-box",
        background: "#FFFFFF",
        color: "#111111",
        padding: "18px 16px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        borderRadius: 14,
        border: "1px solid #ECECEA",
        boxShadow: "0 20px 40px -28px rgba(17,17,17,0.12)",
      }}
    >
      <StepBar step={1} total={3} onClose={onClose} />

      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 2 }}>
        <span style={{ fontSize: 12.5, color: "#8A8A85" }}>
          Step 1 of 3 · Member Details
        </span>
        <h1
          style={{
            margin: "2px 0 0",
            fontFamily: "var(--font-heading)",
            fontWeight: 400,
            fontSize: "clamp(22px, 5.5vw, 26px)",
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            color: "#111111",
          }}
        >
          Start your facial analysis.
        </h1>
        <p style={{ margin: "2px 0 0", color: "#5F5F5B", fontSize: 13.5, lineHeight: 1.45 }}>
          Enter your details and preferences to receive your personalized styling blueprint and haircut guide.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Name Input */}
        <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 500, color: "#444441" }}>
          <span>Your Full Name <span style={{ color: "#D9735E" }}>*</span></span>
          <input
            type="text"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              border: errs.name ? "1px solid #D9735E" : "1px solid #D9D9D6",
              borderRadius: 8,
              padding: "11px 14px",
              fontSize: 16, // Prevents iOS Safari auto-zoom
              color: "#111111",
              minHeight: 46,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          {errs.name && <span style={{ color: "#D9735E", fontSize: 12 }}>{errs.name}</span>}
        </label>

        {/* WhatsApp Mobile Input */}
        <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 500, color: "#444441" }}>
          <span>WhatsApp Mobile Number <span style={{ color: "#D9735E" }}>*</span></span>
          <input
            type="tel"
            autoComplete="off"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              border: errs.phone ? "1px solid #D9735E" : "1px solid #D9D9D6",
              borderRadius: 8,
              padding: "11px 14px",
              fontSize: 16, // Prevents iOS Safari auto-zoom
              color: "#111111",
              minHeight: 46,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          {errs.phone && <span style={{ color: "#D9735E", fontSize: 12 }}>{errs.phone}</span>}
        </label>

        {/* Email Input */}
        <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 500, color: "#444441" }}>
          <span>Email Address <span style={{ color: "#D9735E" }}>*</span></span>
          <input
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              border: errs.email ? "1px solid #D9735E" : "1px solid #D9D9D6",
              borderRadius: 8,
              padding: "11px 14px",
              fontSize: 16, // Prevents iOS Safari auto-zoom
              color: "#111111",
              minHeight: 46,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          {errs.email && <span style={{ color: "#D9735E", fontSize: 12 }}>{errs.email}</span>}
        </label>

        {/* Age Bracket */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#444441" }}>
            Age Bracket
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {AGES.map((a) => {
              const active = age === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAge(a.id)}
                  style={{
                    padding: "9px 4px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    background: active ? "#111111" : "#FAFAFA",
                    color: active ? "#FFFFFF" : "#444441",
                    border: active ? "1px solid #111111" : "1px solid #ECECEA",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Beard Style */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#444441" }}>
            Facial Hair Right Now
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {BEARDS.map((b) => {
              const active = beard === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBeard(b.id)}
                  style={{
                    padding: "9px 6px",
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 400,
                    background: active ? "#111111" : "#FAFAFA",
                    color: active ? "#FFFFFF" : "#444441",
                    border: active ? "1px solid #111111" : "1px solid #ECECEA",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <span>{b.label}</span>
                  <span style={{ fontSize: 10, color: active ? "rgba(255,255,255,0.7)" : "#8A8A85" }}>
                    {b.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Consent Section (Both Unticked by Default, Both Required under DPDP Rules) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          {/* Box 1: Age & Photo Analysis Consent */}
          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: 12.5,
              color: "#333330",
              cursor: "pointer",
              lineHeight: 1.4,
            }}
          >
            <input
              type="checkbox"
              checked={consentAgeAndPhoto}
              onChange={(e) => setConsentAgeAndPhoto(e.target.checked)}
              style={{
                width: 18,
                height: 18,
                margin: "2px 0 0",
                accentColor: "#111111",
                flex: "none",
                cursor: "pointer",
              }}
            />
            <span>
              I am 18 or older and agree to face analysis and the storage of my scan measurements and style recommendations. <span style={{ color: "#D9735E" }}>*</span>
            </span>
          </label>
          {errs.consentAgeAndPhoto && (
            <span style={{ color: "#D9735E", fontSize: 11.5, marginLeft: 28 }}>
              {errs.consentAgeAndPhoto}
            </span>
          )}

          {/* Box 2: WhatsApp Results Consent */}
          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: 12.5,
              color: "#333330",
              cursor: "pointer",
              lineHeight: 1.4,
            }}
          >
            <input
              type="checkbox"
              checked={consentWhatsApp}
              onChange={(e) => setConsentWhatsApp(e.target.checked)}
              style={{
                width: 18,
                height: 18,
                margin: "2px 0 0",
                accentColor: "#111111",
                flex: "none",
                cursor: "pointer",
              }}
            />
            <span>
              Send my results and style recommendations on WhatsApp. I can reply STOP to opt out at any time. <span style={{ color: "#D9735E" }}>*</span>
            </span>
          </label>
          {errs.consentWhatsApp && (
            <span style={{ color: "#D9735E", fontSize: 11.5, marginLeft: 28 }}>
              {errs.consentWhatsApp}
            </span>
          )}

          {/* Short notice under the boxes */}
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 11.5,
              lineHeight: 1.45,
              color: "#6F6E69",
              paddingLeft: 2,
            }}
          >
            Your photo stays in your browser while we create your analysis and style previews. You can download the looks you want to keep.{" "}
            <button
              type="button"
              onClick={() => setShowDataModal(true)}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                color: "#4F2C1D",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: 11.5,
                fontFamily: "inherit",
              }}
            >
              [How we use your data]
            </button>
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
        }}
      >
        <button
          type="button"
          onClick={() => handleContinue("live")}
          className="btn-primary"
          style={{
            width: "100%",
            minHeight: 50,
            fontSize: 15,
            borderRadius: 8,
          }}
        >
          Take a photo (Live camera)
        </button>

        <button
          type="button"
          onClick={() => handleContinue("choose")}
          className="btn-secondary"
          style={{
            width: "100%",
            minHeight: 48,
            fontSize: 14,
            borderRadius: 8,
            borderColor: "#D9D9D6",
          }}
        >
          Upload a photo instead
        </button>

        <div
          style={{
            fontSize: 11.5,
            color: "#8A8A85",
            textAlign: "center",
            marginTop: 2,
          }}
        >
          Men only · Stored securely in your private profile · No spam
        </div>
      </div>

      {/* DPDP How We Use Your Data Modal */}
      <DataUseModal isOpen={showDataModal} onClose={() => setShowDataModal(false)} />
    </div>
  );
}
