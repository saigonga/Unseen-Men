/* Tunable thresholds for photo checks, live capture and the men-only gate. */

/** Men-only gate: block when the face model reads the face as female with at least this probability.
 *  Lower = stricter (blocks more, including some men). Raise it if real men get blocked. */
export const FEMALE_BLOCK_P = 0.8;

export const Q = {
  sizeMin: 0.25,      // face width ÷ shorter image side
  sizeMax: 0.8,
  offMax: 0.18,       // horizontal centre offset ÷ width
  offYMax: 0.22,      // vertical centre offset ÷ height (live only)
  yawMax: 0.07,       // nose offset from face centre ÷ cheek width
  rollMax: 7,         // degrees
  pitchMin: 0.28,     // eye-line→nose-tip ÷ eye-line→chin; lower = chin up
  pitchMax: 0.5,      //                                   higher = chin down
  lumMin: 70,         // 0–255 face brightness
  mouthMax: 0.06,     // lip gap ÷ brow-to-chin
  smileMax: 0.5,      // mouth width ÷ cheek width
};

export const LIVE = {
  holdMs: 1000,       // face must hold steady this long before auto-capture
  countdown: 3,       // seconds shown on screen
  frames: 9,          // frames averaged for the measurement
  sweepMs: 3000,      // "turn slowly left… now right"
};
