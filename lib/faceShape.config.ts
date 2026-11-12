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

/** Calibrated MediaPipe 478-point craniofacial norms [mean, sd] and foreshortening compensation.
 *  Derived across 36 Indian male selfies & reference portraits so MediaPipe 478 measurements
 *  map cleanly onto the canonical z-score space without collapsing round/low-angle selfies into Square. */
export const MP_NORM: Record<MeasureKey, [number, number]> = {
  R: [1.448, 0.072],
  J: [0.785, 0.022],
  F: [0.828, 0.024],
  K: [0.422, 0.024],
  G: [147.8, 4.20],
};

/** Lower-face vertical ratio baseline and foreshortening slope (deg per unit lowerH) for jaw angle G. */
export const MP_PITCH_COMP = {
  baseLowerH: 0.685,
  degPerUnit: 68,
  softDeadzone: 0.55,
  softGain: 0.35,
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

/** Show "Leaning X" when the second shape's probability is at least this share of the first. */
export const LEAN_RATIO = 0.6;

/** A measurement beyond ±TRAIT_Z SD becomes a trait. */
export const TRAIT_Z = 0.75;
