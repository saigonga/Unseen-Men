"use client";

import { useEffect } from "react";

const SILENCE_PATTERNS = [
  "INFO:",
  "XNNPACK",
  "OpenGL error",
  "FaceBlendshapesGraph",
  "Created TensorFlow Lite",
  "gl_context.cc",
  "inference_feedback_manager.cc",
  "feedback tensors",
  "willReadFrequently",
];

function shouldSilence(args: unknown[]): boolean {
  let str = "";
  for (let i = 0; i < args.length; i++) {
    try {
      str += " " + String(args[i]);
    } catch {}
  }
  for (const pat of SILENCE_PATTERNS) {
    if (str.includes(pat)) return true;
  }
  return false;
}

if (typeof window !== "undefined") {
  const origErr = console.error;
  if (!(origErr as unknown as { __mp_silenced?: boolean }).__mp_silenced) {
    const patchedErr = function (...args: unknown[]) {
      if (shouldSilence(args)) {
        console.debug(...args);
        return;
      }
      origErr.apply(console, args);
    };
    (patchedErr as unknown as { __mp_silenced: boolean }).__mp_silenced = true;
    console.error = patchedErr;
  }

  const origWarn = console.warn;
  if (!(origWarn as unknown as { __mp_silenced?: boolean }).__mp_silenced) {
    const patchedWarn = function (...args: unknown[]) {
      if (shouldSilence(args)) {
        console.debug(...args);
        return;
      }
      origWarn.apply(console, args);
    };
    (patchedWarn as unknown as { __mp_silenced: boolean }).__mp_silenced = true;
    console.warn = patchedWarn;
  }
}

export function ConsoleSilencer() {
  useEffect(() => {
    // Re-verify in case dev tooling wrapped console methods
    const origErr = console.error;
    if (!(origErr as unknown as { __mp_silenced?: boolean }).__mp_silenced) {
      const patchedErr = function (...args: unknown[]) {
        if (shouldSilence(args)) {
          console.debug(...args);
          return;
        }
        origErr.apply(console, args);
      };
      (patchedErr as unknown as { __mp_silenced: boolean }).__mp_silenced = true;
      console.error = patchedErr;
    }

    const origWarn = console.warn;
    if (!(origWarn as unknown as { __mp_silenced?: boolean }).__mp_silenced) {
      const patchedWarn = function (...args: unknown[]) {
        if (shouldSilence(args)) {
          console.debug(...args);
          return;
        }
        origWarn.apply(console, args);
      };
      (patchedWarn as unknown as { __mp_silenced: boolean }).__mp_silenced = true;
      console.warn = patchedWarn;
    }
  }, []);

  return null;
}
