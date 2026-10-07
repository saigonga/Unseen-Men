/* The six photo quality checks from the prototype. */
import { dist, mid, avgPts } from "./geometry";
import type { Detection } from "./detector";

export type CheckId = "distance" | "centred" | "straight" | "level" | "lighting" | "expression";
export interface Check { id: CheckId; ok: boolean; text: string }
export interface QualityReport { checks: Check[]; failed: number; blocking: string | null }

function brightness(img: HTMLImageElement, box: Detection["box"]) {
  const c = document.createElement("canvas"); c.width = 48; c.height = 48;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.drawImage(img, box.x, box.y, box.width, box.height, 0, 0, 48, 48);
  const px = x.getImageData(0, 0, 48, 48).data;
  let s = 0;
  for (let i = 0; i < px.length; i += 4) s += .2126 * px[i] + .7152 * px[i + 1] + .0722 * px[i + 2];
  return s / (px.length / 4);
}

export function checkQuality(img: HTMLImageElement, det: Detection): QualityReport {
  const { box, P } = det, W = img.naturalWidth, H = img.naturalHeight;
  const cheek = dist(P[1], P[15]);
  const eyeL = avgPts(P.slice(36, 42)), eyeR = avgPts(P.slice(42, 48));
  const roll = Math.abs(Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x)) * 180 / Math.PI;
  const yaw = Math.abs(P[30].x - mid(P[0], P[16]).x) / cheek;
  const lower = dist(mid(P[19], P[24]), P[8]);
  const mouth = dist(P[62], P[66]) / lower;
  const size = box.width / Math.min(W, H);
  const off = Math.abs((box.x + box.width / 2) - W / 2) / W;
  const lum = brightness(img, box);

  const checks: Check[] = [
    { id: "distance", ok: size >= 0.25 && size <= 0.8, text: size < 0.25 ? "Move closer" : size > 0.8 ? "Too close" : "Good distance" },
    { id: "centred", ok: off < 0.18, text: off < 0.18 ? "Centred" : "Off-centre" },
    { id: "straight", ok: yaw < 0.07, text: yaw < 0.07 ? "Facing camera" : "Head turned" },
    { id: "level", ok: roll < 7, text: roll < 7 ? "Head level" : "Head tilted" },
    { id: "lighting", ok: lum > 70, text: lum > 70 ? "Good light" : "Too dark" },
    { id: "expression", ok: mouth < 0.06, text: mouth < 0.06 ? "Neutral" : "Mouth open" },
  ];
  const byId = Object.fromEntries(checks.map(c => [c.id, c])) as Record<CheckId, Check>;
  // A turned head or open mouth changes the measurements themselves, so those block the scan.
  const blocking = !byId.straight.ok
    ? "Your head is turned, which makes your face read narrower than it is. Look straight into the camera and retake."
    : !byId.expression.ok
      ? "Your mouth is open, which makes your face read longer. Close your mouth and retake."
      : null;
  return { checks, failed: checks.filter(c => !c.ok).length, blocking };
}
