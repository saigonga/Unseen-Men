/* All user-facing grooming content. Review with a barber (cuts, beard) and a
   dermatologist (skin wording) before launch. Logic lives in faceShape.ts. */

export type ShapeKey = "oval" | "round" | "square" | "rectangle" | "heart" | "diamond";
export type AgeBracket = "18-24" | "25-34" | "35-44" | "45+";
export type Beard = "none" | "stubble" | "full";
export type Concern = "acne" | "spots" | "oil" | "dull";
export type TraitKey =
  | "long" | "short" | "wideJaw" | "narrowJaw" | "wideForehead" | "narrowForehead"
  | "broadChin" | "pointedChin" | "sharpJaw" | "softJaw";

/** [name, reason] */
export type Pair = [string, string];

export interface ShapeContent {
  name: string;
  desc: string;
  best: Pair[];
  avoid: Pair[];
  beard: { v: "Yes" | "Optional"; cls: "yes" | "opt"; text: string; styles: Pair[]; keep: string };
}

export const SHAPE_ORDER: ShapeKey[] = ["oval", "round", "square", "rectangle", "heart", "diamond"];

export const SHAPES: Record<ShapeKey, ShapeContent> = {
  oval: { name:"Oval", desc:"Longer than wide, with a jaw slightly narrower than your cheekbones. The most balanced shape, so most cuts work.",
    best:[["Textured quiff","Height on top keeps your length in proportion."],["Classic side part","Clean structure that suits a balanced face."],["Short crew cut","Low effort, and your proportions carry it."]],
    avoid:[["Heavy straight fringe","Covers the forehead and hides your best feature: balance."],["Very long, flat hair","Drags the face down and makes it look longer."]],
    beard:{v:"Optional", cls:"opt", text:"You don't need a beard to balance your face. Keep it if you like it, but keep it short and even.", styles:[["Light stubble","Adds edge without changing your proportions."],["Short boxed beard","Neat, even length on cheeks and chin."]], keep:"Your balanced face carries most lengths. Keep cheeks and chin at the same length with clean edges; don't let the chin grow long, which makes the face look longer."}},
  round: { name:"Round", desc:"Width and length are close, with soft cheeks and a rounded jaw. The goal is to add height and angles.",
    best:[["High fade with pompadour","Height on top and tight sides make the face look longer."],["Faux hawk","Vertical shape breaks up the roundness."],["Angular side-swept fringe","Diagonal lines add structure."]],
    avoid:[["Bowl or rounded crop","Repeats the round outline."],["Buzz cut with full sides","Adds width where you don't want it."]],
    beard:{v:"Yes", cls:"yes", text:"A beard helps. Keep the cheeks tight and let the chin grow longer to stretch the face and draw a sharper jawline.", styles:[["Extended goatee","Length at the chin makes the face look longer."],["Short sides, longer chin beard","Builds an angle under a soft jaw."]], keep:"Keep it, it's working for you. Trim the cheeks short and tight and leave the chin 1–2 cm longer than the sides to stretch the face. Avoid an even, rounded full beard."}},
  square: { name:"Square", desc:"Strong, wide jaw that lines up with your forehead and cheekbones. Lean into the structure, or soften it slightly.",
    best:[["Short textured crop","Shows off a strong jaw without adding bulk."],["Crew cut or short fade","Classic, sharp, and suits angular faces."],["Slicked back with low fade","Clean lines that match your structure."]],
    avoid:[["Blunt heavy fringe","Makes the face look boxier and shorter."],["Very flat, wide top","Squares off the head even further."]],
    beard:{v:"Optional", cls:"opt", text:"You already have the jaw a beard usually fakes. Stubble shows it off; a short rounded beard softens it if you want a gentler look.", styles:[["Heavy stubble","Keeps your jawline visible."],["Short rounded beard","Softens sharp corners at the jaw."]], keep:"Your jaw is already strong. Keep it short and slightly rounded at the jaw corners; a boxy, squared-off beard adds even more angle."}},
  rectangle: { name:"Rectangle", desc:"Clearly longer than wide, with a strong jaw. The goal is to add width and avoid extra height.",
    best:[["Side part with volume at the sides","Width balances the length."],["Textured fringe","Covers some forehead, so the face looks shorter."],["Ivy League, medium length","Keeps height low and sides fuller."]],
    avoid:[["Tall pompadour or quiff","More height makes the face look even longer."],["Skin fade with long top","Tight sides make it look narrower."]],
    beard:{v:"Yes", cls:"yes", text:"A beard helps if the sides stay fuller than the chin. That adds width and keeps the face from looking long.", styles:[["Full beard, fuller on the cheeks","Adds width to a long face."],["Short boxed beard, short at the chin","Avoids adding length below the jaw."]], keep:"Keep the sides fuller than the chin. A long chin makes the face look even longer, so trim the chin shorter than the cheeks."}},
  heart: { name:"Heart", desc:"Wider forehead and cheekbones that taper to a narrower chin. The goal is to add weight low and reduce width up top.",
    best:[["Medium textured fringe","Reduces how wide the forehead looks."],["Side-swept, longer top","Soft volume without height."],["Taper with fuller sides low","Balances the narrow lower face."]],
    avoid:[["Slicked back with tight sides","Exposes the widest part of your face."],["Big volume on top","Makes the forehead look even wider."]],
    beard:{v:"Yes", cls:"yes", text:"A beard is your best tool. Fullness at the chin and jaw fills out the narrow lower half.", styles:[["Full beard","Adds width where your face narrows."],["Garibaldi (full, rounded bottom)","Builds weight around the chin."]], keep:"Keep it full at the chin and jaw, which is where your face needs weight. Keep the cheek line low and the chin fuller than the sides."}},
  diamond: { name:"Diamond", desc:"Cheekbones are the widest point, with a narrower forehead and chin. The goal is to add width at the forehead and jaw.",
    best:[["Fringe brushed forward","Adds width at the forehead."],["Textured mid-length cut","Softens the cheekbone peak."],["Side part with fuller sides","Balances narrow temples."]],
    avoid:[["Very short sides with spiky top","Makes the cheekbones look sharper and the top pointed."],["Centre part, flat to the head","Narrows the forehead further."]],
    beard:{v:"Yes", cls:"yes", text:"A beard helps by widening the chin and jaw so they match your cheekbones.", styles:[["Full beard with a square base","Adds width at the jaw."],["Chin strap with fuller chin","Builds the lower face without cheek bulk."]], keep:"Keep the chin and jaw full and the cheeks lighter. That widens the lower face to match your cheekbones."}}
};

