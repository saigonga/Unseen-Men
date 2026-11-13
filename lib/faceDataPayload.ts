import { SHAPES } from "./content";
import type { Beard } from "./content";
import type { Detection } from "./detector";
import { pct, rawProportions, shapeHeadline } from "./faceShape";
import type { FaceResult, Measures, ZScores } from "./faceShape";
import type { RobustMeasures } from "./robust";
import { TRAIT_Z } from "./faceShape.config";
import { BARBER_GUIDE_BY_SHAPE, getFacialThirds } from "./styling";

const NORM_BARS: [keyof ZScores, string, string, string, string][] = [
  ["R", "faceLength", "Face length", "Shorter", "Longer"],
  ["J", "jawWidth", "Jaw width", "Narrower", "Wider"],
  ["F", "foreheadWidth", "Forehead width", "Narrower", "Wider"],
  ["K", "chinContour", "Chin contour", "Pointed", "Broad"],
  ["A", "jawlineAngle", "Jawline angle", "Soft", "Defined"],
];

export interface FaceDataPayload {
  faceShape: string;
  headline: string;
  borderline: boolean;
  shapeKey: string;
  leaning: string | null;
  rankedShapes: { shape: string; score: number }[];
  rawMeasures: Measures;
  rawMeshMeasures: Measures | null;
  scanPreferences: {
    ageBracket: string | null;
    skinType: string | null;
    skinConcern: string | null;
    currentBeard: Beard | null;
  };
  shapeScores: FaceResult["scores"];
  frameCount: number;
  measurements: {
    lengthToWidth: number;
    jawToCheek: number;
    foreheadToCheek: number;
    chinToCheek: number;
    jawAngleDeg: number;
  };
  zScores: Record<keyof ZScores, number>;
  populationNorms: Record<string, { label: string; tag: string; z: number; percentile: number }>;
  facialThirds: ReturnType<typeof getFacialThirds>;
  barberDirection: {
    primaryDirection: string;
    topLength: string;
    sidesLength: string;
    taper: string;
    stylingProduct: string;
  };
  structuralHighlights: { key: string; label: string; z: number }[];
  topCuts: { name: string; reason: string }[];
  avoidCuts: { name: string; desc: string }[];
  beardVerdict: {
    verdict: string;
    currentBeard: Beard | null;
    recommendedStyles: { name: string; desc: string }[];
  };
  engine: "mediapipe" | "face-api";
  pose: Detection["pose"] | null;
  scannedAt: string;
}

/** Build the complete structured facial architecture payload for database persistence. */
export function buildFaceDataPayload(
  result: FaceResult,
  det: Detection,
  beard: Beard | null,
  measurements: RobustMeasures,
  preferences?: { ageBracket?: string | null; skinType?: string | null; skinConcern?: string | null }
): FaceDataPayload {
  const sh = SHAPES[result.key];
  const props = rawProportions(det, measurements.raw3D);
  const barber = BARBER_GUIDE_BY_SHAPE[result.key];
  const populationNorms: Record<string, { label: string; tag: string; z: number; percentile: number }> = {};

  for (const [k, keyName, label, lo, hi] of NORM_BARS) {
    const v = result.z[k];
    const strong = Math.abs(v) >= TRAIT_Z;
    const share = Math.max(1, v > 0 ? 100 - pct(v) : pct(v));
    const tag = !strong ? "Average" : `${v > 0 ? hi : lo} · ${v > 0 ? "top" : "bottom"} ${share}%`;
    populationNorms[keyName] = {
      label,
      tag,
      z: Number(v.toFixed(3)),
      percentile: pct(v),
    };
  }

  return {
    faceShape: sh.name,
    headline: shapeHeadline(result),
    borderline: Boolean(result.lean),
    shapeKey: result.key,
    leaning: result.lean || null,
    frameCount: measurements.n,
    rawMeshMeasures: measurements.raw3D,
    scanPreferences: {
      ageBracket: preferences?.ageBracket ?? null,
      skinType: preferences?.skinType ?? null,
      skinConcern: preferences?.skinConcern ?? null,
      currentBeard: beard,
    },
    shapeScores: result.scores,
    rankedShapes: result.ranked.map(([shape, score]) => ({
      shape,
      score: Number(score.toFixed(4)),
    })),
    rawMeasures: {
      ...result.m,
    },
    measurements: {
      lengthToWidth: props.lengthToWidth,
      jawToCheek: props.jawToCheek,
      foreheadToCheek: props.foreheadToCheek,
      chinToCheek: props.chinToCheek,
      jawAngleDeg: props.jawAngleDeg,
    },
    zScores: {
      R: Number(result.z.R.toFixed(3)),
      J: Number(result.z.J.toFixed(3)),
      F: Number(result.z.F.toFixed(3)),
      K: Number(result.z.K.toFixed(3)),
      G: Number(result.z.G.toFixed(3)),
      A: Number(result.z.A.toFixed(3)),
    },
    populationNorms,
    facialThirds: getFacialThirds(det.P),
    barberDirection: {
      primaryDirection: barber.primaryDirection,
      topLength: barber.topLength,
      sidesLength: barber.sidesLength,
      taper: barber.taper,
      stylingProduct: barber.stylingProduct,
    },
    structuralHighlights: result.traits.map((t) => ({
      key: t.key,
      label: t.label,
      z: Number(t.z.toFixed(2)),
    })),
    topCuts: result.cuts.slice(0, 3).map((c) => ({ name: c.n, reason: c.why })),
    avoidCuts: result.avoid.map(([name, desc]) => ({ name, desc })),
    beardVerdict: {
      verdict: sh.beard.v,
      currentBeard: beard,
      recommendedStyles: sh.beard.styles.map(([name, desc]) => ({ name, desc })),
    },
    engine: det.P478 ? "mediapipe" : "face-api",
    pose: det.pose || null,
    scannedAt: new Date().toISOString(),
  };
}
