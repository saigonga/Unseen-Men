export default function Tips({ onNext }: { onNext: () => void }) {
  return (
    <section className="stack">
      <span className="eyebrow">Step 2 of 4 · Before the photo</span>
      <h2>Get an accurate read</h2>
      <div className="tips">
        <div className="tip">
          <svg viewBox="0 0 40 40"><circle cx="12" cy="22" r="7" /><circle cx="28" cy="22" r="7" /><path d="M19 22h2M3 6l34 30" /></svg>
          <div><strong>Glasses off</strong><p className="small muted">Frames hide your cheekbone width.</p></div>
        </div>
        <div className="tip">
          <svg viewBox="0 0 40 40"><ellipse cx="20" cy="23" rx="11" ry="14" /><path d="M9 16c4-7 18-7 22 0M20 2v6M14 4l2 5M26 4l-2 5" /></svg>
          <div><strong>Hair off your forehead</strong><p className="small muted">A fringe changes how wide your forehead reads.</p></div>
        </div>
        <div className="tip">
          <svg viewBox="0 0 40 40"><rect x="4" y="5" width="16" height="24" rx="1" /><path d="M12 5v24M4 17h16" /><ellipse cx="30" cy="22" rx="6" ry="8" /></svg>
          <div><strong>Face a window</strong><p className="small muted">Overhead light throws shadows on your jaw.</p></div>
        </div>
        <div className="tip">
          <svg viewBox="0 0 40 40"><ellipse cx="20" cy="20" rx="12" ry="15" /><path d="M15 27h10" /><circle cx="15" cy="17" r="1.2" /><circle cx="25" cy="17" r="1.2" /></svg>
          <div><strong>Straight on, neutral face</strong><p className="small muted">Arm&apos;s length away, mouth closed. A smile widens the jaw.</p></div>
        </div>
      </div>
      <button className="primary" onClick={onNext}>I&apos;m ready</button>
    </section>
  );
}
