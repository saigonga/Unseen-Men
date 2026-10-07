"use client";

import { useState } from "react";
import { checkIndianMobile, isEmail } from "@/lib/phone";

export interface Lead { name: string; mobile: string; email: string | null }

export default function UnlockForm({ onUnlock }: { onUnlock: (l: Lead) => void }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [errs, setErrs] = useState<{ name?: string; mobile?: string; email?: string }>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim().replace(/\s+/g, " ");
    const phone = checkIndianMobile(mobile);
    const em = email.trim();
    const next: typeof errs = {};
    if (!/^[\p{L}][\p{L} .'-]{1,39}$/u.test(n)) next.name = "Enter your first name (letters only).";
    if (!phone.ok) next.mobile = phone.error;
    if (em && !isEmail(em)) next.email = "Check your email address, or leave it empty.";
    setErrs(next);
    if (Object.keys(next).length || !phone.ok) return;
    onUnlock({ name: n, mobile: phone.pretty, email: em || null });
  }

  return (
    <form className="lock" onSubmit={submit} noValidate>
      <span className="eyebrow">Free full report</span>
      <h3>Unlock your beard verdict, try-on, skin read and routine</h3>
      <p className="small muted">Join the Nordman waitlist. We&apos;ll send your report and launch discount on WhatsApp.</p>
      <div className="field">
        <label htmlFor="uName" className="small">First name</label>
        <input id="uName" autoComplete="given-name" value={name} onChange={e => setName(e.target.value)} aria-invalid={!!errs.name} />
        {errs.name && <span className="err">{errs.name}</span>}
      </div>
      <div className="field">
        <label htmlFor="uMobile" className="small">WhatsApp mobile number</label>
        <div className="phone">
          <span>+91</span>
          <input id="uMobile" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile" maxLength={16}
            value={mobile} onChange={e => setMobile(e.target.value)} aria-invalid={!!errs.mobile} />
        </div>
        {errs.mobile && <span className="err">{errs.mobile}</span>}
      </div>
      <div className="field">
        <label htmlFor="uEmail" className="small">Email <span className="muted">(optional)</span></label>
        <input id="uEmail" type="email" inputMode="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!errs.email} />
        {errs.email && <span className="err">{errs.email}</span>}
      </div>
      <button className="primary" type="submit">Unlock my report</button>
      <p className="small muted">Placeholder: nothing you enter here is saved or sent yet.</p>
    </form>
  );
}
