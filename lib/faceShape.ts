/* Face-shape model, ported 1:1 from face-scan.html. Pure functions, no DOM.
   Landmark indices are face-api 68-point; MediaPipe 478 uses pose-normalised 3D craniofacial mapping. */
import { dist, mid, angle, avgPts } from "./geometry.ts";
import type { Pt } from "./geometry.ts";
import { NORM, MP_NORM, MP3D_NORM, MP_PITCH_COMP, Z_CLAMP, FULL_BEARD_WEIGHT, SHAPE_OFFSET, SOFTMAX_T, TRAIT_Z, LEAN_RATIO } from "./faceShape.config.ts";
import type { MeasureKey } from "./faceShape.config.ts";
import { MP_TO_68 } from "./landmarkMap.ts";
import { canonicalize, measureCanonical } from "./mesh3d.ts";
import type { P3, Raw3D } from "./mesh3d.ts";
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

/** Smooth cubic deadzone for sub-trait measurement noise while preserving >=0.75 SD traits. */
function softZ(z: number): number {
  const s = Math.sign(z);
  const a = Math.abs(z);
  const { softDeadzone: d, softGain: g } = MP_PITCH_COMP;
  if (a < d) return s * a * ((1 - g) * (a / d) * (a / d) + g);
  return z;
}

function mapRawToNorm(raw: Raw3D, srcNorm: Record<MeasureKey, [number, number]>): Measures {
  const mapped = {} as Measures;
  for (const k of Object.keys(NORM) as MeasureKey[]) {
    const zRaw = (raw[k] - srcNorm[k][0]) / srcNorm[k][1];
    mapped[k] = NORM[k][0] + softZ(zRaw) * NORM[k][1];
  }
  return mapped;
}

/** Pose-normalised 3D craniofacial measurements mapped to canonical NORM scale.
 *  Uses estimated depth to reduce the effect of head pose. */
export function measure3D(P3pts: P3[]): Measures {
  const raw = measure3DRaw(P3pts);
  return raw ? score3DMeasures(raw) : measureMP(P3pts);
}

export function measure3DRaw(points?: P3[] | null): Measures | null {
  const canonical = points && canonicalize(points);
  if (!canonical) return null;
  const raw = measureCanonical(canonical);
  return Object.values(raw).every(Number.isFinite) ? raw : null;
}

export function score3DMeasures(raw: Measures, norms = MP3D_NORM): Measures {
  return mapRawToNorm(raw, norms);
}

/** Calibrated MediaPipe 478-point 2D fallback measurements mapped to canonical NORM scale. */
export function measureMP(P478: Pt[]): Measures {
  if (!P478 || P478.length < 468) return measure(P478);
  const P = MP_TO_68.map(i => P478[i]);

  const W_68 = dist(P[1], P[15]);
  const W_zygo = dist(P478[234], P478[454]);
  const W = 0.5 * W_68 + 0.5 * W_zygo;

  const eyeL = avgPts(P.slice(36, 42));
  const eyeR = avgPts(P.slice(42, 48));
  const eyeMid = mid(eyeL, eyeR);
  const browMid = mid(P[19], P[24]);
  const cy = 0.65 * eyeMid.y + 0.35 * browMid.y;

  const lowerH = (P[8].y - cy) / W;
  const fullH = dist(P478[10], P478[152]) / W;
  const eyeH = dist(eyeMid, P478[152]) / W;
  const R_mp = 0.40 * (fullH * 1.13) + 0.35 * (eyeH * 1.74) + 0.25 * (lowerH * 2.06);

  const F_mp = (
    0.45 * dist(P478[54], P478[284]) +
    0.35 * dist(P478[103], P478[332]) +
    0.20 * dist(P478[70], P478[300])
  ) / W;

  const J_mp = (0.65 * dist(P[4], P[12]) + 0.35 * dist(P[5], P[11])) / W;
  const K_mp = dist(P[6], P[10]) / W;

  const G_2d = (angle(P[2], P[4], P[7]) + angle(P[14], P[12], P[9])) / 2;
  const G_mp = G_2d + MP_PITCH_COMP.degPerUnit * (MP_PITCH_COMP.baseLowerH - lowerH);

  return mapRawToNorm({ R: R_mp, J: J_mp, F: F_mp, K: K_mp, G: G_mp }, MP_NORM);
}

/** Measure from a Detection object, preferring pose-normalised 3D mesh (P3), then 2D P478, then 68-pt. */
export function measureDetection(det: { P: Pt[]; P478?: Pt[] | null; P3?: P3[] | null }): Measures {
  if (det.P3 && det.P3.length >= 468) return measure3D(det.P3);
  return det.P478 && det.P478.length >= 468 ? measureMP(det.P478) : measure(det.P);
}

/** Ratios from the accepted mesh measurements, before scoring. */
export function rawProportions(det: { P: Pt[]; P3?: P3[] | null }, raw3D?: Measures | null) {
  const mesh = raw3D ?? measure3DRaw(det.P3);
  const raw = mesh ?? measure(det.P);
  return {
    lengthToWidth: Number(raw.R.toFixed(2)),
    jawToCheek: Number(raw.J.toFixed(2)),
    foreheadToCheek: Number(raw.F.toFixed(2)),
    chinToCheek: Number(raw.K.toFixed(2)),
    jawAngleDeg: Math.round(raw.G),
    is3D: Boolean(mesh),
  };
}

export function shapeHeadline(r: FaceResult): string {
  const s1 = SHAPES[r.key].name;
  if (!r.lean) return s1;
  const s2 = SHAPES[r.lean].name;
  return `${[s1, s2].sort().join("–")} Blend`;
}

const clampZ = (v: number) => Math.max(-Z_CLAMP, Math.min(Z_CLAMP, v));

export function zScores(m: Measures, beard: Beard | null): ZScores {
  const z = {} as ZScores;
  for (const k of Object.keys(NORM) as MeasureKey[]) z[k] = clampZ((m[k] - NORM[k][0]) / NORM[k][1]);
  z.A = -z.G;                                     // angularity: positive = sharper jaw corner
  if (beard === "full") { z.J *= FULL_BEARD_WEIGHT; z.K *= FULL_BEARD_WEIGHT; z.A *= FULL_BEARD_WEIGHT; }
  return z;
}

export function shapeScores(z: ZScores, o = SHAPE_OFFSET): Record<ShapeKey, number> {
  const { R, J, F, K, A } = z;
  return {
    rectangle: R + 0.5 * J + 0.4 * A + o.rectangle,
    square: -0.8 * R + J + 0.6 * A + o.square,
    round: -R - 0.7 * A - 0.2 * Math.abs(J) + o.round,
    heart: F - J - 0.6 * K + o.heart,
    diamond: -F - 0.6 * J - 0.3 * K + o.diamond,
    oval: o.oval - 0.45 * Math.max(Math.abs(R), Math.abs(J), Math.abs(F), Math.abs(K), Math.abs(A)) + 0.2 * R,
  };
}

export function classify(z: ZScores, offsets = SHAPE_OFFSET): Ranked {
  const ex = (Object.entries(shapeScores(z, offsets)) as [ShapeKey, number][]).map(([k, v]) => [k, Math.exp(v / SOFTMAX_T)] as [ShapeKey, number]);
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
