/* Line-art illustrations of haircuts and beard styles (front view, 120×140 viewBox).
   Returned as SVG strings so the same art is used in the app, on the story card and in the PDF.
   Placeholder art: swap for barber-approved illustrations or photos later. */

type HairKey =
  | "crew" | "buzz" | "quiff" | "pompadour" | "fauxhawk" | "sidepart" | "sweep" | "french"
  | "slick" | "ivy" | "flow" | "curtain" | "taper" | "cropfade" | "heavyfringe" | "bowl" | "flat" | "centreflat";
type BeardKey =
  | "lightstubble" | "heavystubble" | "boxed" | "boxedshortchin" | "rounded" | "goatee" | "longchin"
  | "full" | "fullcheeks" | "garibaldi" | "squarebase" | "chinstrap";

export function hairKey(name: string): HairKey {
  const n = name.toLowerCase();
  if (/pompadour/.test(n)) return n.includes("tall") ? "quiff" : "pompadour";
  if (/quiff/.test(n)) return "quiff";
  if (/faux hawk|spiky/.test(n)) return "fauxhawk";
  if (/slick/.test(n)) return "slick";
  if (/buzz/.test(n)) return "buzz";
  if (/centre part|center part/.test(n)) return "centreflat";
  if (/curtain/.test(n)) return "curtain";
  if (/french|forward/.test(n)) return "french";
  if (/heavy|blunt|straight fringe/.test(n)) return "heavyfringe";
  if (/bowl|rounded crop/.test(n)) return "bowl";
  if (/flat, wide|wide top/.test(n)) return "flat";
  if (/side-swept|side swept|angular|fringe/.test(n)) return "sweep";
  if (/ivy/.test(n)) return "ivy";
  if (/flow|mid-length|long|textured mid/.test(n)) return "flow";
  if (/taper|fuller sides|volume at the sides/.test(n)) return "taper";
  if (/skin fade|textured crop|short fade|fade with long/.test(n)) return "cropfade";
  if (/side part/.test(n)) return "sidepart";
  return "crew";
}

export function beardKey(name: string): BeardKey {
  const n = name.toLowerCase();
  if (/light stubble/.test(n)) return "lightstubble";
  if (/stubble/.test(n)) return "heavystubble";
  if (/goatee/.test(n)) return "goatee";
  if (/longer chin/.test(n)) return "longchin";
  if (/chin strap/.test(n)) return "chinstrap";
  if (/garibaldi/.test(n)) return "garibaldi";
  if (/square base/.test(n)) return "squarebase";
  if (/boxed/.test(n)) return n.includes("short at the chin") ? "boxedshortchin" : "boxed";
  if (/rounded/.test(n)) return "rounded";
  if (/fuller on the cheeks/.test(n)) return "fullcheeks";
  return "full";
}

const FACE = "M34 70 C34 48 45 38 60 38 C75 38 86 48 86 70 C86 92 76 116 60 118 C44 116 34 92 34 70Z";
const EARS = "M34 70 C28 68 27 82 33 86 M86 70 C92 68 93 82 87 86";
const NECK = "M49 114 L47 138 M71 114 L73 138";
const FEATURES = `<path d="M46 66 h8 M66 66 h8" stroke-width="2.2"/><path d="M60 70 L57 86 L62 87" stroke-width="1.4"/><path d="M53 99 C57 101 63 101 67 99" stroke-width="1.6"/>`;

