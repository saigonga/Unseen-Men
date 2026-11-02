/* Referral helpers. Phase 5 moves code generation and counting to Supabase. */
const ABC = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_RE = /^UM-[A-HJ-KM-NP-Z2-9]{4}$/;
const REF_KEY = "um_referred_by";

export function newCode() {
  const r = crypto.getRandomValues(new Uint32Array(4));
  return "UM-" + Array.from(r, n => ABC[n % ABC.length]).join("");
}

/** Read ?ref=CODE once and remember who referred this visitor. */
export function captureReferral(): string | null {
  try {
    const ref = new URLSearchParams(location.search).get("ref")?.trim().toUpperCase();
    if (ref && CODE_RE.test(ref)) localStorage.setItem(REF_KEY, ref);
    return localStorage.getItem(REF_KEY);
  } catch { return null; }
}

export const inviteLink = (code: string) => `${location.origin}/?ref=${encodeURIComponent(code)}`;
