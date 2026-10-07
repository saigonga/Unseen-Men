/* Stable measurements. A single landmark pass is noisy: the jaw-width spread between people is
   only ~2%, about the same as the model's own jitter, so one pass can flip the face shape.
   We measure the same face many times (detector sizes × mirrored image, or many video frames)
   and take the median of each measurement. All five measurements are left/right symmetric,
   so a mirrored image gives a valid independent reading. */
import { detectAt } from "./detector";
import type { Detection, FaceInput } from "./detector";
import { measure } from "./faceShape";
import type { Measures } from "./faceShape";
import { inputSize } from "./quality";

const KEYS = ["R", "J", "F", "K", "G"] as const;
const SIZES = [320, 416, 512, 608];

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
  const x = c.getContext("2d")!;
  if (flip) { x.translate(W, 0); x.scale(-1, 1); }
  x.drawImage(input, 0, 0, W, H);
  return c;
}

/** 8 passes (4 detector sizes × original/mirrored) → median measurements. */
export async function robustMeasures(input: FaceInput, fallback?: Detection, extra: Measures[] = []): Promise<RobustMeasures | null> {
  const list: Measures[] = [...extra];
  for (const flip of [false, true]) {
    const c = canvasOf(input, flip);
    for (const s of SIZES) {
      const d = await detectAt(c, s);
      if (d) list.push(measure(d.P));
    }
  }
  if (!list.length && fallback) list.push(measure(fallback.P));
  return list.length ? medianMeasures(list) : null;
}