const HAIR: Record<HairKey, string> = {
  crew: `<path class="h" d="M33 64 C31 40 43 28 60 28 C77 28 89 40 87 64 L85 58 C83 46 75 41 60 41 C45 41 37 46 35 58Z"/>`,
  buzz: `<path class="h f" d="M34 62 C33 42 44 33 60 33 C76 33 87 42 86 62 L85 57 C83 46 75 42 60 42 C45 42 37 46 35 57Z"/>`,
  quiff: `<path class="h" d="M35 60 C33 44 38 34 46 28 C46 14 66 6 80 13 C88 18 90 30 86 44 L86 60 C84 48 77 43 60 43 C47 43 38 48 36 60Z"/><path class="f" d="M33 64 C32 54 33 48 36 44 M87 64 C88 54 87 48 84 44" stroke-width="3"/>`,
  pompadour: `<path class="h" d="M38 46 C36 22 50 6 64 6 C80 6 88 20 84 46 C80 42 72 40 60 40 C48 40 41 42 38 46Z"/><path class="f" d="M34 66 C33 54 35 48 38 46 M86 66 C87 54 85 48 84 46" stroke-width="4"/>`,
  fauxhawk: `<path class="h" d="M48 42 L46 22 L52 26 L54 10 L60 20 L64 8 L68 24 L74 18 L72 42 C68 40 52 40 48 42Z"/><path class="f" d="M34 64 C33 50 38 43 48 42 M86 64 C87 50 82 43 72 42" stroke-width="4"/>`,
  sidepart: `<path class="h" d="M33 64 C31 38 42 24 60 24 C78 24 89 38 87 64 L85 56 C83 44 76 39 64 39 C56 39 48 40 44 44 C40 48 37 52 35 58Z"/><path d="M46 26 C45 32 44 38 44 44" stroke="var(--bg-art)" stroke-width="1.8"/>`,
  sweep: `<path class="h" d="M33 64 C31 38 42 24 60 24 C78 24 89 38 87 64 L85 56 C82 44 72 40 60 40 C54 46 46 52 36 56 L34 60Z"/><path class="h" d="M36 56 C46 54 56 48 64 40 C56 52 48 58 38 60Z"/>`,
  french: `<path class="h" d="M33 62 C31 38 43 28 60 28 C77 28 89 38 87 62 L85 54 L84 50 L80 53 L76 49 L72 53 L68 49 L64 53 L60 49 L56 53 L52 49 L48 53 L44 49 L40 53 L36 50 L35 54Z"/>`,
  slick: `<path class="h" d="M35 60 C33 36 44 22 60 22 C76 22 87 36 85 60 C83 48 76 42 60 42 C44 42 37 48 35 60Z"/><path d="M48 40 C50 32 56 26 64 24 M58 41 C60 33 66 27 74 26 M68 41 C70 35 74 31 80 30" stroke="var(--bg-art)" stroke-width="1.4"/><path class="f" d="M34 66 C33 58 34 54 35 52 M86 66 C87 58 86 54 85 52" stroke-width="3"/>`,
  ivy: `<path class="h" d="M32 66 C30 38 42 22 60 22 C78 22 90 38 88 66 L86 56 C84 44 76 39 66 39 C58 39 50 41 46 45 C40 48 36 54 34 60Z"/><path d="M47 24 C46 31 46 38 46 44" stroke="var(--bg-art)" stroke-width="1.8"/>`,
  flow: `<path class="h" d="M31 92 C26 60 32 26 60 22 C88 26 94 60 89 92 C88 80 87 66 85 58 C82 46 74 41 60 41 C46 41 38 46 35 58 C33 66 32 80 31 92Z"/>`,
  curtain: `<path class="h" d="M32 72 C29 40 42 24 60 24 C78 24 91 40 88 72 C86 62 84 54 80 50 C74 46 66 44 61 40 L59 40 C54 44 46 46 40 50 C36 54 34 62 32 72Z"/><path d="M60 26 L60 40" stroke="var(--bg-art)" stroke-width="1.6"/>`,
  taper: `<path class="h" d="M29 74 C26 40 40 24 60 24 C80 24 94 40 91 74 C89 64 87 56 85 52 C82 44 74 40 60 40 C46 40 38 44 35 52 C33 56 31 64 29 74Z"/>`,
  cropfade: `<path class="h" d="M37 46 C38 32 48 24 60 24 C72 24 82 32 83 46 L80 50 L77 46 L73 50 L69 46 L65 50 L61 46 L57 50 L53 46 L49 50 L45 46 L41 50Z"/><path class="f" d="M35 62 C34 54 35 50 37 47 M85 62 C86 54 85 50 83 47" stroke-width="2.4"/>`,
  heavyfringe: `<path class="h" d="M31 70 C28 38 42 24 60 24 C78 24 92 38 89 70 C87 64 86 60 85 58 L35 58 C34 60 33 64 31 70Z"/>`,
  bowl: `<path class="h" d="M30 66 C26 34 42 22 60 22 C78 22 94 34 90 66 C80 56 70 54 60 54 C50 54 40 56 30 66Z"/>`,
  flat: `<path class="h" d="M30 64 L30 34 C30 28 34 26 40 26 L80 26 C86 26 90 28 90 34 L90 64 C88 52 82 42 60 42 C38 42 32 52 30 64Z"/>`,
  centreflat: `<path class="h" d="M32 70 C29 40 42 28 60 28 C78 28 91 40 88 70 C86 58 82 48 72 44 C66 42 62 38 60 30 C58 38 54 42 48 44 C38 48 34 58 32 70Z"/>`,
};

