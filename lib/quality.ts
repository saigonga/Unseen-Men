/* Photo quality checks, shared by the live camera and uploaded photos. */
import { dist, mid, avgPts } from "./geometry";
import type { Detection, FaceInput } from "./detector";
import { Q, FEMALE_BLOCK_P } from "./capture.config";

export type CheckId = "distance" | "centred" | "straight" | "level" | "lighting" | "expression";
export interface Check { id: CheckId; ok: boolean; text: string }
export interface QualityReport { checks: Check[]; failed: number; blocking: string | null }

export interface Metrics {
  size: number; offX: number; offY: number; yaw: number; roll: number;
  pitch: number; lum: number; mouth: number; smile: number;
}

let lumCanvas: HTMLCanvasElement | null = null;
function brightness(input: FaceInput, box: Detection["box"]) {
  lumCanvas ??= document.createElement("canvas");
  const c = lumCanvas; c.width = 48; c.height = 48;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.drawImage(input, box.x, box.y, box.width, box.height, 0, 0, 48, 48);
  const px = x.getImageData(0, 0, 48, 48).data;
  let s = 0;
  for (let i = 0; i < px.length; i += 4) s += .2126 * px[i] + .7152 * px[i + 1] + .0722 * px[i + 2];
  return s / (px.length / 4);
}

export function inputSize(input: FaceInput) {
  if (input instanceof HTMLVideoElement) return { W: input.videoWidth, H: input.videoHeight };
  if (input instanceof HTMLImageElement) return { W: input.naturalWidth, H: input.naturalHeight };
  return { W: input.width, H: input.height };
}

export function metrics(input: FaceInput, det: Detection): Metrics {
  const { box, P } = det, { W, H } = inputSize(input);
  const cheek = dist(P[1], P[15]);
  const eyeL = avgPts(P.slice(36, 42)), eyeR = avgPts(P.slice(42, 48)), eyes = mid(eyeL, eyeR);
  const lower = dist(mid(P[19], P[24]), P[8]);
  return {
    size: box.width / Math.min(W, H),
    offX: Math.abs((box.x + box.width / 2) - W / 2) / W,
    offY: Math.abs((box.y + box.height / 2) - H / 2) / H,
    yaw: Math.abs(P[30].x - mid(P[0], P[16]).x) / cheek,
    roll: Math.abs(Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x)) * 180 / Math.PI,
    pitch: (P[30].y - eyes.y) / Math.max(1, P[8].y - eyes.y),
    lum: brightness(input, box),
    mouth: dist(P[62], P[66]) / lower,
    smile: dist(P[48], P[54]) / cheek,
  };
}

export const isFemale = (det: Detection) => det.femaleP >= FEMALE_BLOCK_P;
export const MEN_ONLY_MSG = "This scan is built for men only. The face shape, haircut and beard advice is designed for men's faces, so we can't analyse this photo.";

/** The six checks for a still photo (upload or captured frame). */
export function checkQuality(input: FaceInput, det: Detection): QualityReport {
  const m = metrics(input, det);
  const checks: Check[] = [
    { id: "distance", ok: m.size >= Q.sizeMin && m.size <= Q.sizeMax, text: m.size < Q.sizeMin ? "Move closer" : m.size > Q.sizeMax ? "Too close" : "Good distance" },
    { id: "centred", ok: m.offX < Q.offMax, text: m.offX < Q.offMax ? "Centred" : "Off-centre" },
    { id: "straight", ok: m.yaw < Q.yawMax, text: m.yaw < Q.yawMax ? "Facing camera" : "Head turned" },
    { id: "level", ok: m.roll < Q.rollMax, text: m.roll < Q.rollMax ? "Head level" : "Head tilted" },
    { id: "lighting", ok: m.lum > Q.lumMin, text: m.lum > Q.lumMin ? "Good light" : "Too dark" },
    { id: "expression", ok: m.mouth < Q.mouthMax, text: m.mouth < Q.mouthMax ? "Neutral" : "Mouth open" },
  ];
  const byId = Object.fromEntries(checks.map(c => [c.id, c])) as Record<CheckId, Check>;
  // Men-only gate first; then a turned head or open mouth, which change the measurements themselves.
  const blocking = isFemale(det)
    ? MEN_ONLY_MSG
    : !byId.straight.ok
      ? "Your head is turned, which makes your face read narrower than it is. Look straight into the camera and retake."
      : !byId.expression.ok
        ? "Your mouth is open, which makes your face read longer. Close your mouth and retake."
        : null;
  return { checks, failed: checks.filter(c => !c.ok).length, blocking };
}

/** Live camera: one instruction at a time, in priority order (AGENTS.md section 3). null = all good. */
export function liveInstruction(input: FaceInput, det: Detection | null): string | null {
  if (!det) return "Fit your face in the oval";
  const m = metrics(input, det);
  if (m.size < Q.sizeMin) return "Move closer";
  if (m.size > Q.sizeMax) return "Move back a little";
  if (m.offX >= Q.offMax || m.offY >= Q.offYMax) return "Move to the centre";
  if (m.yaw >= Q.yawMax) return "Look straight at the camera";
  if (m.roll >= Q.rollMax) return "Keep your head level";
  if (m.pitch < Q.pitchMin) return "Chin down slightly";
  if (m.pitch > Q.pitchMax) return "Chin up slightly";
  if (m.lum <= Q.lumMin) return "Find more light, face a window";
  if (m.mouth >= Q.mouthMax || m.smile >= Q.smileMax) return "Relax your face, mouth closed";
  return null;
}
