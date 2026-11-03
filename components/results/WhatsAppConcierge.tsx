"use client";

interface WhatsAppConciergeProps {
  name: string;
  memberNumber?: number | string;
  faceShape: string;
  referralCode?: string;
  conciergePhone?: string; // e.g. "918169506875"
}

export default function WhatsAppConcierge({
  name,
  memberNumber = 302,
  faceShape,
  referralCode = "",
  conciergePhone = "918169506875",
}: WhatsAppConciergeProps) {
  const memberStr = String(memberNumber).padStart(4, "0");
  const defaultText = `Hi UNSEEN MEN! I'm ${name} (Member #${memberStr}). I just completed my facial analysis (${faceShape} face shape${referralCode ? `, code ${referralCode}` : ""}). Send me my complete grooming lookbook and ongoing styling suggestions!`;

  const cleanPhone = conciergePhone.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultText)}`;

  return (
    <div
      style={{
        border: "1px solid #D6E8D8",
        borderRadius: "4px 16px 4px 4px",
        padding: "16px 16px",
        background: "#F4FAF5",
        display: "flex",
        flexDirection: "column",
        gap: 13,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#25D366",
            display: "grid",
            placeItems: "center",
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          💬
        </div>
        <div>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#1E6B35",
              fontWeight: 600,
            }}
          >
            WHATSAPP STYLIST CONCIERGE
          </span>
          <h4
            style={{
              margin: "2px 0 0",
              fontFamily: "var(--font-heading)",
              fontSize: 17,
              fontWeight: 600,
              color: "#123B1E",
            }}
          >
            Connect 1-on-1 with Your Stylist
          </h4>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 13, color: "#2B5236", lineHeight: 1.45 }}>
        Tap below to open WhatsApp with your member profile pre-filled. We'll send your complete styling blueprint, future drop access, and personalized look suggestions directly over time.
      </p>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          background: "#25D366",
          color: "#FFFFFF",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 14,
          padding: "13px 20px",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(37,211,102,0.25)",
          textAlign: "center",
          transition: "transform 0.15s ease",
        }}
      >
        <span>Open WhatsApp Concierge</span>
        <span style={{ fontSize: 16 }}>→</span>
      </a>

      <div style={{ fontSize: 11.5, color: "#4E7A5A", textAlign: "center" }}>
        Direct private concierge · No spam or unsolicited promotions
      </div>
    </div>
  );
}
