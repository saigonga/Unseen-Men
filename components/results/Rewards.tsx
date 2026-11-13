"use client";

import { WAITLIST_CONFIRMATION } from "@/lib/content";

export default function Rewards({
  position,
  memberNumber,
}: {
  code?: string;
  position: number;
  referrals?: number;
  memberNumber?: string | number;
}) {
  const formattedMember = memberNumber ? String(memberNumber).padStart(4, "0") : String(position).padStart(4, "0");

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
          Founding Member #{formattedMember}
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
          Waitlist Spot #{position}
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
          You&apos;re #{position} on the launch waitlist
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#5C4F47" }}>
          {WAITLIST_CONFIRMATION}
        </p>
      </div>
    </div>
  );
}
