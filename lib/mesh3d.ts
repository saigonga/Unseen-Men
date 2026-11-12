/* Use MediaPipe's estimated depth to align the face mesh before measuring its proportions. */

export interface P3 { x: number; y: number; z: number }

const sub = (a: P3, b: P3): P3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const add = (a: P3, b: P3): P3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const mul = (a: P3, k: number): P3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
const dot = (a: P3, b: P3) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: P3, b: P3): P3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const len = (a: P3) => Math.sqrt(dot(a, a));
const norm = (a: P3): P3 => mul(a, 1 / (len(a) || 1));

/** MediaPipe landmark indices used below (face-api 68 equivalents in brackets). */
export const IDX = {
  top: 10, chin: 152,
  cheekL: 454, cheekR: 234,           // [1] [15] widest cheekbone points
  jawL: 397, jawR: 172,               // [4] [12] jaw corners (gonion)
  jawMidL: 379, jawMidR: 150,         // [5] [11]
  chinL: 378, chinR: 148,             // [6] [10]
  jawUpL: 361, jawUpR: 132,           // [2] [14]
  chinInL: 377, chinInR: 149,         // [7] [9]
  templeL: 284, templeR: 54,
  foreL: 332, foreR: 103,
  browL: 300, browR: 70,
  eyeOutL: 263, eyeOutR: 33,
  noseTip: 1,
} as const;

/** Rotate + scale one frame's 3D points into a straight-on face frame.
 *  x = across the face (cheek to cheek, eye to eye), y = down the face (forehead to chin), z = depth.
 *  Unit = distance between the outer eye corners, so frames at different distances line up. */
export function canonicalize(P: P3[]): P3[] | null {
  if (!P || P.length < 468) return null;
  const xRaw = add(sub(P[IDX.cheekL], P[IDX.cheekR]), sub(P[IDX.eyeOutL], P[IDX.eyeOutR]));
  const x = norm(xRaw);
  const yRaw = sub(P[IDX.chin], P[IDX.top]);
  const y = norm(sub(yRaw, mul(x, dot(yRaw, x))));
  const z = cross(x, y);
  const o = mul(add(P[IDX.eyeOutL], P[IDX.eyeOutR]), 0.5);
  const unit = len(sub(P[IDX.eyeOutL], P[IDX.eyeOutR]));
  if (!unit) return null;
  return P.map(p => {
    const d = sub(p, o);
    return { x: dot(d, x) / unit, y: dot(d, y) / unit, z: dot(d, z) / unit };
  });
}

/** Head turn (degrees) read from the mesh itself: how far the face's depth axis points sideways. */
export function yawOf(P: P3[]): number {
  const x = norm(add(sub(P[IDX.cheekL], P[IDX.cheekR]), sub(P[IDX.eyeOutL], P[IDX.eyeOutR])));
  return Math.asin(Math.max(-1, Math.min(1, x.z))) * 180 / Math.PI;
}

export interface Raw3D { R: number; J: number; F: number; K: number; G: number }

const wx = (P: P3[], a: number, b: number) => Math.abs(P[a].x - P[b].x);
function angle2(a: P3, b: P3, c: P3) {
  const v1x = a.x - b.x, v1y = a.y - b.y, v2x = c.x - b.x, v2y = c.y - b.y;
  const cos = (v1x * v2x + v1y * v2y) / (Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y));
  return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
}

/** Measurements on a straight-on (canonical) mesh, as seen from directly in front.
 *  Combines trichion-to-chin height with hair-invariant eye-to-chin ratio so forehead bangs
 *  cannot artificially compress face length. */
export function measureCanonical(C: P3[]): Raw3D {
  const W = wx(C, IDX.cheekL, IDX.cheekR);
  const L = Math.abs(C[IDX.chin].y - C[IDX.top].y);
  const eyeMidY = (C[IDX.eyeOutL].y + C[IDX.eyeOutR].y) / 2;
  const eyeChin = Math.abs(C[IDX.chin].y - eyeMidY) / W;
  return {
    R: 0.60 * (L / W) + 0.40 * (eyeChin * 1.50),
    J: (0.65 * wx(C, IDX.jawL, IDX.jawR) + 0.35 * wx(C, IDX.jawMidL, IDX.jawMidR)) / W,
    F: (0.45 * wx(C, IDX.templeL, IDX.templeR) + 0.35 * wx(C, IDX.foreL, IDX.foreR) + 0.20 * wx(C, IDX.browL, IDX.browR)) / W,
    K: wx(C, IDX.chinL, IDX.chinR) / W,
    G: (angle2(C[IDX.jawUpL], C[IDX.jawL], C[IDX.chinInL]) + angle2(C[IDX.jawUpR], C[IDX.jawR], C[IDX.chinInR])) / 2,
  };
}

const median = (a: number[]) => {
  const s = [...a].sort((p, q) => p - q), n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};

const KEYS = ["R", "J", "F", "K", "G"] as const;

/** Drop noisy outlier frames (> 2.2 MAD from batch median) while preserving at least half the batch. */
export function filterOutliers<T extends Raw3D>(list: T[]): T[] {
  if (list.length < 4) return list;
  const med = {} as Raw3D;
  const mad = {} as Raw3D;
  for (const k of KEYS) {
    const v = list.map(r => r[k]);
    med[k] = median(v);
    mad[k] = Math.max(median(v.map(x => Math.abs(x - med[k]))) * 1.4826, k === "G" ? 1.2 : 0.008);
  }
  const scored = list.map(r => {
    let maxDev = 0;
    for (const k of KEYS) {
      maxDev = Math.max(maxDev, Math.abs(r[k] - med[k]) / mad[k]);
    }
    return { r, maxDev };
  });
  const clean = scored.filter(s => s.maxDev <= 2.2).map(s => s.r);
  if (clean.length >= Math.ceil(list.length / 2)) return clean;
  return scored.sort((a, b) => a.maxDev - b.maxDev).slice(0, Math.ceil(list.length / 2)).map(s => s.r);
}

/** Combine many frames: reject outliers, measure each straight-on mesh, take the median of each number. */
export function combine(list: Raw3D[]): { m: Raw3D; spread: Raw3D; n: number } {
  const clean = filterOutliers(list);
  const m = {} as Raw3D, spread = {} as Raw3D;
  for (const k of KEYS) {
    const v = clean.map(r => r[k]);
    m[k] = median(v);
    spread[k] = median(v.map(x => Math.abs(x - m[k]))) * 1.4826;
  }
  return { m, spread, n: clean.length };
}
