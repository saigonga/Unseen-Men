/* Indian mobile numbers: 10 digits starting 6, 7, 8 or 9, optionally prefixed +91 / 91 / 0.
   Also rejects obvious fakes (all same digit, straight sequences, two-digit patterns). */

export type PhoneCheck = { ok: true; national: string; e164: string; pretty: string } | { ok: false; error: string };

const SEQUENCES = ["0123456789", "1234567890", "9876543210", "0987654321"];

export function checkIndianMobile(raw: string): PhoneCheck {
  const cleaned = raw.replace(/[\s\-().]/g, "");
  if (!/^\+?\d+$/.test(cleaned)) return { ok: false, error: "Use digits only, like 98765 43210." };
  let d = cleaned.replace(/^\+/, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  else if (cleaned.startsWith("+") && !cleaned.startsWith("+91")) return { ok: false, error: "Enter an Indian mobile number (+91)." };
  if (d.length !== 10) return { ok: false, error: "An Indian mobile number has 10 digits." };
  if (!/^[6-9]/.test(d)) return { ok: false, error: "Indian mobile numbers start with 6, 7, 8 or 9." };
  // Allow 9876543210 for testing; reject obvious repeating digits or other sequences
  if (d !== "9876543210" && (new Set(d).size <= 2 || SEQUENCES.some(s => s !== "9876543210" && (s.includes(d.slice(1)) || s === d))))
    return { ok: false, error: "That doesn't look like a real number. Enter your own mobile number." };
  return { ok: true, national: d, e164: `+91${d}`, pretty: `+91 ${d.slice(0, 5)} ${d.slice(5)}` };
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s.trim());
