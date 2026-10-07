/* Checks the ported face-shape logic gives exactly the same answers as face-scan.html.
   Run: npm run test:logic */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyse } from "../lib/faceShape.ts";
import type { Pt } from "../lib/geometry.ts";
import type { Beard } from "../lib/content.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "face-scan.html"), "utf8");
const slice = (from: string, to: string) => {
  const a = html.indexOf(from), b = html.indexOf(to, a);
  if (a < 0 || b < 0) throw new Error(`marker not found: ${from}`);
  return html.slice(a, b);
};

// Pull the prototype's own functions out of the HTML and run them as-is.
const protoSrc = [
  slice("const SHAPES = {", "const SKIN_AREAS"),
  slice("const d = (a,b)", "async function detect"),
  slice("function ang(a,b,c)", "function drawOverlay"),
].join("\n");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proto: any = new Function(`${protoSrc}
  return { measure, zScores, classify, traitsOf, rankCuts, SHAPES, TRAIT_LABEL, BEARD_TWEAK };`)();

function protoAnalyse(P: Pt[], beard: Beard) {
  const m = proto.measure(P), z = proto.zScores(m, beard), ranked = proto.classify(z);
  const key = ranked[0][0], traits = proto.traitsOf(z), sh = proto.SHAPES[key];
  const cuts = proto.rankCuts(key, traits);
  const worst = cuts.filter((c: { score: number }) => c.score < 0).slice(-1)[0];
  const avoid = [sh.avoid[0]];
  if (worst) {
    const hurt = worst.bad.filter((b: string) => traits.some((t: { key: string }) => t.key === b)).map((b: string) => proto.TRAIT_LABEL[b].toLowerCase());
    avoid.push([worst.n, `Works against your ${hurt.join(" and ")}.`]);
  } else avoid.push(sh.avoid[1]);
  const tweaks = traits.map((t: { key: string }) => proto.BEARD_TWEAK[t.key]).filter(Boolean).slice(0, 2);
  const [k2, p2] = ranked[1];
  return { key, ranked, z, cuts: cuts.slice(0, 3).map((c: { n: string }) => c.n), avoid, tweaks, lean: p2 >= ranked[0][1] * 0.6 ? k2 : null };
}

// Seeded random so failures are reproducible.
let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const jitter = (s: number) => (rnd() - 0.5) * 2 * s;

function syntheticFace(): Pt[] {
  const cx = 500, cy = 520, w = 180 * (1 + jitter(0.08)), h = 245 * (1 + jitter(0.1));
  const P: Pt[] = Array.from({ length: 68 }, () => ({ x: cx, y: cy }));
  const jawW = 1.108 * (1 + jitter(0.03)), chinW = 1.26 * (1 + jitter(0.07));
  for (let i = 0; i <= 16; i++) {          // jaw contour, ear to ear via chin
    const t = Math.PI * (i / 16);
    const narrow = i >= 4 && i <= 12 ? (Math.abs(i - 8) <= 2 ? chinW : jawW) : 1;
    P[i] = { x: cx - Math.cos(t) * w * narrow + jitter(4), y: cy - 40 + Math.sin(t) * h + jitter(4) };
  }
  const browW = 0.944 * (1 + jitter(0.04));
  for (let i = 17; i <= 26; i++) P[i] = { x: cx + (i - 21.5) / 4.5 * w * 0.85 * browW, y: cy - 120 + jitter(3) };
  for (let i = 27; i <= 35; i++) P[i] = { x: cx + jitter(2), y: cy - 80 + (i - 27) * 12 };
  for (let i = 36; i <= 47; i++) P[i] = { x: cx + (i < 42 ? -70 : 70) + jitter(10), y: cy - 80 + jitter(3) };
  for (let i = 48; i <= 67; i++) P[i] = { x: cx + jitter(40), y: cy + 90 + jitter(5) };
  return P;
}

const beards: Beard[] = ["none", "stubble", "full"];
const N = 2000;
let fails = 0;
const tally: Record<string, number> = {};
for (let n = 0; n < N; n++) {
  const P = syntheticFace(), beard = beards[n % 3];
  const a = analyse(P, beard), b = protoAnalyse(P, beard);
  tally[a.key] = (tally[a.key] ?? 0) + 1;
  const same =
    a.key === b.key &&
    a.lean === b.lean &&
    JSON.stringify(a.cuts.map(c => c.n)) === JSON.stringify(b.cuts) &&
    JSON.stringify(a.avoid) === JSON.stringify(b.avoid) &&
    JSON.stringify(a.beardTweaks) === JSON.stringify(b.tweaks) &&
    a.ranked.every(([k, p], i) => k === b.ranked[i][0] && Math.abs(p - b.ranked[i][1]) < 1e-12) &&
    (Object.keys(b.z) as (keyof typeof a.z)[]).every(k => Math.abs(a.z[k] - b.z[k]) < 1e-12);
  if (!same) { fails++; if (fails <= 3) console.error("MISMATCH", { beard, ours: a.key, proto: b.key }); }
}
console.log(`Compared ${N} synthetic faces against face-scan.html: ${fails ? `${fails} MISMATCHES` : "all identical"}.`);
console.log("Shape spread (synthetic, not real faces):", tally);
process.exit(fails ? 1 : 0);
