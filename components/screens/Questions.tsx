"use client";

import { useState } from "react";
import type { AgeBracket, Beard, Concern } from "@/lib/content";

export interface Answers { age: AgeBracket; beard: Beard; concern: Concern | null }

const AGES: [AgeBracket, string][] = [["18-24", "18–24"], ["25-34", "25–34"], ["35-44", "35–44"], ["45+", "45+"]];
const BEARDS: [Beard, string][] = [["none", "Clean shave"], ["stubble", "Stubble"], ["full", "Full beard"]];
const CONCERNS: [Concern, string][] = [["acne", "Breakouts"], ["spots", "Dark spots"], ["oil", "Oily skin"], ["dull", "Dull, tired"]];

function Options<T extends string>({ name, items, value, onChange }: { name: string; items: [T, string][]; value: T | null; onChange: (v: T) => void }) {
  return (
    <div className="opts">
      {items.map(([v, label]) => (
        <label className="opt" key={v}>
          <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}

export default function Questions({ initial, onDone }: { initial: Answers | null; onDone: (a: Answers) => void }) {
  const [age, setAge] = useState<AgeBracket | null>(initial?.age ?? null);
  const [beard, setBeard] = useState<Beard | null>(initial?.beard ?? null);
  const [concern, setConcern] = useState<Concern | null>(initial?.concern ?? null);
  const [adult, setAdult] = useState(Boolean(initial));
  const ok = Boolean(age && beard && adult);

  return (
    <section className="stack">
      <span className="eyebrow">Step 1 of 4 · About you</span>
      <h2>Three quick questions</h2>
      <div className="stack"><h3>Your age</h3><Options name="age" items={AGES} value={age} onChange={setAge} /></div>
      <div className="stack"><h3>Beard right now?</h3><Options name="beard" items={BEARDS} value={beard} onChange={setBeard} /></div>
      <div className="stack">
        <h3>Main skin concern <span className="muted small" style={{ fontFamily: "var(--body)", textTransform: "none" }}>optional</span></h3>
        <Options name="concern" items={CONCERNS} value={concern} onChange={setConcern} />
      </div>
      <label className="check">
        <input type="checkbox" checked={adult} onChange={e => setAdult(e.target.checked)} />
        <span>I&apos;m 18 or older and agree that my photo is analysed for this scan. It is not stored.</span>
      </label>
      <button className="primary" disabled={!ok} onClick={() => ok && onDone({ age: age!, beard: beard!, concern })}>Continue</button>
    </section>
  );
}
