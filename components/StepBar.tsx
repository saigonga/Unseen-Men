export default function StepBar({ index, total }: { index: number; total: number }) {
  return (
    <div className="bar">
      <span className="brand">Unseen Men</span>
      <div className="steps" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => <i key={i} className={i <= index ? "on" : ""} />)}
      </div>
    </div>
  );
}
