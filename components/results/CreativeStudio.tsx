"use client";

import { useEffect, useState } from "react";

interface CreativeStudioProps {
  photoUrl?: string | null;
  faceShape: string;
  cutName?: string;
  userName?: string;
  memberNumber?: number | string;
}

type StylePreset = "nordman_editorial" | "gq_cover" | "studio_cinematic";

export default function CreativeStudio({
  photoUrl,
  faceShape,
  cutName = "Textured Crop",
  userName = "Founding Member",
  memberNumber = 348,
}: CreativeStudioProps) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [customKey, setCustomKey] = useState<string>("");
  const [stylePreset, setStylePreset] = useState<StylePreset>("nordman_editorial");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check whether Higgsfield API key is configured on server
  useEffect(() => {
    fetch("/api/creative")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setConfigured(Boolean(data.configured));
        }
      })
      .catch(() => setConfigured(false));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setStatusMessage("Connecting to Higgsfield AI pipeline...");

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customKey.trim()) {
        headers["x-higgsfield-key"] = customKey.trim();
      }

      setStatusMessage("Dispatching portrait styling request...");

      const res = await fetch("/api/creative", {
        method: "POST",
        headers,
        body: JSON.stringify({
          photoUrl: photoUrl || undefined,
          faceShape,
          cutName,
          userName,
          stylePreset,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || data.error || "Failed to initiate generation");
      }

      // If finished directly
      if (data.status === "completed" && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setStatusMessage("");
        setLoading(false);
        return;
      }

      // If queued, poll the status endpoint until completed
      if (data.requestId) {
        setStatusMessage("Synthesizing luxury 2K portrait on Higgsfield GPU...");
        await pollStatus(data.requestId, headers["x-higgsfield-key"]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed. Please try again.";
      setError(msg);
      setLoading(false);
      setStatusMessage("");
    }
  };

  const pollStatus = async (requestId: string, apiKeyHeader?: string) => {
    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(async () => {
      attempts++;
      setStatusMessage(`Rendering 2K campaign visual (${attempts * 2}s)...`);

      try {
        const headers: Record<string, string> = {};
        if (apiKeyHeader) headers["x-higgsfield-key"] = apiKeyHeader;

        const res = await fetch(`/api/creative?requestId=${requestId}`, { headers });
        const data = await res.json();

        if (data.status === "completed" && data.imageUrl) {
          clearInterval(interval);
          setGeneratedImageUrl(data.imageUrl);
          setLoading(false);
          setStatusMessage("");
          return;
        }

        if (data.failed || !data.ok) {
          clearInterval(interval);
          setError(data.error || "Generation terminated or flagged.");
          setLoading(false);
          setStatusMessage("");
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setError("Generation timed out. Please verify your Higgsfield console quota.");
          setLoading(false);
          setStatusMessage("");
        }
      } catch {
        clearInterval(interval);
        setError("Network error while checking status.");
        setLoading(false);
        setStatusMessage("");
      }
    }, 2000);
  };

  return (
    <div
      style={{
        border: "1px solid #ECECEA",
        borderRadius: 16,
        background: "#FCFCFB",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono, monospace)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#A35C37",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Creative Studio · Higgsfield AI
          </div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#111111",
              margin: 0,
              fontFamily: "var(--font-heading, sans-serif)",
            }}
          >
            Generate Your Brand Campaign Portrait
          </h3>
          <p style={{ fontSize: 13, color: "#5F5F5B", margin: "4px 0 0 0", lineHeight: 1.5 }}>
            Synthesize a bespoke 2K high-fashion grooming portrait tailored to your <strong>{faceShape}</strong> facial
            contours and <strong>{cutName}</strong> styling.
          </p>
        </div>
        <span
          style={{
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 6,
            background: configured ? "#EAF5EE" : "#FFF8ED",
            color: configured ? "#2F7D4F" : "#B25E09",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {configured ? "● Ready" : "Awaiting API Key"}
        </span>
      </div>

      {/* Preset Selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#111111" }}>Editorial Visual Style</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
          {[
            {
              id: "nordman_editorial",
              label: "Nordman Luxury",
              desc: "Deep espresso, warm rim light, Nordic minimalist tone",
            },
            {
              id: "gq_cover",
              label: "GQ Magazine",
              desc: "High-contrast editorial cover with crisp lighting",
            },
            {
              id: "studio_cinematic",
              label: "Cinematic 35mm",
              desc: "Golden hour glow with 35mm film depth of field",
            },
          ].map((preset) => {
            const active = stylePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setStylePreset(preset.id as StylePreset)}
                style={{
                  padding: 12,
                  textAlign: "left",
                  borderRadius: 8,
                  border: active ? "1.5px solid #4F2C1D" : "1px solid #ECECEA",
                  background: active ? "#F4EDE4" : "#FFFFFF",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: active ? "#4F2C1D" : "#111111" }}>
                  {preset.label}
                </div>
                <div style={{ fontSize: 11, color: "#8A8A85", marginTop: 2, lineHeight: 1.3 }}>{preset.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* API Key Override (Allows live testing in browser before setting in .env.local) */}
      {!configured && (
        <div
          style={{
            background: "#FAFAF9",
            border: "1px dashed #D9D9D6",
            borderRadius: 8,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "#111111" }}>
            Higgsfield API Setup
          </div>
          <p style={{ fontSize: 12, color: "#5F5F5B", margin: 0, lineHeight: 1.4 }}>
            Add <code>HIGGSFIELD_API_KEY</code> in <code>.env.local</code>, or paste your Key ID and Secret directly
            below to generate immediately:
          </p>
          <input
            type="password"
            placeholder="Key ID:Secret (e.g. hf_key_xxx:hf_sec_yyy)"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #D9D9D6",
              fontSize: 13,
              fontFamily: "monospace",
              background: "#FFFFFF",
              color: "#111111",
              outline: "none",
            }}
          />
        </div>
      )}

      {/* Result Display */}
      {generatedImageUrl && (
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #ECECEA",
            background: "#111111",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          <img
            src={generatedImageUrl}
            alt="Generated 2K Campaign Creative"
            style={{ width: "100%", maxHeight: 520, objectFit: "cover" }}
          />
          <div
            style={{
              width: "100%",
              padding: 14,
              background: "#FFFFFF",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              borderTop: "1px solid #ECECEA",
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111111" }}>
                Founding Member #{memberNumber} Campaign Creative
              </div>
              <div style={{ fontSize: 11, color: "#8A8A85" }}>2K Ultra-HD · Styled for {faceShape}</div>
            </div>
            <a
              href={generatedImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={`unseen-men-creative-${memberNumber}.jpg`}
              className="btn-primary"
              style={{
                textDecoration: "none",
                fontSize: 12,
                padding: "8px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Download 2K Image ↓
            </a>
          </div>
        </div>
      )}

      {/* Error Feedback */}
      {error && (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: "#FDF2F2",
            border: "1px solid #F8D7DA",
            color: "#991B1B",
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          <strong>Notice:</strong> {error}
        </div>
      )}

      {/* Status Progress */}
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 14,
            borderRadius: 8,
            background: "#F4EDE4",
            color: "#4F2C1D",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              border: "2px solid #4F2C1D",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span>{statusMessage}</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="btn-primary"
        style={{
          width: "100%",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        <span>✨</span>
        <span>{generatedImageUrl ? "Regenerate New Creative" : "Generate 2K Campaign Creative"}</span>
      </button>
    </div>
  );
}
