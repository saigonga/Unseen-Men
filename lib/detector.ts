/* Face detection on the device. Phase 1: face-api 68-point (same as the prototype).
   Phase 3 replaces this file's internals with MediaPipe Face Landmarker. */
import { avgPts } from "./geometry";
import type { Box, Pt } from "./geometry";

export interface Detection { box: Box; P: Pt[] }

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
    })().catch(e => { ready = null; throw e; });
  }
  return ready;
}

/** Detect at two input sizes and average the landmarks: steadier than one pass. */
export async function detect(img: HTMLImageElement): Promise<Detection | null> {
  await loadDetector();
  const faceapi = window.faceapi;
  const runs: any[] = [];
  for (const size of [416, 512]) {
    const r = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: size, scoreThreshold: 0.35 }))
      .withFaceLandmarks();
    if (r) runs.push(r);
  }
  if (!runs.length) return null;
  const positions: Pt[][] = runs.map(r => r.landmarks.positions.map((p: Pt) => ({ x: p.x, y: p.y })));
  const P = positions[0].map((_, i) => avgPts(positions.map(run => run[i])));
  const b = runs[0].detection.box;
  return { box: { x: b.x, y: b.y, width: b.width, height: b.height }, P };
}
