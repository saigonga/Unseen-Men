import { CUTS, SHAPES, SHAPE_ORDER } from "./content.ts";
import type { ShapeKey, TraitKey } from "./content.ts";

const frameShapes = ["rectangle", "round", "browline", "navigator", "geometric", "oval", "wayfarer", "aviator"] as const;
const frameLabels = ["Rectangular", "Round", "Browline", "Navigator", "Geometric", "Oval", "Wayfarer", "Aviator"];
const frameFinishes = [
  { name: "Espresso", color: "#35231e" },
  { name: "Gunmetal", color: "#62594e" },
  { name: "Bronze", color: "#9f7951" },
  { name: "Black", color: "#201e1d" },
];
const frameFits = {
  oval: [2, 0, 5, 6, 4, 1, 3, 7],
  round: [0, 4, 2, 6, 3, 7, 5, 1],
  square: [1, 5, 7, 2, 3, 4, 6, 0],
  rectangle: [2, 6, 3, 7, 5, 4, 1, 0],
  heart: [5, 7, 1, 3, 4, 0, 2, 6],
  diamond: [2, 5, 1, 7, 6, 3, 4, 0],
} satisfies Record<ShapeKey, number[]>;

const beardStyles = [
  { id: "light-stubble", name: "Light stubble", length: 0.06, width: 0.94, style: "stubble" },
  { id: "heavy-stubble", name: "Heavy stubble", length: 0.10, width: 0.96, style: "stubble" },
  { id: "boxed", name: "Short boxed beard", length: 0.12, width: 0.96, style: "boxed" },
  { id: "rounded", name: "Short rounded beard", length: 0.15, width: 1, style: "rounded" },
  { id: "goatee", name: "Extended goatee", length: 0.20, width: 0.42, style: "goatee" },
  { id: "chin-strap", name: "Chin strap", length: 0.09, width: 0.98, style: "strap" },
  { id: "full-cheeks", name: "Fuller cheeks", length: 0.16, width: 1.04, style: "rounded" },
  { id: "full", name: "Full beard", length: 0.25, width: 1.02, style: "rounded" },
  { id: "square-base", name: "Square base beard", length: 0.22, width: 1.04, style: "boxed" },
  { id: "garibaldi", name: "Garibaldi beard", length: 0.35, width: 1.05, style: "rounded" },
] as const;

const beardFits = {
  oval: [0, 2, 1, 3, 5, 4, 6, 8, 7, 9],
  round: [4, 5, 2, 1, 0, 8, 3, 7, 6, 9],
  square: [1, 3, 0, 2, 5, 4, 6, 7, 9, 8],
  rectangle: [6, 2, 3, 1, 0, 7, 8, 5, 4, 9],
  heart: [7, 9, 8, 3, 6, 2, 4, 5, 1, 0],
  diamond: [8, 5, 7, 2, 6, 3, 4, 1, 0, 9],
} satisfies Record<ShapeKey, number[]>;

export type FrameShape = typeof frameShapes[number];
export type BeardAsset = typeof beardStyles[number];
export interface FrameAsset {
  shape: FrameShape;
  name: string;
  sun: boolean;
  finish: string;
}
export interface Look {
  frame?: number;
  hair?: number;
  beard?: number;
}
export interface Lookbook {
  version: 1;
  shape: ShapeKey;
  looks: Look[];
}

const hairHeights = [0.75, 0.92, 0.78, 0.50, 0.46, 0.45, 0.34, 0.22, 0.56, 0.44, 0.56, 0.49, 0.40, 0.37];

export function getLookAssets(look: Look) {
  const frameIndex = look.frame === undefined ? undefined : look.frame % 8;
  const frameVariant = Math.floor((look.frame ?? 0) / 8);
  const sun = frameVariant % 2 === 1;
  const finish = frameFinishes[Math.floor(frameVariant / 2)];
  const frame: FrameAsset | undefined = frameIndex === undefined ? undefined : {
    shape: frameShapes[frameIndex],
    name: `${frameLabels[frameIndex]} ${sun ? "sunglasses" : "glasses"} in ${finish.name.toLowerCase()}`,
    sun,
    finish: finish.color,
  };
  const hair = look.hair === undefined ? undefined : { name: CUTS[look.hair].n, height: hairHeights[look.hair], profile: look.hair };
  const beard = look.beard === undefined ? undefined : beardStyles[look.beard];
  return { frame, hair, beard };
}

export function isLookbook(value: unknown): value is Lookbook {
  if (!value || typeof value !== "object") return false;
  const book = value as Lookbook;
  if (book.version !== 1 || !SHAPE_ORDER.includes(book.shape) || !Array.isArray(book.looks) || book.looks.length !== 8) return false;
  return book.looks.every(look => look && typeof look === "object" &&
    (look.frame !== undefined || look.hair !== undefined || look.beard !== undefined) &&
    (look.frame === undefined || Number.isInteger(look.frame) && look.frame >= 0 && look.frame < 16 * frameFinishes.length) &&
    (look.hair === undefined || Number.isInteger(look.hair) && look.hair >= 0 && look.hair < CUTS.length) &&
    (look.beard === undefined || Number.isInteger(look.beard) && look.beard >= 0 && look.beard < beardStyles.length));
}

export function lookbookSignature(book: Lookbook) {
  return `v1:${book.looks.map(look => [look.frame ?? "-", look.hair ?? "-", look.beard ?? "-"].join(":")).sort().join("|")}`;
}

export function createLookbook(shape: ShapeKey, traits: TraitKey[], random: () => number): Lookbook {
  function pair(pool: number[]) {
    const available = [...pool];
    const pick = () => available.splice(Math.floor(random() ** 1.35 * available.length), 1)[0];
    return [pick(), pick()];
  }
  const rankedHair = CUTS.map((cut, index) => ({
    index,
    score: (cut.s.includes(shape) ? 3 : 0) + traits.reduce((score, trait) =>
      score + Number(cut.good.includes(trait)) - 2 * Number(cut.bad.includes(trait)), 0),
  })).sort((a, b) => b.score - a.score);
  const hairPool = rankedHair.filter(cut => cut.score > 0).slice(0, 7);
  const [hair1, hair2] = pair((hairPool.length >= 2 ? hairPool : rankedHair.slice(0, 2)).map(cut => cut.index));
  const frames = frameFits[shape].slice(0, 6);
  const finishFrame = (frame: number) => frame + 16 * Math.floor(random() * frameFinishes.length);
  const [optical1, optical2] = pair(frames).map(finishFrame);
  const [sun1, sun2] = pair(frames).map(frame => finishFrame(frame + 8));
  const [beard1, beard2] = pair(beardFits[shape].slice(0, 6));
  return {
    version: 1, shape,
    looks: [
      { frame: optical1 }, { frame: optical2 }, { frame: sun1 }, { frame: sun2 },
      { hair: hair1 }, { hair: hair2 }, { beard: beard1 },
      { frame: random() < 0.5 ? optical1 : sun1, hair: hair1, beard: beard2 },
    ],
  };
}

export function lookTitle(look: Look) {
  const { frame, hair, beard } = getLookAssets(look);
  return frame && hair ? "Complete look" : frame?.name ?? hair?.name ?? beard?.name ?? "Style preview";
}

export function lookDescription(shape: ShapeKey, look: Look) {
  const { frame, hair, beard } = getLookAssets(look);
  if (frame && hair && beard) return `${frame.name}, ${hair.name.toLowerCase()}, and ${beard.name.toLowerCase()}.`;
  return `Selected for your ${SHAPES[shape].name.toLowerCase()} face shape.`;
}
