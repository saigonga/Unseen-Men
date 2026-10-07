/* Skin-read result shape. Phase 4 adds the server route (Claude API) that returns this. */
import type { SkinAreaKey } from "./content";

export type SkinLevel = "none" | "mild" | "moderate" | "noticeable";

export interface SkinRead {
  quality: "good" | "fair" | "poor";
  quality_note: string;
  observations: { area: SkinAreaKey; level: SkinLevel; note: string }[];
  see_dermatologist: boolean;
}
