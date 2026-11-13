import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How We Use Your Data · NODD MEN",
  description: "Privacy and data protection notice under the Digital Personal Data Protection (DPDP) Act.",
};

export default function HowWeUseYourDataPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAF9F6", color: "#111111", padding: "40px 16px 80px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          margin: "0 auto",
          background: "#FFFFFF",
          borderRadius: 14,
          border: "1px solid #ECECEA",
          padding: "32px 28px 36px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 13,
            color: "#4F2C1D",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Back to Analysis
        </Link>

        <div>
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
            PRIVACY & DPDP NOTICE
          </span>
          <h1
            style={{
              margin: "6px 0 0",
              fontFamily: "var(--font-heading)",
              fontSize: 28,
              fontWeight: 500,
              color: "#111111",
              letterSpacing: "-0.02em",
            }}
          >
            How we use your data
          </h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 14.5, lineHeight: 1.6, color: "#2E2D2A" }}>
          <div style={{ background: "#FAF9F6", border: "1px solid #EFEFEA", borderRadius: 8, padding: "14px 16px" }}>
            <strong style={{ color: "#111111", display: "block", marginBottom: 4 }}>What we collect:</strong>
            Name, WhatsApp number, email, scan photo, scan measurements, and your assigned styles.
          </div>

          <div style={{ background: "#FAF9F6", border: "1px solid #EFEFEA", borderRadius: 8, padding: "14px 16px" }}>
            <strong style={{ color: "#111111", display: "block", marginBottom: 4 }}>Why:</strong>
            To give you your analysis and report; if you agree, to create personalised style images and send recommendations and launch updates on WhatsApp and email.
          </div>

          <div style={{ background: "#FAF9F6", border: "1px solid #EFEFEA", borderRadius: 8, padding: "14px 16px" }}>
            <strong style={{ color: "#111111", display: "block", marginBottom: 4 }}>Your photo:</strong>
            Analysed for styling only. We never estimate age, ethnicity or attractiveness, and the analysis is not a medical or skin assessment.
          </div>

          <div style={{ background: "#FAF9F6", border: "1px solid #EFEFEA", borderRadius: 8, padding: "14px 16px" }}>
            <strong style={{ color: "#111111", display: "block", marginBottom: 4 }}>Where it is kept:</strong>
            The app runs on Vercel and stores your waitlist details, photo, measurements, and assigned styles in Supabase.
          </div>

          <div style={{ background: "#FAF9F6", border: "1px solid #EFEFEA", borderRadius: 8, padding: "14px 16px" }}>
            <strong style={{ color: "#111111", display: "block", marginBottom: 4 }}>How long:</strong>
            Your photo and saved details stay until you ask us to remove them or unsubscribe.
          </div>

          <div style={{ background: "#FAF7F2", border: "1px solid #E6DCCD", borderRadius: 8, padding: "14px 16px" }}>
            <strong style={{ color: "#4F2C1D", display: "block", marginBottom: 4 }}>Your choices:</strong>
            Withdraw any permission at any time by emailing <a href="mailto:care@noddmen.com" style={{ color: "#4F2C1D", textDecoration: "underline", fontWeight: 600 }}>care@noddmen.com</a> or replying STOP on WhatsApp. We act within 7 days.
          </div>
        </div>

        <div style={{ borderTop: "1px solid #ECECEA", paddingTop: 18, fontSize: 12.5, color: "#8A8A85" }}>
          NODD MEN · Built in compliance with India's Digital Personal Data Protection Act (DPDP Act 2023).
        </div>
      </div>
    </div>
  );
}
