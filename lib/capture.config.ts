/* Tunable thresholds for photo checks, live capture and the men-only gate. */

/** Men-only gate: block when the face model reads the face as female with at least this probability.
 *  Lower = stricter (blocks more, including some men). Raise it if real men get blocked. */
export const FEMALE_BLOCK_P = 0.8;

export const Q = {
  sizeMin: 0.20,      // face width ÷ shorter image side
  sizeMax: 0.85,
  offMax: 0.22,       // horizontal centre offset ÷ width
  offYMax: 0.25,      // vertical centre offset ÷ height (live only)
  yawMax: 0.12,       // nose offset from face centre ÷ cheek width (relaxed from 0.07 to prevent phone selfie false blocks)
  rollMax: 10,        // degrees
  pitchMin: 0.24,     // eye-line→nose-tip ÷ eye-line→chin; lower = chin up
  pitchMax: 0.54,     //                                   higher = chin down
  lumMin: 55,         // 0–255 face brightness (relaxed from 70 for indoor smartphone lighting)
  mouthMax: 0.10,     // lip gap ÷ brow-to-chin (relaxed from 0.06 to prevent false open-mouth triggers from beards/relaxed lips)
  smileMax: 0.55,     // mouth width ÷ cheek width
};

/** Stricter framing envelope for live 3D lock so every user is captured at uniform distance & straight-on pose. */
export const LIVE_Q = {
  sizeMin: 0.26,
  sizeMax: 0.78,
  offMax: 0.18,
  offYMax: 0.20,
  yawMax: 0.08,       // ~8 degrees max during straight-on baseline lock
  rollMax: 7,         // level head within 7 degrees
  lumMin: 60,
  mouthMax: 0.085,
  smileMax: 0.52,
};

export const LIVE = {
  holdMs: 900,        // straight-on hold duration before capturing frontal baseline
  countdown: 2,
  frames: 10,         // frontal 3D frames averaged
  sideFrames: 8,      // target 3D frames collected on each side turn
  turnDeg: 11,        // minimum head yaw (degrees from baseline) to count left/right sweep
  turnTimeoutMs: 6500,// fallback timeout per turn stage if user holds still
};
