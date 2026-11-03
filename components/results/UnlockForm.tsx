"use client";

import { useState } from "react";
import { checkIndianMobile, isEmail } from "@/lib/phone";
import type { FaceResult } from "@/lib/faceShape";
import { SHAPES } from "@/lib/content";
import { captureReferral } from "@/lib/referral";

export interface Lead {
  name: string;
  mobile: string;
  email: string | null;
  memberNumber?: number;
  waitlistPosition?: number;
  referralCode?: string;
  referralCount?: number;
}

interface UnlockFormProps {
  result: FaceResult;
  memberNumber?: string;
  ageBracket?: string;
  skinConcern?: string | null;
  onUnlock: (l: Lead) => void;
}

export default function UnlockForm({
  result,
  memberNumber = "0347",
  ageBracket,
  skinConcern,
  onUnlock,
}: UnlockFormProps) {
  const [name, setName] = useState("Rohan");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errs, setErrs] = useState<{ name?: string; contact?: string; server?: string }>({});

  const sh = SHAPES[result.key];
  const jawTrait = result.traits.find((t) => t.f === "J" || t.f === "A");
  const jawDesc = jawTrait ? jawTrait.label : "Defined";
  const ratio = Math.max(1.15, Math.min(1.5, 1.3 + (result.z?.R || 0) * 0.08)).toFixed(2);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim().replace(/\s+/g, " ");
    const rawContact = contact.trim();
    const next: typeof errs = {};

    if (!/^[\p{L}][\p{L} .'-]{1,39}$/u.test(n)) {
      next.name = "Enter your first name.";
    }

    let mobileVal = "";
    let emailVal: string | null = null;

    if (!rawContact) {
      next.contact = "Enter your WhatsApp number or email.";
    } else if (rawContact.includes("@")) {
      if (!isEmail(rawContact)) {
        next.contact = "Enter a valid email address.";
      } else {
        emailVal = rawContact;
      }
    } else {
      const phone = checkIndianMobile(rawContact);
      if (!phone.ok) {
        next.contact = phone.error;
      } else {
        mobileVal = phone.pretty;
      }
    }

    setErrs(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          contact: rawContact,
          ageBracket,
          faceShape: sh.name,
          skinConcern,
          memberNumber: parseInt(memberNumber, 10),
          referredBy: captureReferral(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      onUnlock({
        name: data.name || n,
        mobile: mobileVal || (data.contact?.startsWith("+91") ? data.contact : "+91 98765 43210"),
        email: emailVal || (data.contact?.includes("@") ? data.contact : null),
        memberNumber: data.memberNumber,
        waitlistPosition: data.waitlistPosition,
        referralCode: data.referralCode,
        referralCount: data.referralCount,
      });
    } catch (err: unknown) {
      console.warn("Waitlist API fallback:", err);
      // Fallback: don't block the user from seeing their report if offline or api fails
      onUnlock({
        name: n,
        mobile: mobileVal || "+91 98765 43210",
        email: emailVal,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #ECECEA",
        borderRadius: 14,
        background: "#FFFFFF",
        padding: "24px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span
          style={{
            fontSize: 13,
            color: "#8A8A85",
          }}
        >
          Step 4 of 4
        </span>
        <h2
          style={{
            margin: "4px 0 0",
            fontFamily: "var(--font-heading)",
            fontWeight: 400,
            fontSize: 24,
            lineHeight: 1.16,
            letterSpacing: "-0.03em",
            color: "#111111",
          }}
        >
          Analysis complete. <span style={{ fontWeight: 600 }}>Nine of nine attributes.</span>
        </h2>
      </div>

      {/* 4-cell quick summary preview (face structure metrics only) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          border: "1px solid #ECECEA",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 12px",
            borderRight: "1px solid #F0F0EE",
            borderBottom: "1px solid #F0F0EE",
          }}
        >
          <div style={{ fontSize: 12, color: "#8A8A85" }}>Face shape</div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: "#111111" }}>
            {sh.name}
          </div>
        </div>
        <div style={{ padding: "10px 12px", borderBottom: "1px solid #F0F0EE" }}>
          <div style={{ fontSize: 12, color: "#8A8A85" }}>Jawline</div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: "#111111" }}>
            {jawDesc}
          </div>
        </div>
        <div style={{ padding: "10px 12px", borderRight: "1px solid #F0F0EE" }}>
          <div style={{ fontSize: 12, color: "#8A8A85" }}>Length : width</div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: "#111111" }}>
            {ratio}
          </div>
        </div>
        <div style={{ padding: "10px 12px" }}>
          <div style={{ fontSize: 12, color: "#8A8A85" }}>Facial thirds</div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: "#111111" }}>
            Balanced
          </div>
        </div>
      </div>

      {/* Surprise Founding Member Reservation Card */}
      <div
        style={{
          border: "1px solid #ECECEA",
          borderRadius: 12,
          padding: "16px 18px",
          background: "#FAFAF9",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#4F2C1D",
              fontWeight: 600,
            }}
          >
            FOUNDING MEMBER STATUS
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 600,
              background: "#4F2C1D",
              color: "#FFFFFF",
              borderRadius: 999,
              padding: "3px 10px",
            }}
          >
            #{memberNumber}
          </span>
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 500,
              fontSize: 16.5,
              color: "#111111",
            }}
          >
            You&apos;ve unlocked Founding Member #{memberNumber}
          </div>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13,
              color: "#5F5F5B",
              lineHeight: 1.55,
            }}
          >
            The first 1,000 men to complete the analysis receive a permanent member number and priority access to the product pre-order. Enter your details below to claim your number and view your full report.
          </p>
        </div>
      </div>

      <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#5F5F5B" }}>
          First name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              border: errs.name ? "1px solid #D9735E" : "1px solid #D9D9D6",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 15,
              color: "#111111",
              minHeight: 46,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          {errs.name && <span style={{ color: "#D9735E", fontSize: 12 }}>{errs.name}</span>}
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#5F5F5B" }}>
          WhatsApp mobile number or email
          <input
            type="text"
            placeholder="+91 98765 43210 or name@example.com"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            style={{
              border: errs.contact ? "1px solid #D9735E" : "1px solid #D9D9D6",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 15,
              color: "#111111",
              minHeight: 46,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          {errs.contact && <span style={{ color: "#D9735E", fontSize: 12 }}>{errs.contact}</span>}
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary"
          style={{
            width: "100%",
            minHeight: 50,
            marginTop: 4,
            fontSize: 15,
            borderRadius: 8,
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Claiming Founding Member spot..." : `Claim Member #${memberNumber} & view report`}
        </button>

        <div
          style={{
            fontSize: 12,
            color: "#8A8A85",
            textAlign: "center",
            marginTop: 2,
          }}
        >
          Photo deleted after analysis · Report private to you · No spam
        </div>
      </form>
    </div>
  );
}
