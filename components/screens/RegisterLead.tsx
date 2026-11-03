"use client";

import { useState } from "react";
import StepBar from "../StepBar";
import { checkIndianMobile, isEmail } from "@/lib/phone";

export interface UserLeadProfile {
  name: string;
  phone: string;
  email: string;
}

interface RegisterLeadProps {
  initial?: Partial<UserLeadProfile>;
  onProceed: (profile: UserLeadProfile, mode: "live" | "choose") => void;
  onClose?: () => void;
}

export default function RegisterLead({
  initial,
  onProceed,
  onClose,
}: RegisterLeadProps) {
  const [name, setName] = useState(initial?.name || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [agreed, setAgreed] = useState(true);
  const [errs, setErrs] = useState<{ name?: string; phone?: string; email?: string; agreed?: string }>({});

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

    if (!agreed) {
      next.agreed = "You must agree to continue.";
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
        padding: "18px 16px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        borderRadius: 14,
        border: "1px solid #ECECEA",
        boxShadow: "0 20px 40px -28px rgba(17,17,17,0.12)",
      }}
    >
      <StepBar step={1} total={4} onClose={onClose} />

      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 2 }}>
        <span style={{ fontSize: 12.5, color: "#8A8A85" }}>
          Step 1 of 4 · Member Details
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
          Enter your details to receive your personalized styling blueprint, haircut guide, and priority pre-order access.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Name Input */}
        <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 500, color: "#444441" }}>
          <span>Your Full Name <span style={{ color: "#D9735E" }}>*</span></span>
          <input
            type="text"
            placeholder="e.g. Sai Gonga"
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
            placeholder="+91 98765 43210"
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
            placeholder="name@example.com"
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

        {/* Consent & 18+ Checkbox */}
        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            fontSize: 13,
            color: "#5F5F5B",
            cursor: "pointer",
            marginTop: 2,
            lineHeight: 1.4,
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
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
            I confirm I am 18+ and agree to facial analysis for style and haircut recommendations.
          </span>
        </label>
        {errs.agreed && <span style={{ color: "#D9735E", fontSize: 12 }}>{errs.agreed}</span>}
      </div>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 16,
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
            fontSize: 12,
            color: "#8A8A85",
            textAlign: "center",
            marginTop: 4,
          }}
        >
          Men only · Stored securely in your private profile · No spam
        </div>
      </div>
    </div>
  );
}
