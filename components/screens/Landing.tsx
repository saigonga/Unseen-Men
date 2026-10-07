export default function Landing({ onStart }: { onStart: () => void }) {
  return (
    <section className="hero">
      <span className="eyebrow">Face Scan · Nordman pre-launch</span>
      <h1>Know your face. Get the cut.</h1>
      <p className="lede">Most men never find out their face shape. Scan yours in 30 seconds and see which haircuts and beard styles actually suit it.</p>
      <div className="chart" aria-label="The six face shapes">
        <div><svg viewBox="0 0 44 52"><ellipse cx="22" cy="26" rx="15" ry="22" /></svg>Oval</div>
        <div><svg viewBox="0 0 44 52"><circle cx="22" cy="26" r="18" /></svg>Round</div>
        <div><svg viewBox="0 0 44 52"><rect x="5" y="7" width="34" height="38" rx="6" /></svg>Square</div>
        <div><svg viewBox="0 0 44 52"><rect x="8" y="3" width="28" height="46" rx="6" /></svg>Rectangle</div>
        <div><svg viewBox="0 0 44 52"><path d="M5 10 Q22 2 39 10 Q38 34 22 49 Q6 34 5 10Z" /></svg>Heart</div>
        <div><svg viewBox="0 0 44 52"><path d="M22 3 L39 24 L22 49 L5 24Z" /></svg>Diamond</div>
      </div>
      <button className="primary" onClick={onStart}>Start the scan</button>
      <div className="privacy">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flex: "none", marginTop: 2 }}>
          <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        <span>Your face is measured on your own phone. Your photo is never saved.</span>
      </div>
    </section>
  );
}
