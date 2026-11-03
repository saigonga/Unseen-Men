import type { ShapeKey } from "./content";

export interface FrameRecommendation {
  name: string;
  category: "optical" | "sunglasses";
  tagline: string;
  desc: string;
  suits: string[];
}

export interface AvoidFrame {
  name: string;
  reason: string;
}

export interface EyewearAdvice {
  headline: string;
  objective: string;
  optical: FrameRecommendation[];
  sunglasses: FrameRecommendation[];
  avoid: AvoidFrame[];
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface ColorPalette {
  undertoneName: string;
  undertoneDesc: string;
  sampleHex: string;
  baseNeutrals: ColorSwatch[];
  matchingColors: ColorSwatch[];
  avoidColors: { name: string; hex: string; reason: string }[];
}

export interface BarberInstruction {
  primaryDirection: string;
  topLength: string;
  sidesLength: string;
  taper: string;
  stylingProduct: string;
  notes: string;
}

/* =========================================================================
   1. EYEWEAR (SPECS & SUNGLASSES) PER FACE SHAPE
   ========================================================================= */

export const EYEWEAR_BY_SHAPE: Record<ShapeKey, EyewearAdvice> = {
  square: {
    headline: "Eyewear Selection",
    objective: "Frames that lift and soften angular structure without adding boxy width.",
    optical: [
      {
        name: "Defined D-Frame",
        category: "optical",
        tagline: "01",
        desc: "A medium-wide acetate frame that gives the face clean structure while softening sharp corners.",
        suits: ["Softens jawline", "Adds vertical lift"],
      },
      {
        name: "Modern Browline",
        category: "optical",
        tagline: "02",
        desc: "A stronger top rim draws the eye upward, highlighting the brow and balancing a strong jaw.",
        suits: ["Draws eye upward", "Balances strong jaw"],
      },
      {
        name: "Slim Geometric",
        category: "optical",
        tagline: "03",
        desc: "Fine angular lines sharpen the look without adding horizontal bulk.",
        suits: ["Lightweight feel", "No side bulk"],
      },
    ],
    sunglasses: [
      {
        name: "Flat-Top Square",
        category: "sunglasses",
        tagline: "01",
        desc: "A broad straight top line adds definition and balanced width.",
        suits: ["Bold structure", "Complements brow line"],
      },
      {
        name: "Angular Navigator",
        category: "sunglasses",
        tagline: "02",
        desc: "A structured double bridge brings lift with a lighter titanium feel.",
        suits: ["Vertical lift", "Classic masculine edge"],
      },
      {
        name: "Tapered Rectangular",
        category: "sunglasses",
        tagline: "03",
        desc: "Crisp corners and gently tapered sides streamline the lower face.",
        suits: ["Streamlines cheeks", "Subtle taper"],
      },
    ],
    avoid: [
      {
        name: "Small Round Wire Frames",
        reason: "Small circular lenses exaggerate jaw width and contrast too harshly with angular bone structure.",
      },
      {
        name: "Heavy Boxy Square Frames",
        reason: "Heavy sharp squares make a square face look overly boxed and blocky.",
      },
    ],
  },

  round: {
    headline: "Eyewear Selection",
    objective: "Frames that add vertical lift, clean angles, and structure to offset roundness.",
    optical: [
      {
        name: "Crisp Rectangular Acetate",
        category: "optical",
        tagline: "01",
        desc: "Horizontal angular frames sharpen cheek fullness and create clean facial lines.",
        suits: ["Sharpens soft cheeks", "Lengthens silhouette"],
      },
      {
        name: "Angular D-Frame",
        category: "optical",
        tagline: "02",
        desc: "A defined upper rim with straight brow line adds immediate vertical lift.",
        suits: ["Adds vertical lift", "Structured brow"],
      },
      {
        name: "Geometric Hexagonal",
        category: "optical",
        tagline: "03",
        desc: "Subtle multi-angled rims create visual contrast against soft curves.",
        suits: ["Architectural contrast", "Modern aesthetic"],
      },
    ],
    sunglasses: [
      {
        name: "Square Wayfarer",
        category: "sunglasses",
        tagline: "01",
        desc: "Angled corners and thick temples narrow the cheeks.",
        suits: ["Sharpens silhouette", "Timeless proportions"],
      },
      {
        name: "Flat-Top Navigator",
        category: "sunglasses",
        tagline: "02",
        desc: "A straight brow bar counterbalances cheek fullness.",
        suits: ["Straight top line", "Lengthens face"],
      },
      {
        name: "Angular Clubmaster",
        category: "sunglasses",
        tagline: "03",
        desc: "Semi-rimless design pulls the eye to the upper third.",
        suits: ["Focus on brow", "Light bottom rim"],
      },
    ],
    avoid: [
      {
        name: "Circular & Teardrop Frames",
        reason: "Round glasses accentuate round cheeks and make the face look shorter.",
      },
      {
        name: "Small Narrow Ovals",
        reason: "Narrow oval frames disappear into the face and add excess cheek fullness.",
      },
    ],
  },

  oval: {
    headline: "Eyewear Selection",
    objective: "Balanced frames that maintain natural harmony and fit the brow width evenly.",
    optical: [
      {
        name: "Modern Wayfarer",
        category: "optical",
        tagline: "01",
        desc: "Proportioned acetate rims that align smoothly with your cheekbone width.",
        suits: ["Balanced silhouette", "Everyday elegance"],
      },
      {
        name: "Panto / Keyhole Bridge",
        category: "optical",
        tagline: "02",
        desc: "Rounded bottom with a defined upper line flatters balanced proportions.",
        suits: ["Complements natural balance", "Vintage warmth"],
      },
      {
        name: "Minimalist Titanium Square",
        category: "optical",
        tagline: "03",
        desc: "Ultra-clean slim rims maintain natural symmetry without overwhelming the eyes.",
        suits: ["Lightweight", "Clean lines"],
      },
    ],
    sunglasses: [
      {
        name: "Classic Aviator",
        category: "sunglasses",
        tagline: "01",
        desc: "Teardrop curve highlights high cheekbones and symmetrical thirds.",
        suits: ["Symmetrical proportions", "Classic silhouette"],
      },
      {
        name: "Square Acetate",
        category: "sunglasses",
        tagline: "02",
        desc: "Crisp square edges add a touch of masculine structure.",
        suits: ["Gentle angularity", "Balanced presence"],
      },
      {
        name: "Hexagonal Wire",
        category: "sunglasses",
        tagline: "03",
        desc: "Sleek geometric silhouette that sits naturally on balanced cheekbones.",
        suits: ["Contemporary style", "Lightweight aesthetic"],
      },
    ],
    avoid: [
      {
        name: "Oversized Shield Frames",
        reason: "Overly tall or massive frames swallow the balanced proportions of an oval face.",
      },
    ],
  },

  rectangle: {
    headline: "Eyewear Selection",
    objective: "Frames with vertical depth and softened edges that break up face length.",
    optical: [
      {
        name: "Tall D-Frame",
        category: "optical",
        tagline: "01",
        desc: "Deeper vertical lenses shorten the appearance of a longer face.",
        suits: ["Adds vertical depth", "Breaks up face length"],
      },
      {
        name: "Round Keyhole Acetate",
        category: "optical",
        tagline: "02",
        desc: "Curved contours soften the strong jawline while adding middle-third balance.",
        suits: ["Softens jawline", "Balances length"],
      },
      {
        name: "Bold Browline",
        category: "optical",
        tagline: "03",
        desc: "Heavy brow rim draws horizontal emphasis across the eyes.",
        suits: ["Horizontal width", "Draws gaze upward"],
      },
    ],
    sunglasses: [
      {
        name: "Large Square Navigator",
        category: "sunglasses",
        tagline: "01",
        desc: "Deep square lenses take up vertical space and balance a tall forehead.",
        suits: ["Shortens silhouette", "Masculine weight"],
      },
      {
        name: "Classic Wayfarer Max",
        category: "sunglasses",
        tagline: "02",
        desc: "Wide temples and deep bottom rims add horizontal presence.",
        suits: ["Adds horizontal presence", "Balanced depth"],
      },
      {
        name: "Pilot Double-Bridge",
        category: "sunglasses",
        tagline: "03",
        desc: "A low double bridge cuts across the nose line to reduce perceived length.",
        suits: ["Breaks vertical line", "Vintage appeal"],
      },
    ],
    avoid: [
      {
        name: "Narrow Rectangular Frames",
        reason: "Thin, horizontally narrow frames make a long face look even longer and narrower.",
      },
    ],
  },

  heart: {
    headline: "Eyewear Selection",
    objective: "Frames that broaden the lower third and keep the top rim understated.",
    optical: [
      {
        name: "Round Wire Panto",
        category: "optical",
        tagline: "01",
        desc: "Soft rounded base balances a broad forehead and complements a narrower chin.",
        suits: ["Softens broad brow", "Complements pointed chin"],
      },
      {
        name: "Light Metal Aviator",
        category: "optical",
        tagline: "02",
        desc: "Bottom-heavy teardrop shape adds width where the jaw is narrowest.",
        suits: ["Expands lower eye line", "Weightless feel"],
      },
      {
        name: "Rimless / Semi-Rimless",
        category: "optical",
        tagline: "03",
        desc: "Minimal visual weight at the temples keeps forehead focus clean.",
        suits: ["Minimal top weight", "Clean silhouette"],
      },
    ],
    sunglasses: [
      {
        name: "Classic Aviator",
        category: "sunglasses",
        tagline: "01",
        desc: "Teardrop slope broadens the mid-to-lower face.",
        suits: ["Flattering width balance", "Iconic style"],
      },
      {
        name: "Rounded Clubmaster",
        category: "sunglasses",
        tagline: "02",
        desc: "Gentle rounded lenses soften upper temples.",
        suits: ["Soft contrast", "Structured brow"],
      },
      {
        name: "Fine Wire Hexagon",
        category: "sunglasses",
        tagline: "03",
        desc: "Subtle angles without thick acetate bulk.",
        suits: ["Lightweight presence", "Modern edge"],
      },
    ],
    avoid: [
      {
        name: "Heavy Cat-Eye or Winged Frames",
        reason: "Decorative, flared-out top corners make a broad forehead look disproportionately wider.",
      },
    ],
  },

  diamond: {
    headline: "Eyewear Selection",
    objective: "Frames that accentuate the eye line while softening sharp cheekbones.",
    optical: [
      {
        name: "Modern Browline",
        category: "optical",
        tagline: "01",
        desc: "Strong top rim broadens a narrow forehead to match high, wide cheekbones.",
        suits: ["Broadens forehead", "Accentuates eye line"],
      },
      {
        name: "Oval Acetate",
        category: "optical",
        tagline: "02",
        desc: "Gentle curves soften dramatic cheek angles and sharp jawlines.",
        suits: ["Softens sharp cheeks", "Natural symmetry"],
      },
      {
        name: "Soft Rectangular Wire",
        category: "optical",
        tagline: "03",
        desc: "Slightly curved rectangle creates balanced horizontal structure.",
        suits: ["Adds horizontal balance", "Lightweight"],
      },
    ],
    sunglasses: [
      {
        name: "Clubmaster Classic",
        category: "sunglasses",
        tagline: "01",
        desc: "Prominent brow bar widens the upper silhouette.",
        suits: ["Upper width balance", "Sharp brow"],
      },
      {
        name: "Rounded Wayfarer",
        category: "sunglasses",
        tagline: "02",
        desc: "Combines square upper line with softly curved lower rim.",
        suits: ["Complements high cheeks", "Balanced weight"],
      },
      {
        name: "Aviator Wire",
        category: "sunglasses",
        tagline: "03",
        desc: "Classic slope balances cheekbone width and narrow chin.",
        suits: ["Smooths facial contours", "Timeless look"],
      },
    ],
    avoid: [
      {
        name: "Narrow Pointy Frames",
        reason: "Narrow frames emphasize extreme cheekbone width and make eyes look closer together.",
      },
    ],
  },
};

/* =========================================================================
   2. BARBER INSTRUCTIONS PER FACE SHAPE
   ========================================================================= */

export const BARBER_GUIDE_BY_SHAPE: Record<ShapeKey, BarberInstruction> = {
  square: {
    primaryDirection: "Lift, not width.",
    topLength: "4.5 – 5.5 cm",
    sidesLength: "0.6 cm (#2 guard) tapering to 1.5 cm (#5 guard) at upper temples",
    taper: "Low to mid taper; avoid a boxy high block",
    stylingProduct: "Matte clay or dry texturizing paste for separated lift",
    notes: "Leave natural length at the front for upward lift. Remove side bulk at the temples so the sides remain lean and square. Keep the natural neckline clean without razor hardlines.",
  },
  round: {
    primaryDirection: "Vertical height with tight angular edges.",
    topLength: "5.0 – 6.5 cm",
    sidesLength: "0.3 cm (#1 guard) low skin taper into 1.2 cm (#4 guard)",
    taper: "High or mid skin fade to slim down cheek fullness",
    stylingProduct: "High-hold matte paste or sea salt spray + blow dry",
    notes: "Build clear vertical height in the quiff or pomp. Keep sides extremely tight and vertical (avoid rounded blending) to create a lean, elongated silhouette.",
  },
  oval: {
    primaryDirection: "Clean structure with balanced proportion.",
    topLength: "4.0 – 6.0 cm depending on preferred style",
    sidesLength: "0.9 cm (#3 guard) into 2.0 cm smooth scissor blend",
    taper: "Classic taper or low fade",
    stylingProduct: "Lightweight cream or medium-hold pomade",
    notes: "Follow natural head contour. Natural hairline works best. Oval faces can wear almost any length; avoid leaving excess bulk on top without side structure.",
  },
  rectangle: {
    primaryDirection: "Side volume with controlled, low top height.",
    topLength: "3.0 – 4.0 cm (keep top short to avoid lengthening face)",
    sidesLength: "1.5 cm (#5 guard) scissor-finished, avoid harsh skin fades",
    taper: "Low scissor taper; keep soft volume through temples",
    stylingProduct: "Styling cream or texture clay, side-swept",
    notes: "Do not cut sides too tight; keeping side fullness softens vertical length. Style hair with a clean side sweep or gentle side part rather than a high pomp.",
  },
  heart: {
    primaryDirection: "Textured mid-length with soft temple flow.",
    topLength: "5.0 – 7.0 cm with natural movement",
    sidesLength: "1.5 cm to 2.5 cm scissor over comb (keep softness)",
    taper: "Low, gentle taper; avoid high shaved fades",
    stylingProduct: "Medium-shine styling paste or sea salt cream",
    notes: "Avoid buzz cuts or harsh high fades that exaggerate a broad forehead. Allow fringe to fall slightly to one side to break forehead width.",
  },
  diamond: {
    primaryDirection: "Fuller temples and soft chin-balancing fringe.",
    topLength: "5.0 – 6.5 cm with textured layers",
    sidesLength: "1.2 cm (#4 guard) up to scissor length",
    taper: "Mid taper with soft blend",
    stylingProduct: "Matte texturizing powder or dry clay",
    notes: "Keep some fullness around the temples and ears to balance wide cheekbones. Add texture and soft fringe on top.",
  },
};

/* =========================================================================
   3. COLOUR PALETTES (UNDERTONE & WARDROBE RECOMMENDATIONS)
   ========================================================================= */

export const UNDERTONE_PALETTES: Record<string, ColorPalette> = {
  warm_golden: {
    undertoneName: "Medium Warm Golden",
    undertoneDesc: "Warm golden undertone, flattered by rich, warm and moderately saturated earthy shades.",
    sampleHex: "#9B6846",
    baseNeutrals: [
      { name: "Warm Ivory", hex: "#F5EBE1" },
      { name: "Oatmeal", hex: "#D8C7B4" },
      { name: "Camel", hex: "#B8895E" },
      { name: "Warm Taupe", hex: "#957B6C" },
      { name: "Dark Chocolate", hex: "#422F24" },
      { name: "Olive", hex: "#5C6044" },
      { name: "Warm Charcoal", hex: "#3B3E43" },
      { name: "Deep Navy", hex: "#1C2A3A" },
    ],
    matchingColors: [
      { name: "Forest Green", hex: "#1D4734" },
      { name: "Deep Teal", hex: "#0E545B" },
      { name: "Royal Cobalt", hex: "#1E408A" },
      { name: "Rich Plum", hex: "#522543" },
      { name: "Burgundy", hex: "#631D26" },
      { name: "Terracotta", hex: "#9E4631" },
      { name: "Burnt Rust", hex: "#A94E27" },
      { name: "Warm Ochre", hex: "#B78122" },
      { name: "Coral Rose", hex: "#C76558" },
      { name: "Dusty Cedar", hex: "#9D555A" },
      { name: "Ocean Teal", hex: "#0F767D" },
      { name: "Amber Brown", hex: "#935528" },
    ],
    avoidColors: [
      { name: "Icy Lilac", hex: "#DDD6E5", reason: "Cool icy pastels mute your skin's golden warmth and look washed out." },
      { name: "Chalky Baby Blue", hex: "#BFD5E7", reason: "High-contrast cool pastels contrast uncomfortably with warm undertones." },
      { name: "Cool Ash Grey", hex: "#9EA0A3", reason: "Grey without warmth makes the complexion look dull and flat." },
      { name: "Pale Mint", hex: "#C5E3D5", reason: "Pale cool greens clash with golden undertones." },
    ],
  },
  cool_deep: {
    undertoneName: "Cool Deep Contrast",
    undertoneDesc: "Cool undertone with strong natural contrast, flattered by crisp jewel tones and icy accents.",
    sampleHex: "#7A4E38",
    baseNeutrals: [
      { name: "Pure White", hex: "#FFFFFF" },
      { name: "Cool Grey", hex: "#8E9399" },
      { name: "Slate", hex: "#5A626A" },
      { name: "Midnight Navy", hex: "#0E1A29" },
      { name: "Jet Black", hex: "#111111" },
      { name: "Espresso", hex: "#2E231D" },
      { name: "Charcoal", hex: "#282B30" },
      { name: "Steel Blue", hex: "#3A4A5B" },
    ],
    matchingColors: [
      { name: "Sapphire Blue", hex: "#103778" },
      { name: "Emerald Green", hex: "#0B533E" },
      { name: "Crisp Crimson", hex: "#8A1424" },
      { name: "Royal Violet", hex: "#43185B" },
      { name: "Ice Blue", hex: "#99BFE5" },
      { name: "Deep Ruby", hex: "#6E0F1D" },
      { name: "Cobalt", hex: "#143F8F" },
      { name: "Pine Green", hex: "#183F30" },
      { name: "True Plum", hex: "#541B3B" },
      { name: "Charcoal Blue", hex: "#263545" },
      { name: "Dark Mulberry", hex: "#481528" },
      { name: "Frost Silver", hex: "#D6DBDF" },
    ],
    avoidColors: [
      { name: "Mustard Yellow", hex: "#BFA030", reason: "Muddy warm yellows clash with cool contrast and look sickly." },
      { name: "Warm Orange", hex: "#D46522", reason: "Warm orange draws unnatural ruddiness from cool skin." },
      { name: "Camel", hex: "#A67A4D", reason: "Earth tones without cool depth make the face look tired." },
      { name: "Olive Khaki", hex: "#6B6946", reason: "Muted warm greens wash out high-contrast hair and eyes." },
    ],
  },
};

/** Determine undertone from photo RGB sampling */
export function getUndertonePalette(r: number, g: number, b: number): ColorPalette {
  // Simple heuristic: if red > green + 15 and green > blue, it is warm golden brown
  const isWarm = r > b * 1.15;
  return isWarm ? UNDERTONE_PALETTES.warm_golden : UNDERTONE_PALETTES.cool_deep;
}

/* =========================================================================
   4. FACIAL THIRDS & STYLING OBJECTIVES
   ========================================================================= */

export interface FacialThirds {
  upperPct: number;
  midPct: number;
  lowerPct: number;
  upperLabel: string;
  midLabel: string;
  lowerLabel: string;
}

export type AnyPoint = { x: number; y: number } | [number, number];

function getPtY(p?: AnyPoint): number | undefined {
  if (!p) return undefined;
  if (Array.isArray(p)) return p[1];
  return p.y;
}

export const STYLING_OBJECTIVES: Record<ShapeKey, { headline: string; objective: string; coreRule: string }> = {
  square: {
    headline: "Direction: Lift, Not Width",
    objective: "Draw the eye upward with vertical height, soft texture, and clean side tapers to celebrate your chiselled jaw without widening the face.",
    coreRule: "Keep the sides trimmed closer than the top; opt for matte texture over slick wet looks.",
  },
  oval: {
    headline: "Direction: Proportional Balance",
    objective: "Preserve natural architectural harmony by keeping top volume proportional to facial width.",
    coreRule: "Avoid heavy front bangs that cover the forehead; sweep up or back to accentuate the brow.",
  },
  round: {
    headline: "Direction: Vertical Elongation",
    objective: "Create vertical silhouette lines and angular definition to slim the cheeks and add perceived structure.",
    coreRule: "Never build width over the ears; focus all volume vertically on the crown.",
  },
  rectangle: {
    headline: "Direction: Proportional Softening",
    objective: "Avoid excessive vertical height on top. Use layered texture and natural side fullness to balance the longer facial canvas.",
    coreRule: "Avoid extreme high pompadours; keep top length under 5 cm with relaxed side blending.",
  },
  heart: {
    headline: "Direction: Lower-Face Grounding",
    objective: "Balance the wider forehead and pointed chin by drawing visual weight downward toward the jaw.",
    coreRule: "Pair textured top volume with a dense, squared stubble or short boxed beard to broaden the chin.",
  },
  diamond: {
    headline: "Direction: Temple & Jaw Harmony",
    objective: "Soften pronounced cheekbones by adding subtle fullness around the temples and grounding the chin.",
    coreRule: "Avoid sharp skin fades directly at the cheek line; choose soft tapers and scissor-worked sides.",
  },
};

export function getFacialThirds(points?: AnyPoint[]): FacialThirds {
  if (!points || points.length < 34) {
    return {
      upperPct: 29,
      midPct: 37,
      lowerPct: 34,
      upperLabel: "Upper (Forehead)",
      midLabel: "Mid (Brow to Nose)",
      lowerLabel: "Lower (Nose to Chin)",
    };
  }

  // MediaPipe 478 points
  if (points.length >= 400) {
    const p10Y = getPtY(points[10]);
    const p9Y = getPtY(points[9]) ?? 0;
    const p8Y = getPtY(points[8]);
    const p2Y = getPtY(points[2]);
    const p164Y = getPtY(points[164]);
    const p152Y = getPtY(points[152]);
    const p199Y = getPtY(points[199]);

    const topForeheadY = p10Y ?? (p9Y - 45);
    const browY = p9Y || (p8Y ?? 0);
    const noseY = p2Y ?? p164Y ?? (browY + 30);
    const chinY = p152Y ?? p199Y ?? (noseY + 30);

    const dUpper = Math.max(15, browY - topForeheadY);
    const dMid = Math.max(15, noseY - browY);
    const dLower = Math.max(15, chinY - noseY);
    const total = dUpper + dMid + dLower;

    let u = Math.round((dUpper / total) * 100);
    let m = Math.round((dMid / total) * 100);
    let l = 100 - u - m;

    u = Math.min(Math.max(u, 24), 38);
    m = Math.min(Math.max(m, 30), 42);
    l = 100 - u - m;

    return {
      upperPct: u,
      midPct: m,
      lowerPct: l,
      upperLabel: "Upper (Forehead)",
      midLabel: "Mid (Brow to Nose)",
      lowerLabel: "Lower (Nose to Chin)",
    };
  }

  // 68 points fallback
  const browY = ((getPtY(points[19]) ?? 0) + (getPtY(points[24]) ?? 0)) / 2;
  const noseY = getPtY(points[33]) ?? 0;
  const chinY = getPtY(points[8]) ?? 0;
  const faceHeight = chinY - browY;
  const dUpper = faceHeight * 0.42;
  const dMid = noseY - browY;
  const dLower = chinY - noseY;
  const total = dUpper + dMid + dLower;

  let u = Math.round((dUpper / total) * 100);
  let m = Math.round((dMid / total) * 100);
  let l = 100 - u - m;
  u = Math.min(Math.max(u, 25), 36);
  m = Math.min(Math.max(m, 32), 40);
  l = 100 - u - m;

  return {
    upperPct: u,
    midPct: m,
    lowerPct: l,
    upperLabel: "Upper (Forehead)",
    midLabel: "Mid (Brow to Nose)",
    lowerLabel: "Lower (Nose to Chin)",
  };
}