export type SkinAreaKey = "texture_pores" | "breakouts" | "uneven_tone_dark_spots" | "oiliness" | "dryness" | "under_eye";

/** `sku` values are placeholders until the Nordman product list is final. */
export const SKIN_AREAS: Record<SkinAreaKey, { label: string; ing: string[]; sku: string }> = {
  texture_pores:{label:"Texture & pores", ing:["Salicylic acid (BHA)","Niacinamide"], sku:"Nordman face wash slot"},
  breakouts:{label:"Breakouts", ing:["Salicylic acid","Benzoyl peroxide 2.5% (spot)","Niacinamide"], sku:"Nordman spot treatment slot"},
  uneven_tone_dark_spots:{label:"Uneven tone & dark spots", ing:["Niacinamide","Vitamin C","Daily SPF 50"], sku:"Nordman serum + SPF slot"},
  oiliness:{label:"Oiliness", ing:["Niacinamide","Oil-free gel moisturiser","Clay mask weekly"], sku:"Nordman gel moisturiser slot"},
  dryness:{label:"Dryness", ing:["Ceramides","Hyaluronic acid"], sku:"Nordman moisturiser slot"},
  under_eye:{label:"Under-eye", ing:["Caffeine eye gel","7+ hours sleep","SPF"], sku:"Nordman eye gel slot"}
};

export const ROUTINES: Record<AgeBracket, string[]> = {
  "18-24":["Morning: gentle face wash, oil-free moisturiser, SPF 50.","Night: wash off the day; spot-treat breakouts only where they are.","Haircut every 3–4 weeks to keep the shape.","Trim the beard line weekly; don't over-shave the neck."],
  "25-34":["Morning: face wash, niacinamide serum, moisturiser, SPF 50.","Night: wash, then moisturiser. Add a weekly exfoliating wash.","Haircut every 3–4 weeks; beard trim and line-up weekly.","Beard oil after showers to keep the skin underneath calm."],
  "35-44":["Morning: face wash, vitamin C serum, moisturiser, SPF 50.","Night: wash, then a richer moisturiser. Consider a retinoid 2–3 nights a week.","Haircut every 3–4 weeks; keep sides tidy as hair thins at the temples.","Beard: trim the neckline higher for a sharper jaw."],
  "45+":["Morning: mild cleanser, vitamin C, moisturiser, SPF 50.","Night: cleanse, retinoid 2–3 nights a week, rich moisturiser.","Shorter, textured cuts make thinning hair look fuller.","A short, even beard frames the jaw; trim weekly."]
};

