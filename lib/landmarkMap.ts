/* MediaPipe 478-point face mesh → dlib/face-api 68-point index mapping.
   Source: Real3DPortrait (huggingface.co/ameerazam08/Real3DPortrait).
   Concatenated in dlib order: jaw(17) + brow(10) + nose(9) + eye(12) + mouth(20) = 68. */

import type { Pt } from "./geometry";

const JAW   = [356,454,361,288,397,379,378,377,152,148,149,150,172,58,132,234,127];
const BROW  = [70,63,105,66,107, 336,296,334,293,300];
const NOSE  = [6,5,1,2,129,240,2,460,358];
const EYE   = [33,160,158,133,153,144, 362,385,387,263,373,380];
const MOUTH = [78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95];

export const MP_TO_68: readonly number[] = [...JAW, ...BROW, ...NOSE, ...EYE, ...MOUTH];

export interface NormLandmark { x: number; y: number; z: number }

/** Convert MediaPipe normalized landmarks (0-1) to pixel-space 68 points. */
export function mpTo68(lm478: NormLandmark[], w: number, h: number): Pt[] {
  return MP_TO_68.map(i => ({ x: lm478[i].x * w, y: lm478[i].y * h }));
}
