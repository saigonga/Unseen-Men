/* Face detection on the device.
   Phase 3: MediaPipe 478-point is primary for landmarks; face-api is kept for the gender gate.
   If MediaPipe fails to load (old browser, no WASM), falls back to face-api for everything. */
import { avgPts } from "./geometry";
import type { Box, Pt } from "./geometry";
import { loadMediaPipe, mpDetect, isMediaPipeReady } from "./mediapipe";
import type { MPDetection } from "./mediapipe";

export interface Detection {
  box: Box;
  P: Pt[];
  /** All 478 MediaPipe points (null when using face-api fallback). */
  P478: Pt[] | null;
  /** Native head pose from MediaPipe (null when using face-api fallback). */
  pose: { yaw: number; pitch: number; roll: number } | null;
  /** Probability (0–1) that the face model reads the face structure as female. */
  femaleP: number;
}
export type FaceInput = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { faceapi?: any } }

let faceApiReady: Promise<void> | null = null;
let mediapipeReady: Promise<void> | null = null;
let mediapipeFailed = false;

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

function loadFaceApi(): Promise<void> {
  if (!faceApiReady) {
    faceApiReady = (async () => {
      await loadScript("/vendor/face-api.js");
      const faceapi = window.faceapi, tf = faceapi.tf;
      let ok = false;
      try { ok = await tf.setBackend("webgl"); } catch { ok = false; }
      if (!ok) await tf.setBackend("cpu");
      await tf.ready();
      await loadNet(faceapi.nets.tinyFaceDetector, "tiny");
      await loadNet(faceapi.nets.faceLandmark68Net, "lm");
      await loadNet(faceapi.nets.ageGenderNet, "gender");
    })().catch(e => { faceApiReady = null; throw e; });
  }
  return faceApiReady;
}

/** Load both engines. MediaPipe failure is non-fatal (falls back to face-api). */
export function loadDetector(): Promise<void> {
  if (!mediapipeReady && !mediapipeFailed) {
    mediapipeReady = loadMediaPipe().catch(e => {
      console.warn("MediaPipe failed to load, using face-api fallback:", e);
      mediapipeFailed = true;
    });
  }
  // face-api always loads (needed for gender gate)
  return Promise.all([loadFaceApi(), mediapipeReady]).then(() => {});
}

const femaleOf = (r: any) => (r.gender === "female" ? r.genderProbability : 1 - r.genderProbability);
const toPts = (r: any): Pt[] => r.landmarks.positions.map((p: Pt) => ({ x: p.x, y: p.y }));
const toBox = (b: any): Box => ({ x: b.x, y: b.y, width: b.width, height: b.height });

/** Gender check via face-api (always used regardless of MediaPipe). */
async function genderCheck(input: FaceInput): Promise<number> {
  await loadFaceApi();
  const faceapi = window.faceapi;
  const r = await faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.35 }))
    .withFaceLandmarks()
    .withAgeAndGender();
  return r ? femaleOf(r) : 0;
}

function mpToDetection(mp: MPDetection, femaleP: number): Detection {
  return { box: mp.box, P: mp.P, P478: mp.P478, pose: mp.pose, femaleP };
}

/** Accurate pass for a still photo. MediaPipe primary, face-api fallback. */
export async function detect(input: FaceInput): Promise<Detection | null> {
  await loadDetector();

  // Gender check runs in parallel with MediaPipe detection
  const [femaleP, mp] = await Promise.all([
    genderCheck(input),
    isMediaPipeReady() ? Promise.resolve(mpDetect(input)) : Promise.resolve(null),
  ]);

  if (mp) return mpToDetection(mp, femaleP);

  // face-api fallback
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
  const P = positions[0].map((_: Pt, i: number) => avgPts(positions.map(run => run[i])));
  return { box: toBox(runs[0].detection.box), P, P478: null, pose: null, femaleP };
}

/** Fast single pass for live video tracking — uses MediaPipe 478-point mesh when ready, face-api fallback. */
export async function detectFast(input: FaceInput, withGender = false): Promise<Detection | null> {
  if (!mediapipeReady && !mediapipeFailed) {
    mediapipeReady = loadMediaPipe().catch(() => { mediapipeFailed = true; });
  }
  if (isMediaPipeReady()) {
    const mp = mpDetect(input);
    if (mp) {
      const femaleP = withGender ? await genderCheck(input).catch(() => 0) : 0;
      return mpToDetection(mp, femaleP);
    }
    return null;
  }

  await loadFaceApi();
  const faceapi = window.faceapi;
  let q = faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }))
    .withFaceLandmarks();
  if (withGender) q = q.withAgeAndGender();
  const r = await q;
  if (!r) return null;
  return { box: toBox(r.detection.box), P: toPts(r), P478: null, pose: null, femaleP: withGender ? femaleOf(r) : 0 };
}

/** One pass at a given detector input size (used by robust multi-pass). */
export async function detectAt(input: FaceInput, inputSize: number): Promise<Detection | null> {
  await loadFaceApi();
  const faceapi = window.faceapi;
  const r = await faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold: 0.3 }))
    .withFaceLandmarks();
  if (!r) return null;
  return { box: toBox(r.detection.box), P: toPts(r), P478: null, pose: null, femaleP: 0 };
}

/** MediaPipe-based detection at image level (for robust multi-pass). */
export function detectMP(input: HTMLImageElement | HTMLCanvasElement): Detection | null {
  if (!isMediaPipeReady()) return null;
  const mp = mpDetect(input);
  if (!mp) return null;
  return mpToDetection(mp, 0);
}

/** Average several detections of the same face (multi-frame capture). */
export function averageDetections(list: Detection[]): Detection {
  const P = list[0].P.map((_, i) => avgPts(list.map(d => d.P[i])));
  const with478 = list.filter((d): d is Detection & { P478: Pt[] } => Array.isArray(d.P478) && d.P478.length >= 468);
  const P478 = with478.length
    ? with478[0].P478.map((_, i) => avgPts(with478.map(d => d.P478[i])))
    : list[0].P478;
  const withPose = list.filter((d): d is Detection & { pose: NonNullable<Detection["pose"]> } => d.pose !== null);
  const pose = withPose.length
    ? {
        yaw: withPose.reduce((s, d) => s + d.pose.yaw, 0) / withPose.length,
        pitch: withPose.reduce((s, d) => s + d.pose.pitch, 0) / withPose.length,
        roll: withPose.reduce((s, d) => s + d.pose.roll, 0) / withPose.length,
      }
    : list[0].pose;
  const n = list.length;
  const box = {
    x: list.reduce((s, d) => s + d.box.x, 0) / n,
    y: list.reduce((s, d) => s + d.box.y, 0) / n,
    width: list.reduce((s, d) => s + d.box.width, 0) / n,
    height: list.reduce((s, d) => s + d.box.height, 0) / n,
  };
  return { box, P, P478, pose, femaleP: list.reduce((s, d) => s + d.femaleP, 0) / n };
}
