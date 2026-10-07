/* Face detection on the device. face-api 68-point landmarks + a face-structure gender model
   used only for the men-only gate (never shown, stored or sent).
   Phase 3 replaces the landmark part with MediaPipe Face Landmarker. */
import { avgPts } from "./geometry";
import type { Box, Pt } from "./geometry";

export interface Detection {
  box: Box;
  P: Pt[];
  /** Probability (0–1) that the face model reads the face structure as female. */
  femaleP: number;
}
export type FaceInput = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { faceapi?: any } }

let ready: Promise<void> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.faceapi) return resolve();
    const s = document.createElement("script");
    s.src = src; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("face-api failed to load"));
    document.head.appendChild(s);
  });
}

async function loadNet(net: any, name: string) {
  const tf = window.faceapi.tf;
  const [manifest, bin] = await Promise.all([
    fetch(`/models/${name}.json`).then(r => r.json()),
    fetch(`/models/${name}.bin`).then(r => r.arrayBuffer()),
  ]);
  const specs = manifest.flatMap((g: any) => g.weights);
  net.loadFromWeightMap(tf.io.decodeWeights(bin, specs));
}

export function loadDetector(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await loadScript("/vendor/face-api.js");
      const faceapi = window.faceapi, tf = faceapi.tf;
      let ok = false;
      try { ok = await tf.setBackend("webgl"); } catch { ok = false; }
      if (!ok) await tf.setBackend("cpu");
      await tf.ready();
      await loadNet(faceapi.nets.tinyFaceDetector, "tiny");
      await loadNet(faceapi.nets.faceLandmark68Net, "lm");
      await loadNet(faceapi.nets.ageGenderNet, "gender");
    })().catch(e => { ready = null; throw e; });
  }
  return ready;
}

const femaleOf = (r: any) => (r.gender === "female" ? r.genderProbability : 1 - r.genderProbability);
const toPts = (r: any): Pt[] => r.landmarks.positions.map((p: Pt) => ({ x: p.x, y: p.y }));
const toBox = (b: any): Box => ({ x: b.x, y: b.y, width: b.width, height: b.height });

/** Accurate pass for a still photo: two input sizes, landmarks averaged. */
export async function detect(input: FaceInput): Promise<Detection | null> {
  await loadDetector();
  const faceapi = window.faceapi;
  const runs: any[] = [];
  for (const size of [416, 512]) {
    const r = await faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: size, scoreThreshold: 0.35 }))
      .withFaceLandmarks()
      .withAgeAndGender();
    if (r) runs.push(r);
  }
  if (!runs.length) return null;
  const positions = runs.map(toPts);
  const P = positions[0].map((_, i) => avgPts(positions.map(run => run[i])));
  const femaleP = runs.reduce((s, r) => s + femaleOf(r), 0) / runs.length;
  return { box: toBox(runs[0].detection.box), P, femaleP };
}

/** Fast single pass for live video tracking. */
export async function detectFast(input: FaceInput, withGender = false): Promise<Detection | null> {
  await loadDetector();
  const faceapi = window.faceapi;
  let q = faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }))
    .withFaceLandmarks();
  if (withGender) q = q.withAgeAndGender();
  const r = await q;
  if (!r) return null;
  return { box: toBox(r.detection.box), P: toPts(r), femaleP: withGender ? femaleOf(r) : 0 };
}

/** One pass at a given detector input size (used by the robust multi-pass measurement). */
export async function detectAt(input: FaceInput, inputSize: number): Promise<Detection | null> {
  await loadDetector();
  const faceapi = window.faceapi;
  const r = await faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold: 0.3 }))
    .withFaceLandmarks();
  if (!r) return null;
  return { box: toBox(r.detection.box), P: toPts(r), femaleP: 0 };
}

/** Average several detections of the same face (multi-frame capture). */
export function averageDetections(list: Detection[]): Detection {
  const P = list[0].P.map((_, i) => avgPts(list.map(d => d.P[i])));
  const n = list.length;
  const box = {
    x: list.reduce((s, d) => s + d.box.x, 0) / n,
    y: list.reduce((s, d) => s + d.box.y, 0) / n,
    width: list.reduce((s, d) => s + d.box.width, 0) / n,
    height: list.reduce((s, d) => s + d.box.height, 0) / n,
  };
  return { box, P, femaleP: list.reduce((s, d) => s + d.femaleP, 0) / n };
}
