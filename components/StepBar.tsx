export default function StepBar({
  step,
  total = 4,
  onClose,
}: {
  step: number;
  total?: number;
  onClose?: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: "0.08em",
            color: "#4F2C1D",
          }}
        >
          NODD MEN
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12.5, color: "#8A8A85" }}>
            Step {step} of {total}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px 6px",
                fontSize: 18,
                color: "#8A8A85",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))`,
          gap: 4,
        }}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            style={{
              height: 2,
              background: i < step ? "#111111" : "#ECECEA",
              transition: "background 0.2s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
