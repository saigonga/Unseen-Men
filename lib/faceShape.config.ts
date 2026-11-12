/* Calibration config. Phase 7 replaces these values with norms from 50+ barber-labelled
   selfies of Indian men. Keep every tunable number for the face-shape model here. */

export type MeasureKey = "R" | "J" | "F" | "K" | "G";

/** Population norms [mean, sd] from 28 front-facing portraits measured with face-api 68-point.
 *  The model pulls every face toward an average, so faces are compared against these
 *  norms rather than fixed cut-offs (fixed cut-offs made almost everyone "Oval"). */
export const NORM: Record<MeasureKey, [number, number]> = {
  R: [1.399, 0.093],
  J: [0.797, 0.017],
  F: [0.819, 0.025],
  K: [0.491, 0.025],
  G: [149.8, 4.52],
};

/** Calibrated MediaPipe 478-point 2D fallback norms [mean, sd] when 3D z-depth isn't available. */
export const MP_NORM: Record<MeasureKey, [number, number]> = {
  R: [1.455, 0.068],
  J: [0.733, 0.024],
  F: [0.798, 0.025],
  K: [0.468, 0.020],
  G: [147.8, 3.60],
};

/** Reference 3D mesh norms [mean, sd], pending validation with barber-labelled photos. */
export const MP3D_NORM: Record<MeasureKey, [number, number]> = {
  R: [1.198, 0.052],
  J: [0.725, 0.024],
  F: [0.799, 0.025],
  K: [0.319, 0.016],
  G: [148.0, 3.60],
};

/** Lower-face vertical ratio baseline and soft deadzone tuning. */
export const MP_PITCH_COMP = {
  baseLowerH: 0.855,
  degPerUnit: 68,
  softDeadzone: 0.68,
  softGain: 0.30,
};

/** z-scores are clamped to ±Z_CLAMP. */
export const Z_CLAMP = 3;

/** A full beard hides the jawline, so jaw, chin and angle count this much. */
export const FULL_BEARD_WEIGHT = 0.5;

/** Constant offsets added to each shape's score (tune during calibration). */
export const SHAPE_OFFSET = {
  rectangle: -1.2,
  square: -1.2,
  round: 0,
  heart: -0.4,
  diamond: 0,
  oval: 0.7,
};

/** Softmax temperature for turning shape scores into match %. */
export const SOFTMAX_T = 0.6;

/** Show both shapes when the runner-up's score weight is at least this share of the top shape. */
export const LEAN_RATIO = 0.6;

/** A measurement beyond ±TRAIT_Z SD becomes a trait. */
export const TRAIT_Z = 0.75;
