"use client";

import { useState } from "react";
import { REWARD } from "@/lib/content";
import { inviteLink } from "@/lib/referral";

export default function Rewards({ code, position, referrals }: { code: string; position: number; referrals: number }) {
  const [label, setLabel] = useState("Copy invite");

  async function copy() {
    const text = `I just found my face shape on UNSEEN MEN Face Scan. Try it with my code ${code}: ${inviteLink(code)}`;
    try { await navigator.clipboard.writeText(text); setLabel("Copied"); }
    catch { setLabel(code); }
    setTimeout(() => setLabel("Copy invite"), 1600);
  }

  return (
    <div className="reward">
      <span className="eyebrow">Nordman early list</span>
      <h3>You&apos;re #{position} on the list</h3>
      <p className="small">Get {REWARD.referralsNeeded} friends to scan with your code to unlock <strong>{REWARD.label}</strong>.</p>
      <div className="meter">
        {Array.from({ length: REWARD.referralsNeeded }, (_, i) => <i key={i} className={i < referrals ? "on" : ""} />)}
      </div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="code">{code}</span>
        <button onClick={copy}>{label}</button>
      </div>
      <p className="small muted">Reward and position are demo values until the waitlist backend is connected.</p>
    </div>
  );
}