export interface Cut { n: string; s: ShapeKey[]; good: TraitKey[]; bad: TraitKey[]; why: string }

/** Cut library: which shapes each cut suits, which traits it helps, which it hurts. */
export const CUTS: Cut[] = [
  {n:"Textured quiff", s:["oval","round","square"], good:["short","softJaw"], bad:["long"], why:"Height on top adds length and lifts the face."},
  {n:"High fade with pompadour", s:["round","square"], good:["short","softJaw"], bad:["long","wideForehead"], why:"Tight sides and height make a short or soft face look longer and sharper."},
  {n:"Faux hawk", s:["round","oval"], good:["short"], bad:["long"], why:"A vertical line through the middle breaks up width."},
  {n:"Classic side part", s:["oval","rectangle","square"], good:["long","sharpJaw"], bad:[], why:"Keeps height low and gives clean structure."},
  {n:"Side-swept fringe", s:["heart","round","oval"], good:["wideForehead","softJaw"], bad:[], why:"A diagonal fringe covers part of the forehead and adds angle."},
  {n:"Textured French crop", s:["square","diamond","heart","rectangle"], good:["long","wideForehead","narrowForehead"], bad:["short"], why:"A short forward fringe shortens the face and evens out the forehead."},
  {n:"Crew cut", s:["square","oval","rectangle"], good:["sharpJaw","wideJaw"], bad:["softJaw","pointedChin"], why:"Short and clean, it puts your jawline on show."},
  {n:"Buzz cut", s:["square","oval"], good:["sharpJaw","broadChin"], bad:["softJaw","short","pointedChin"], why:"Works when the bone structure does the talking."},
  {n:"Slicked back with low fade", s:["oval","square"], good:["sharpJaw","narrowForehead"], bad:["wideForehead","long"], why:"Sleek and sharp; shows off a strong face."},
  {n:"Ivy League, medium length", s:["rectangle","oval","heart"], good:["long","narrowForehead"], bad:[], why:"Low height and fuller sides balance a longer face."},
  {n:"Mid-length textured flow", s:["diamond","heart","rectangle","square"], good:["narrowJaw","pointedChin","sharpJaw","long"], bad:["short"], why:"Volume around the lower face softens angles and adds width."},
  {n:"Curtain fringe", s:["heart","diamond","rectangle"], good:["wideForehead","long","narrowForehead"], bad:["short"], why:"A centre-split fringe frames the cheekbones and shortens the forehead."},
  {n:"Taper with fuller sides", s:["rectangle","heart","diamond"], good:["narrowJaw","narrowForehead","long"], bad:["wideJaw"], why:"Keeps width at the sides where your face needs it."},
  {n:"Short textured crop with skin fade", s:["round","oval","square"], good:["short","softJaw","wideJaw"], bad:["long","narrowForehead"], why:"Tight sides slim the face; texture on top adds height."}
];

export const BEARD_TWEAK: Partial<Record<TraitKey, string>> = {
  long:"Keep the chin short so the face doesn't look longer.",
  short:"Let the chin grow a little longer than the cheeks to add length.",
  wideJaw:"Keep the cheeks tight; bulk on the sides makes a wide jaw wider.",
  narrowJaw:"Keep the sides fuller to add width at the jaw.",
  pointedChin:"Grow fuller at the chin to square it off.",
  broadChin:"Keep the chin neat and close; it's already strong.",
  softJaw:"Shape a sharp neckline and cheek line to draw a jaw angle.",
  sharpJaw:"Stubble shows off your jaw angle; you don't need bulk."
};

export const CONCERN_TEXT: Record<Concern, string> = {
  acne: "breakouts", spots: "dark spots", oil: "oily skin", dull: "dull, tired-looking skin"
};

/** Placeholders until the reward decision is made (AGENTS.md section 11). */
export const REWARD = { referralsNeeded: 3, label: "20% off at launch" };
