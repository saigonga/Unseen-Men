/* Use a consistent face size for still-image inference and pool measurements across passes. */
import { detectAt } from "./detector";
import type { Detection, FaceInput } from "./detector";
import { mpDetect } from "./mediapipe";
import { measure3DRaw, measureDetection, score3DMeasures } from "./faceShape";
import type { Measures } from "./faceShape";
import { filterOutliers, IDX } from "./mesh3d";
import { inputSize } from "./quality";
import { dist, mid } from "./geometry";

const KEYS = ["R", "J", "F", "K", "G"] as const;
const SIZES = [320, 416, 512, 608]; // face-api fallback sizes

const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

export interface RobustMeasures { m: Measures; n: number; raw3D: Measures | null }

function medianMeasures(list: Measures[]): Measures {
  return Object.fromEntries(KEYS.map(k => [k, median(list.map(m => m[k]))])) as Measures;
}

function canvasOf(input: FaceInput, flip: boolean) {
  const { W, H } = inputSize(input);
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  if (flip) { x.translate(W, 0); x.scale(-1, 1); }
  x.drawImage(input, 0, 0, W, H);
  return c;
}

function croppedPasses(input: FaceInput, detection: Detection) {
  const points = detection.P478!;
  const left = points[IDX.eyeOutL], right = points[IDX.eyeOutR];
  const centre = mid(left, right);
  const eyeWidth = dist(left, right);
  if (eyeWidth < 1) return [];
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  const { W, H } = inputSize(input);
  const passes: NonNullable<ReturnType<typeof mpDetect>>[] = [];
  for (const padding of [2.8, 3.3, 3.8]) {
    const scale = c.width / (eyeWidth * padding);
    for (const flip of [false, true]) {
      ctx.resetTransform();
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, c.width, c.height);
      if (flip) { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
      ctx.drawImage(input, c.width / 2 - centre.x * scale, c.height / 2 - (centre.y + eyeWidth * 0.35) * scale, W * scale, H * scale);
      const result = mpDetect(c);
      if (result) {
        const eyes = mid(result.P478[IDX.eyeOutL], result.P478[IDX.eyeOutR]);
        const expected = { x: c.width / 2, y: c.height / 2 - eyeWidth * scale * 0.35 };
        if (dist(eyes, expected) < c.width * 0.12) passes.push(result);
      }
    }
  }
  return passes;
}

/** face-api fallback: 4 sizes × 2 flips = 8 passes. */
async function faceApiPasses(input: FaceInput): Promise<Detection[]> {
  const list: Detection[] = [];
  for (const flip of [false, true]) {
    const c = canvasOf(input, flip);
    for (const s of SIZES) {
      const d = await detectAt(c, s);
      if (d) list.push(d);
    }
  }
  return list;
}

export async function robustMeasures(input: FaceInput, detection: Detection, frames: Detection[] = []): Promise<RobustMeasures | null> {
  const matchingFrames = frames.filter(frame => Boolean(frame.P478) === Boolean(detection.P478));
  const passes = matchingFrames.length ? matchingFrames : detection.P478
    ? croppedPasses(input, detection)
    : await faceApiPasses(input);
  const samples = (passes.length ? passes : [detection]).map(det => {
    const raw3D = measure3DRaw(det.P3);
    return { raw3D, m: raw3D ? score3DMeasures(raw3D) : measureDetection(det) };
  }).filter(({ m }) => KEYS.every(k => Number.isFinite(m[k])));
  if (!samples.length) return null;

  const clean = filterOutliers(samples.map(sample => sample.m));
  const raw = samples.filter(sample => sample.raw3D && clean.includes(sample.m)).map(sample => sample.raw3D!);
  const raw3D = raw.length === clean.length ? medianMeasures(raw) : null;
  return { m: raw3D ? score3DMeasures(raw3D) : medianMeasures(clean), n: clean.length, raw3D };
}
