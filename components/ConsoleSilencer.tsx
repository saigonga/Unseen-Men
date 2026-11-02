"use client";

import { useEffect } from "react";

if (typeof window !== "undefined") {
  const orig = console.error;
  if (!(orig as unknown as { __tflite_patched?: boolean }).__tflite_patched) {
    const patched = function (...args: unknown[]) {
      let str = "";
      for (let i = 0; i < args.length; i++) {
        try {
          str += " " + String(args[i]);
        } catch {}
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
    (patched as unknown as { __tflite_patched: boolean }).__tflite_patched = true;
    console.error = patched;
  }
}

export function ConsoleSilencer() {
  useEffect(() => {
    // Re-verify in case any dev tooling re-wrapped console.error
    const orig = console.error;
    if (!(orig as unknown as { __tflite_patched?: boolean }).__tflite_patched) {
      const patched = function (...args: unknown[]) {
        let str = "";
        for (let i = 0; i < args.length; i++) {
          try {
            str += " " + String(args[i]);
          } catch {}
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
      (patched as unknown as { __tflite_patched: boolean }).__tflite_patched = true;
      console.error = patched;
    }
  }, []);

  return null;
}
