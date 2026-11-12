/* Stable measurements. A single landmark pass is noisy: the jaw-width spread between people is
   only ~2%, about the same as the model's own jitter, so one pass can flip the face shape.
   Phase 3: MediaPipe is the primary detector. We still do multiple passes (mirrored image)
   and take the median. MediaPipe's 478-point model is steadier than face-api's 68-point,
   so fewer passes are needed, but mirroring still helps catch asymmetry noise.
   Falls back to face-api multi-size if MediaPipe isn't available. */
import { detectAt } from "./detector";
import type { Detection, FaceInput } from "./detector";
import { isMediaPipeReady, mpDetect } from "./mediapipe";
import { measure, measureDetection } from "./faceShape";
import type { Measures } from "./faceShape";
import { inputSize } from "./quality";

const KEYS = ["R", "J", "F", "K", "G"] as const;
const SIZES = [320, 416, 512, 608]; // face-api fallback sizes

const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

export interface RobustMeasures { m: Measures; n: number; spread: Measures }

export function medianMeasures(list: Measures[]): RobustMeasures {
  const m = {} as Measures, spread = {} as Measures;
  for (const k of KEYS) {
    const v = list.map(x => x[k]);
    m[k] = median(v);
    spread[k] = median(v.map(x => Math.abs(x - m[k]))) * 1.4826; // robust SD (MAD)
  }
  return { m, n: list.length, spread };
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

/** MediaPipe path: original + mirrored = 2 passes + multi-frame MediaPipe shots. */
async function robustMP(input: FaceInput, extra: Measures[]): Promise<Measures[]> {
  const list: Measures[] = [...extra];
  for (const flip of [false, true]) {
    const c = canvasOf(input, flip);
    const mp = mpDetect(c);
    if (mp) list.push(measureDetection(mp));
  }
  return list;
}

/** face-api fallback: 4 sizes × 2 flips = 8 passes. */
async function robustFaceApi(input: FaceInput, fallback: Detection | undefined, extra: Measures[]): Promise<Measures[]> {
  const list: Measures[] = [...extra];
  for (const flip of [false, true]) {
    const c = canvasOf(input, flip);
    for (const s of SIZES) {
      const d = await detectAt(c, s);
      if (d) list.push(measure(d.P));
    }
  }
  if (!list.length && fallback) list.push(measureDetection(fallback));
  return list;
}

/** Multi-pass measurement → median. Uses MediaPipe when available, face-api fallback otherwise. */
export async function robustMeasures(input: FaceInput, fallback?: Detection, extra: Measures[] = []): Promise<RobustMeasures | null> {
  const list = isMediaPipeReady()
    ? await robustMP(input, extra)
    : await robustFaceApi(input, fallback, extra);

  if (!list.length && fallback) list.push(measureDetection(fallback));
  return list.length ? medianMeasures(list) : null;
}
