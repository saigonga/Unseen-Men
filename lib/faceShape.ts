/* Face-shape model, ported 1:1 from face-scan.html. Pure functions, no DOM.
   Landmark indices are face-api 68-point; phase 3 swaps in MediaPipe equivalents. */
import { dist, mid, angle } from "./geometry.ts";
import type { Pt } from "./geometry.ts";
import { NORM, Z_CLAMP, FULL_BEARD_WEIGHT, SHAPE_OFFSET, SOFTMAX_T, TRAIT_Z, LEAN_RATIO } from "./faceShape.config.ts";
import type { MeasureKey } from "./faceShape.config.ts";
import { CUTS, SHAPES, BEARD_TWEAK } from "./content.ts";
import type { Beard, Cut, Pair, ShapeKey, TraitKey } from "./content.ts";

export type Measures = Record<MeasureKey, number>;
export type ZScores = Record<MeasureKey | "A", number>;
export type Ranked = [ShapeKey, number][];
export interface Trait { key: TraitKey; label: string; z: number; f: keyof ZScores }
export interface RankedCut extends Cut { score: number; hits: TraitKey[] }

export function measure(P: Pt[]): Measures {
  const W = dist(P[1], P[15]);                    // cheekbone line
  const lower = dist(mid(P[19], P[24]), P[8]);
  return {
    R: lower * 1.5 / W,                           // face length ÷ width (brow-to-chin ≈ 2/3 of length)
    J: dist(P[4], P[12]) / W,                     // jaw ÷ cheekbones
    F: dist(P[17], P[26]) / W,                    // brow span (forehead proxy) ÷ cheekbones
    K: dist(P[6], P[10]) / W,                     // chin ÷ cheekbones
    G: (angle(P[2], P[4], P[7]) + angle(P[14], P[12], P[9])) / 2, // jaw-corner angle: smaller = sharper
  };
}

const clampZ = (v: number) => Math.max(-Z_CLAMP, Math.min(Z_CLAMP, v));

export function zScores(m: Measures, beard: Beard | null): ZScores {
  const z = {} as ZScores;
  for (const k of Object.keys(NORM) as MeasureKey[]) z[k] = clampZ((m[k] - NORM[k][0]) / NORM[k][1]);
  z.A = -z.G;                                     // angularity: positive = sharper jaw corner
  if (beard === "full") { z.J *= FULL_BEARD_WEIGHT; z.K *= FULL_BEARD_WEIGHT; z.A *= FULL_BEARD_WEIGHT; }
  return z;
}

export function shapeScores(z: ZScores): Record<ShapeKey, number> {
  const { R, J, F, K, A } = z, o = SHAPE_OFFSET;
  return {
    rectangle: R + 0.5 * J + 0.4 * A + o.rectangle,
    square: -0.8 * R + J + 0.6 * A + o.square,
    round: -R - 0.7 * A - 0.2 * Math.abs(J) + o.round,
    heart: F - J - 0.6 * K + o.heart,
    diamond: -F - 0.6 * J - 0.3 * K + o.diamond,
    oval: o.oval - 0.45 * Math.max(Math.abs(R), Math.abs(J), Math.abs(F), Math.abs(K), Math.abs(A)) + 0.2 * R,
  };
}

export function classify(z: ZScores): Ranked {
  const ex = (Object.entries(shapeScores(z)) as [ShapeKey, number][]).map(([k, v]) => [k, Math.exp(v / SOFTMAX_T)] as [ShapeKey, number]);
  const tot = ex.reduce((a, [, v]) => a + v, 0);
  return ex.map(([k, v]) => [k, v / tot] as [ShapeKey, number]).sort((a, b) => b[1] - a[1]);
}

/** Traits: what makes this face different from the average. These drive the cut ranking. */
export const TRAIT_DEF: [keyof ZScores, TraitKey, string, TraitKey, string][] = [
  ["R", "long", "Longer face", "short", "Shorter face"],
  ["J", "wideJaw", "Wide jaw", "narrowJaw", "Narrow jaw"],
  ["F", "wideForehead", "Wide forehead", "narrowForehead", "Narrow forehead"],
  ["K", "broadChin", "Broad chin", "pointedChin", "Pointed chin"],
  ["A", "sharpJaw", "Sharp jaw angle", "softJaw", "Soft jawline"],
];
export const TRAIT_LABEL = Object.fromEntries(
  TRAIT_DEF.flatMap(([, h, hl, l, ll]) => [[h, hl], [l, ll]])
) as Record<TraitKey, string>;

export function traitsOf(z: ZScores): Trait[] {
  const t: Trait[] = [];
  for (const [k, hi, hiL, lo, loL] of TRAIT_DEF) {
    if (z[k] >= TRAIT_Z) t.push({ key: hi, label: hiL, z: z[k], f: k });
    else if (z[k] <= -TRAIT_Z) t.push({ key: lo, label: loL, z: z[k], f: k });
  }
  return t.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
}

/** Normal CDF → percentile (0–100). */
export function pct(zz: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(zz)), dd = 0.3989423 * Math.exp(-zz * zz / 2);
  const p = dd * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return Math.round((zz > 0 ? 1 - p : p) * 100);
}

export function rankCuts(shape: ShapeKey, traits: Trait[]): RankedCut[] {
  const tk = traits.map(t => t.key);
  return CUTS.map(c => {
    let sc = c.s.includes(shape) ? 2 : 0;
    const hits: TraitKey[] = [];
    tk.forEach((k, i) => {
      const w = i < 2 ? 1.2 : 0.8;
      if (c.good.includes(k)) { sc += w; hits.push(k); }
      if (c.bad.includes(k)) sc -= 2 * w;
    });
    return { ...c, score: sc, hits };
  }).sort((a, b) => b.score - a.score);
}

export function avoidList(shape: ShapeKey, ranked: RankedCut[], traits: Trait[]): Pair[] {
  const sh = SHAPES[shape];
  const worst = ranked.filter(c => c.score < 0).slice(-1)[0];
  const avoid: Pair[] = [sh.avoid[0]];
  if (worst) {
    const hurt = worst.bad.filter(b => traits.some(t => t.key === b)).map(b => TRAIT_LABEL[b].toLowerCase());
    avoid.push([worst.n, `Works against your ${hurt.join(" and ")}.`]);
  } else avoid.push(sh.avoid[1]);
  return avoid;
}

export const beardTweaks = (traits: Trait[]) =>
  traits.map(t => BEARD_TWEAK[t.key]).filter((s): s is string => Boolean(s)).slice(0, 2);

export interface FaceResult {
  m: Measures;
  z: ZScores;
  scores: Record<ShapeKey, number>;
  ranked: Ranked;
  key: ShapeKey;
  traits: Trait[];
  cuts: RankedCut[];
  avoid: Pair[];
  beardTweaks: string[];
  lean: ShapeKey | null;
}

export const analyse = (P: Pt[], beard: Beard | null): FaceResult => analyseMeasures(measure(P), beard);

export function analyseMeasures(m: Measures, beard: Beard | null): FaceResult {
  const z = zScores(m, beard);
  const ranked = classify(z);
  const key = ranked[0][0];
  const traits = traitsOf(z);
  const all = rankCuts(key, traits);
  return {
    m, z, scores: shapeScores(z), ranked, key, traits,
    cuts: all.slice(0, 3),
    avoid: avoidList(key, all, traits),
    beardTweaks: beardTweaks(traits),
    lean: ranked[1][1] >= ranked[0][1] * LEAN_RATIO ? ranked[1][0] : null,
  };
}
