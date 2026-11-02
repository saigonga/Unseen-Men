/* MediaPipe Face Landmarker — 478-point detection with native head pose.
   Replaces face-api for landmark detection (phase 3). Gender gate stays on face-api. */

import type { Pt, Box } from "./geometry";
import { mpTo68 } from "./landmarkMap";
import type { NormLandmark } from "./landmarkMap";

export interface MPDetection {
  box: Box;
  P: Pt[];           // 68 equivalent points in pixel space
  P478: Pt[];         // all 478 in pixel space
  /** Native head pose from the facial transformation matrix (degrees). */
  pose: { yaw: number; pitch: number; roll: number } | null;
}

type FaceLandmarker = import("@mediapipe/tasks-vision").FaceLandmarker;

let landmarker: FaceLandmarker | null = null;
let loading: Promise<FaceLandmarker> | null = null;

function silenceTFLite<T>(fn: () => T): T {
  if (typeof window === "undefined") return fn();
  const orig = console.error;
  console.error = function (...args: unknown[]) {
    let str = "";
    for (let i = 0; i < args.length; i++) {
      try { str += " " + String(args[i]); } catch {}
    }
    if (
      str.includes("INFO:") ||
      str.includes("XNNPACK") ||
      str.includes("OpenGL error") ||
      str.includes("FaceBlendshapesGraph") ||
      str.includes("Created TensorFlow Lite") ||
      str.includes("gl_context.cc")
    ) {
      console.info(...args);
      return;
    }
    orig.apply(console, args);
  };
  try {
    return fn();
  } finally {
    console.error = orig;
  }
}

async function silenceTFLiteAsync<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof window === "undefined") return fn();
  const orig = console.error;
  console.error = function (...args: unknown[]) {
    let str = "";
    for (let i = 0; i < args.length; i++) {
      try { str += " " + String(args[i]); } catch {}
    }
    if (
      str.includes("INFO:") ||
      str.includes("XNNPACK") ||
      str.includes("OpenGL error") ||
      str.includes("FaceBlendshapesGraph") ||
      str.includes("Created TensorFlow Lite") ||
      str.includes("gl_context.cc")
    ) {
      console.info(...args);
      return;
    }
    orig.apply(console, args);
  };
  try {
    return await fn();
  } finally {
    console.error = orig;
  }
}

async function init(mode: "IMAGE" | "VIDEO" = "IMAGE"): Promise<FaceLandmarker> {
  return silenceTFLiteAsync(async () => {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const wasm = await FilesetResolver.forVisionTasks("/mediapipe/");
    const fl = await FaceLandmarker.createFromOptions(wasm, {
      baseOptions: { modelAssetPath: "/mediapipe/face_landmarker.task" },
      runningMode: mode,
      numFaces: 1,
      minFaceDetectionConfidence: 0.4,
      minFacePresenceConfidence: 0.4,
      minTrackingConfidence: 0.4,
      outputFacialTransformationMatrixes: true,
    });
    return fl;
  });
}

export async function loadMediaPipe(): Promise<void> {
  if (landmarker) return;
  if (!loading) loading = init("IMAGE");
  landmarker = await loading;
}

export async function loadMediaPipeVideo(): Promise<void> {
  // Video mode needs a separate instance since runningMode is set at creation
  if (landmarker) { landmarker.close(); landmarker = null; }
  loading = init("VIDEO");
  landmarker = await loading;
}

function poseFromMatrix(mat: { rows: number; columns: number; data: number[] }): { yaw: number; pitch: number; roll: number } | null {
  if (!mat || mat.rows < 3 || mat.columns < 4) return null;
  const d = mat.data;
  // 4x4 rotation matrix → Euler angles (XYZ convention)
  const sy = Math.sqrt(d[0] * d[0] + d[4] * d[4]);
  const singular = sy < 1e-6;
  let pitch: number, yaw: number, roll: number;
  if (!singular) {
    pitch = Math.atan2(d[8], d[10]);  // around X
    yaw   = Math.atan2(-d[2], sy);    // around Y (left-right turn)
    roll  = Math.atan2(d[1], d[0]);   // around Z (head tilt)
  } else {
    pitch = Math.atan2(-d[9], d[5]);
    yaw   = Math.atan2(-d[2], sy);
    roll  = 0;
  }
  const deg = (r: number) => r * 180 / Math.PI;
  return { yaw: deg(yaw), pitch: deg(pitch), roll: deg(roll) };
}

function convert(lm: NormLandmark[], mat: { rows: number; columns: number; data: number[] } | undefined, w: number, h: number): MPDetection {
  const P = mpTo68(lm, w, h);
  const P478 = lm.map(p => ({ x: p.x * w, y: p.y * h }));

  // Bounding box from all landmarks
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of P478) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const pad = (maxX - minX) * 0.1;
  const box: Box = { x: minX - pad, y: minY - pad, width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 };

  return { box, P, P478, pose: mat ? poseFromMatrix(mat) : null };
}

/** Detect on a still image. */
export function mpDetect(input: HTMLImageElement | HTMLCanvasElement): MPDetection | null {
  if (!landmarker) return null;
  const w = input instanceof HTMLImageElement ? input.naturalWidth : input.width;
  const h = input instanceof HTMLImageElement ? input.naturalHeight : input.height;
  if (!w || !h) return null;
  return silenceTFLite(() => {
    try {
      const r = landmarker!.detect(input);
      if (!r || !r.faceLandmarks || !r.faceLandmarks.length) return null;
      return convert(r.faceLandmarks[0] as NormLandmark[], r.facialTransformationMatrixes?.[0], w, h);
    } catch (err) {
      console.warn("MediaPipe detect warning:", err);
      return null;
    }
  });
}

/** Detect on a video frame (must call loadMediaPipeVideo first). */
export function mpDetectVideo(video: HTMLVideoElement, timestampMs: number): MPDetection | null {
  if (!landmarker) return null;
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;
  return silenceTFLite(() => {
    try {
      const r = landmarker!.detectForVideo(video, timestampMs);
      if (!r || !r.faceLandmarks || !r.faceLandmarks.length) return null;
      return convert(r.faceLandmarks[0] as NormLandmark[], r.facialTransformationMatrixes?.[0], w, h);
    } catch (err) {
      console.warn("MediaPipe video detect warning:", err);
      return null;
    }
  });
}

export function isMediaPipeReady() { return landmarker !== null; }
