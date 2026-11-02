"use client";

import { useState } from "react";
import StepBar from "../StepBar";

interface ConsentProps {
  onAllowCamera: () => void;
  onUploadPhoto: () => void;
  onClose?: () => void;
}

export default function Consent({
  onAllowCamera,
  onUploadPhoto,
  onClose,
}: ConsentProps) {
  const [agreed, setAgreed] = useState(false);

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
      <StepBar step={1} total={4} onClose={onClose} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        <span
          style={{
            fontSize: 13,
            color: "#8A8A85",
          }}
        >
          Before you begin
        </span>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-heading)",
            fontWeight: 400,
            fontSize: 28,
            lineHeight: 1.14,
            letterSpacing: "-0.03em",
          }}
        >
          Your photo is analysed once,{" "}
          <span style={{ fontWeight: 600 }}>then deleted.</span>
        </h1>
        <p style={{ margin: 0, color: "#5F5F5B", fontSize: 14.5 }}>
          The analysis maps face shape, jaw, hair, beard and undertone to match style
          recommendations.
        </p>
      </div>

      <div
        style={{
          border: "1px solid #ECECEA",
          borderRadius: 12,
          fontSize: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "112px minmax(0, 1fr)",
            gap: 10,
            padding: "12px 14px",
            borderBottom: "1px solid #F0F0EE",
          }}
        >
          <span style={{ color: "#8A8A85" }}>Photo</span>
          <span style={{ fontWeight: 500 }}>Deleted after analysis</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "112px minmax(0, 1fr)",
            gap: 10,
            padding: "12px 14px",
            borderBottom: "1px solid #F0F0EE",
          }}
        >
          <span style={{ color: "#8A8A85" }}>Kept</span>
          <span>Written results only</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "112px minmax(0, 1fr)",
            gap: 10,
            padding: "12px 14px",
            borderBottom: "1px solid #F0F0EE",
          }}
        >
          <span style={{ color: "#8A8A85" }}>Never assessed</span>
          <span>Age, ethnicity, identity, attractiveness</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "112px minmax(0, 1fr)",
            gap: 10,
            padding: "12px 14px",
          }}
        >
          <span style={{ color: "#8A8A85" }}>Eligibility</span>
          <span>18 and over</span>
        </div>
      </div>

      <label
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          fontSize: 14,
          border: "1px solid #ECECEA",
          borderRadius: 12,
          padding: 14,
          cursor: "pointer",
          background: agreed ? "#FCFCFB" : "#FFFFFF",
          transition: "background 0.15s ease",
        }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{
            width: 20,
            height: 20,
            margin: 0,
            accentColor: "#111111",
            flex: "none",
            cursor: "pointer",
          }}
        />
        <span>I agree to a one-time analysis of my photo for style recommendations.</span>
      </label>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "center",
          width: "100%",
        }}
      >
        <button
          type="button"
          disabled={!agreed}
          onClick={onAllowCamera}
          className="btn-primary"
          style={{
            width: "100%",
            minHeight: 52,
            opacity: agreed ? 1 : 0.45,
            cursor: agreed ? "pointer" : "not-allowed",
          }}
        >
          Allow camera
        </button>

        <button
          type="button"
          disabled={!agreed}
          onClick={onUploadPhoto}
          style={{
            background: "transparent",
            border: "none",
            color: agreed ? "#111111" : "#8A8A85",
            fontSize: 14,
            cursor: agreed ? "pointer" : "not-allowed",
            padding: "6px 12px",
          }}
        >
          Or upload a photo instead
        </button>
      </div>
    </div>
  );
}
