"use client";

import { useState } from "react";

export interface Lead { name: string; contact: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s-]{10,15}$/;

export default function UnlockForm({ onUnlock }: { onUnlock: (l: Lead) => void }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim(), c = contact.trim();
    if (!n) return setErr("Add your first name.");
    if (!EMAIL.test(c) && !PHONE.test(c)) return setErr("Enter a WhatsApp number (10+ digits) or an email address.");
    setErr("");
    onUnlock({ name: n, contact: c });
  }

  return (
    <form className="lock" onSubmit={submit} noValidate>
      <span className="eyebrow">Free full report</span>
      <h3>Unlock your beard verdict, skin read and routine</h3>
      <p className="small muted">Join the Nordman waitlist. We&apos;ll send the PDF and your launch discount.</p>
      <div className="field">
        <label htmlFor="uName" className="small">First name</label>
        <input id="uName" required autoComplete="given-name" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="uContact" className="small">WhatsApp number or email</label>
        <input id="uContact" required inputMode="email" autoComplete="email" value={contact} onChange={e => setContact(e.target.value)} />
      </div>
      {err && <div className="notice bad">{err}</div>}
      <button className="primary" type="submit">Unlock my report</button>
      <p className="small muted">Placeholder: nothing you enter here is saved or sent yet.</p>
    </form>
  );
}
