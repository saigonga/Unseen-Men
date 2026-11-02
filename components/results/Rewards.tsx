"use client";

import { useState } from "react";
import { REWARD } from "@/lib/content";
import { inviteLink } from "@/lib/referral";

export default function Rewards({
  code,
  position,
  referrals,
}: {
  code: string;
  position: number;
  referrals: number;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = `I just found my face shape on NODD MEN Facial Analysis. Check yours with my invite code ${code}: ${inviteLink(
      code
    )}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        border: "1px solid #DDD9D3",
        borderRadius: "3px 14px 3px 3px",
        padding: 18,
        background: "#FBF8F3",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#4F2C1D",
          }}
        >
          Founding Member
        </span>
        <span
          style={{
            fontSize: 12,
            border: "1px solid #4F2C1D",
            borderRadius: 999,
            padding: "2px 10px",
            color: "#4F2C1D",
            fontWeight: 600,
          }}
        >
          #{position}
        </span>
      </div>

      <div>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-heading)",
            fontWeight: 500,
            fontSize: 18,
            color: "#1B1815",
          }}
        >
          You&apos;re #{position} on the Founding Member list
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#5C4F47" }}>
          Invite {REWARD.referralsNeeded} friends to scan with your code to unlock{" "}
          <strong>{REWARD.label}</strong>.
        </p>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: REWARD.referralsNeeded }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i < referrals ? "#4F2C1D" : "#DDD9D3",
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid #DDD9D3",
          borderRadius: 999,
          padding: "6px 6px 6px 16px",
          background: "#FFFFFF",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: "0.08em",
            color: "#4F2C1D",
          }}
        >
          {code}
        </span>
        <button
          type="button"
          onClick={copy}
          className="btn-primary"
          style={{ padding: "8px 18px", fontSize: 13, minHeight: "auto" }}
        >
          {copied ? "Copied!" : "Copy invite link"}
        </button>
      </div>
    </div>
  );
}