interface BeardSpec { side: number; chinY: number; chin: "round" | "square" | "point"; o: number; top: number; stache: boolean; strap?: boolean; goatee?: boolean }
const BEARD: Record<BeardKey, BeardSpec> = {
  lightstubble: { side: 0, chinY: 119, chin: "round", o: 0.22, top: 74, stache: true },
  heavystubble: { side: 0, chinY: 120, chin: "round", o: 0.42, top: 72, stache: true },
  boxed: { side: 1, chinY: 124, chin: "square", o: 0.9, top: 74, stache: true },
  boxedshortchin: { side: 1, chinY: 119, chin: "square", o: 0.9, top: 74, stache: true },
  rounded: { side: 1, chinY: 124, chin: "round", o: 0.9, top: 76, stache: true },
  goatee: { side: 0, chinY: 132, chin: "point", o: 0.9, top: 0, stache: true, goatee: true },
  longchin: { side: -2, chinY: 134, chin: "point", o: 0.9, top: 80, stache: true },
  full: { side: 2, chinY: 130, chin: "round", o: 0.92, top: 70, stache: true },
  fullcheeks: { side: 6, chinY: 124, chin: "round", o: 0.92, top: 68, stache: true },
  garibaldi: { side: 4, chinY: 138, chin: "round", o: 0.92, top: 70, stache: true },
  squarebase: { side: 3, chinY: 132, chin: "square", o: 0.92, top: 70, stache: true },
  chinstrap: { side: 0, chinY: 126, chin: "round", o: 0.9, top: 74, stache: false, strap: true },
};

function beardPath(b: BeardSpec) {
  if (b.goatee) return `M50 101 C49 112 54 ${b.chinY - 6} 60 ${b.chinY} C66 ${b.chinY - 6} 71 112 70 101 C66 106 54 106 50 101Z`;
  const L = 34 - b.side, R = 86 + b.side, t = b.top, y = b.chinY;
  const chin = b.chin === "square"
    ? `C${L + 4} ${y - 8} 46 ${y} 52 ${y} L68 ${y} C74 ${y} ${R - 4} ${y - 8}`
    : b.chin === "point"
      ? `C${L + 6} ${y - 16} 52 ${y - 4} 60 ${y} C68 ${y - 4} ${R - 6} ${y - 16}`
      : `C${L + 4} ${y - 6} 48 ${y} 60 ${y} C72 ${y} ${R - 4} ${y - 6}`;
  if (b.strap) return `M${L} ${t} C${L} 92 44 112 50 116 C54 104 60 104 60 104 C60 104 66 104 70 116 C76 112 ${R} 92 ${R} ${t} L${R - 3} ${t} C${R - 3} 92 76 104 70 108 C66 104 54 104 50 108 C44 104 ${L + 3} 92 ${L + 3} ${t}Z M50 108 C52 118 56 ${y} 60 ${y} C64 ${y} 68 118 70 108Z`;
  return `M${L} ${t} C${L} 92 ${L + 2} 102 ${L + 6} 108 ${chin} ${R - 6} 108 C${R - 2} 102 ${R} 92 ${R} ${t} L${R - 6} ${t + 2} C${R - 7} 92 72 104 60 104 C48 104 ${L + 7} 92 ${L + 6} ${t + 2}Z`;
}

const STACHE = `<path class="b" d="M47 97 C52 92 58 93 60 95 C62 93 68 92 73 97 C67 96 63 97 60 98 C57 97 53 96 47 97Z"/>`;

function wrap(inner: string, size: number, color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="${size}" height="${size * 140 / 120}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><style>.h{fill:${color};fill-opacity:.92;stroke:none}.h.f{fill-opacity:.45}.f{stroke-opacity:.55}.b{fill:${color};stroke:none}</style>${inner}</svg>`;
}

export interface ArtOptions { size?: number; color?: string; line?: string; bg?: string }

export function cutSvg(name: string, o: ArtOptions = {}) {
  const color = o.color ?? "#c9a46a", line = o.line ?? "#ece6da";
  return wrap(
    `<path d="${NECK}" stroke="${line}"/><path d="${EARS}" stroke="${line}"/><path d="${FACE}" stroke="${line}"/>` +
    `<g stroke="${line}">${FEATURES}</g>${HAIR[hairKey(name)]}`,
    o.size ?? 120, color
  ).replaceAll("var(--bg-art)", o.bg ?? "#141312");
}

export function beardSvg(name: string, o: ArtOptions = {}) {
  const color = o.color ?? "#c9a46a", line = o.line ?? "#ece6da";
  const b = BEARD[beardKey(name)];
  return wrap(
    `<path d="${NECK}" stroke="${line}"/><path d="${EARS}" stroke="${line}"/><path d="${FACE}" stroke="${line}"/>` +
    `<path class="h f" d="M34 62 C33 42 44 33 60 33 C76 33 87 42 86 62 L85 57 C83 46 75 42 60 42 C45 42 37 46 35 57Z" style="fill-opacity:.25"/>` +
    `<g stroke="${line}">${FEATURES}</g>` +
    `<path class="b" d="${beardPath(b)}" fill-opacity="${b.o}" style="fill-opacity:${b.o}"/>` +
    (b.stache ? STACHE.replace('class="b"', `class="b" style="fill-opacity:${Math.max(b.o, 0.3)}"`) : ""),
    o.size ?? 120, color
  ).replaceAll("var(--bg-art)", o.bg ?? "#141312");
}

/** Rasterise an SVG string (for canvas / PDF). */
export function svgToImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}
