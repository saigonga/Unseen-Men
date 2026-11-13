"use client";

interface DataUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataUseModal({ isOpen, onClose }: DataUseModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(17, 17, 17, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#FFFFFF",
          color: "#111111",
          borderRadius: 14,
          padding: "24px 22px 28px",
          border: "1px solid #ECECEA",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          WebkitOverflowScrolling: "touch",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
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
              DATA PRIVACY & COMPLIANCE
            </span>
            <h2
              style={{
                margin: "4px 0 0",
                fontFamily: "var(--font-heading)",
                fontSize: 22,
                fontWeight: 500,
                color: "#111111",
              }}
            >
              How we use your data
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: "#F4EDE4",
              border: "1px solid #DDD9D3",
              color: "#4F2C1D",
              borderRadius: 6,
              width: 32,
              height: 32,
              fontSize: 16,
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13.5, lineHeight: 1.5, color: "#333330" }}>
          <div style={{ background: "#FAF9F6", border: "1px solid #EFEFEA", borderRadius: 8, padding: "12px 14px" }}>
            <strong style={{ color: "#111111", display: "block", marginBottom: 3 }}>What we collect:</strong>
            Name, WhatsApp number, email, scan photo, scan measurements, and your assigned styles.
          </div>

          <div style={{ background: "#FAF9F6", border: "1px solid #EFEFEA", borderRadius: 8, padding: "12px 14px" }}>
            <strong style={{ color: "#111111", display: "block", marginBottom: 3 }}>Why:</strong>
            To give you your analysis and report; if you agree, to create personalised style images and send recommendations and launch updates on WhatsApp and email.
          </div>

          <div style={{ background: "#FAF9F6", border: "1px solid #EFEFEA", borderRadius: 8, padding: "12px 14px" }}>
            <strong style={{ color: "#111111", display: "block", marginBottom: 3 }}>Your photo:</strong>
            Analysed for styling only. We never estimate age, ethnicity or attractiveness, and the analysis is not a medical or skin assessment.
          </div>

          <div style={{ background: "#FAF9F6", border: "1px solid #EFEFEA", borderRadius: 8, padding: "12px 14px" }}>
            <strong style={{ color: "#111111", display: "block", marginBottom: 3 }}>Where it is kept:</strong>
            The app runs on Vercel and stores your waitlist details, photo, measurements, and assigned styles in Supabase.
          </div>

          <div style={{ background: "#FAF9F6", border: "1px solid #EFEFEA", borderRadius: 8, padding: "12px 14px" }}>
            <strong style={{ color: "#111111", display: "block", marginBottom: 3 }}>How long:</strong>
            Your photo and saved details stay until you ask us to remove them or unsubscribe.
          </div>

          <div style={{ background: "#FAF7F2", border: "1px solid #E6DCCD", borderRadius: 8, padding: "12px 14px" }}>
            <strong style={{ color: "#4F2C1D", display: "block", marginBottom: 3 }}>Your choices:</strong>
            Withdraw any permission at any time by emailing <a href="mailto:care@noddmen.com" style={{ color: "#4F2C1D", textDecoration: "underline", fontWeight: 600 }}>care@noddmen.com</a> or replying STOP on WhatsApp. We act within 7 days.
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="btn-primary"
          style={{ width: "100%", padding: "12px 0", fontSize: 14, borderRadius: 8, marginTop: 4 }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
