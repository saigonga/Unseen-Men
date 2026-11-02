export interface Pt { x: number; y: number }
export interface Box { x: number; y: number; width: number; height: number }

export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
export const avgPts = (arr: Pt[]): Pt => ({
  x: arr.reduce((s, p) => s + p.x, 0) / arr.length,
  y: arr.reduce((s, p) => s + p.y, 0) / arr.length,
});

/** Angle at b (degrees) formed by a-b-c. */
export function angle(a: Pt, b: Pt, c: Pt) {
  const v1 = [a.x - b.x, a.y - b.y], v2 = [c.x - b.x, c.y - b.y];
  const cos = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]));
  return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
}
