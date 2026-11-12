/* 9:16 story card (1080×1920): his photo + face shape + referral code.
   Never put skin observations on this card. Everything is drawn on the device. */
import type { ShapeKey } from "./content";
import type { Detection } from "./detector";
import { cropFaceMapped } from "./crop";

export interface CardData {
  shape: ShapeKey;
  headline: string;
  cut?: string;
  beard?: string;
  code: string;
  photo: { img: HTMLImageElement; det: Detection } | null; // null = photo hidden
  tryOn: HTMLImageElement | null;                          // AI preview, used instead of the photo when set
}

const C = { bg: "#141312", panel: "#1d1b19", line: "#34302b", fg: "#ece6da", muted: "#9d958a", brass: "#c9a46a", ink: "#1a1408" };
const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function fonts() {
  return {
    display: `${cssVar("--font-sora")}, "Sora", sans-serif`,
    body: `${cssVar("--font-space-grotesk")}, "Space Grotesk", sans-serif`,
    mono: `${cssVar("--font-jetbrains-mono")}, "JetBrains Mono", monospace`,
  };
}

function fitFont(x: CanvasRenderingContext2D, text: string, weight: number, family: string, start: number, maxW: number) {
  let fs = start;
  do { x.font = `${weight} ${fs}px ${family}`; fs -= 6; } while (x.measureText(text).width > maxW && fs > 40);
  return fs + 6;
}

function coverDraw(x: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, dx: number, dy: number, dw: number, dh: number) {
  const s = Math.max(dw / img.width, dh / img.height);
  const sw = dw / s, sh = dh / s;
  x.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 3, sw, sh, dx, dy, dw, dh);
}

function corners(x: CanvasRenderingContext2D, X: number, Y: number, W: number, H: number, len: number) {
  x.beginPath();
  x.moveTo(X, Y + len); x.lineTo(X, Y); x.lineTo(X + len, Y);
  x.moveTo(X + W - len, Y); x.lineTo(X + W, Y); x.lineTo(X + W, Y + len);
  x.moveTo(X + W, Y + H - len); x.lineTo(X + W, Y + H); x.lineTo(X + W - len, Y + H);
  x.moveTo(X + len, Y + H); x.lineTo(X, Y + H); x.lineTo(X, Y + H - len);
  x.stroke();
}

function glyph(x: CanvasRenderingContext2D, shape: ShapeKey, gx: number, gy: number, s: number) {
  x.beginPath();
  ({
    oval: () => x.ellipse(gx, gy, 120 * s, 170 * s, 0, 0, 7),
    round: () => x.arc(gx, gy, 150 * s, 0, 7),
    square: () => x.roundRect(gx - 140 * s, gy - 160 * s, 280 * s, 320 * s, 30 * s),
    rectangle: () => x.roundRect(gx - 110 * s, gy - 190 * s, 220 * s, 380 * s, 30 * s),
    heart: () => { x.moveTo(gx - 150 * s, gy - 130 * s); x.quadraticCurveTo(gx, gy - 200 * s, gx + 150 * s, gy - 130 * s); x.quadraticCurveTo(gx + 140 * s, gy + 60 * s, gx, gy + 190 * s); x.quadraticCurveTo(gx - 140 * s, gy + 60 * s, gx - 150 * s, gy - 130 * s); },
    diamond: () => { x.moveTo(gx, gy - 190 * s); x.lineTo(gx + 150 * s, gy); x.lineTo(gx, gy + 190 * s); x.lineTo(gx - 150 * s, gy); x.closePath(); },
  } as Record<ShapeKey, () => void>)[shape]();
  x.stroke();
}

export async function drawCard(c: HTMLCanvasElement, d: CardData) {
  const F = fonts();
  try {
    await Promise.all([`900 200px ${F.display}`, `800 84px ${F.display}`, `500 40px ${F.body}`, `600 46px ${F.body}`, `500 30px ${F.mono}`]
      .map(f => document.fonts.load(f)));
  } catch { /* system fonts */ }

  c.width = 1080; c.height = 1920;
  const x = c.getContext("2d")!;
  x.fillStyle = C.bg; x.fillRect(0, 0, 1080, 1920);

  const PH = 1220; // photo block height
  const hasPhoto = Boolean(d.tryOn || d.photo);
  if (d.tryOn) {
    coverDraw(x, d.tryOn, 0, 0, 1080, PH);
  } else if (d.photo) {
    const { canvas, map } = cropFaceMapped(d.photo.img, d.photo.det.box, { padX: 0.9, padTop: 0.75, padBottom: 0.55, max: 1400, aspect: 1080 / PH });
    const s = 1080 / canvas.width;
    x.drawImage(canvas, 0, 0, 1080, canvas.height * s);
    // brass jawline trace: the "scan" look
    const P = d.photo.det.P.map(p => { const q = map(p); return { x: q.x * s, y: q.y * s }; });
    x.save();
    x.beginPath(); x.rect(0, 0, 1080, PH - 60); x.clip();
    x.strokeStyle = C.brass; x.lineWidth = 5; x.shadowColor = "rgba(201,164,106,.8)"; x.shadowBlur = 18;
    x.beginPath(); P.slice(0, 17).forEach((p, i) => (i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y))); x.stroke();
    x.fillStyle = C.brass; x.shadowBlur = 0;
    [1, 15, 4, 12, 8, 17, 26].forEach(i => { x.beginPath(); x.arc(P[i].x, P[i].y, 8, 0, 7); x.fill(); });
    x.setLineDash([14, 10]); x.lineWidth = 3;
    [[1, 15], [4, 12], [17, 26]].forEach(([a, b]) => { x.beginPath(); x.moveTo(P[a].x - 30, P[a].y); x.lineTo(P[b].x + 30, P[b].y); x.stroke(); });
    x.restore();
  }

  if (hasPhoto) {
    const g = x.createLinearGradient(0, PH - 460, 0, PH);
    g.addColorStop(0, "rgba(20,19,18,0)"); g.addColorStop(1, C.bg);
    x.fillStyle = g; x.fillRect(0, PH - 460, 1080, 460);
    const t = x.createLinearGradient(0, 0, 0, 220);
    t.addColorStop(0, "rgba(20,19,18,.75)"); t.addColorStop(1, "rgba(20,19,18,0)");
    x.fillStyle = t; x.fillRect(0, 0, 1080, 220);
    x.strokeStyle = C.brass; x.lineWidth = 6; corners(x, 60, 60, 960, PH - 200, 70);
  } else {
    x.strokeStyle = C.line; x.lineWidth = 2;
    for (let y = 160; y < PH; y += 120) { x.beginPath(); x.moveTo(80, y); x.lineTo(1000, y); x.stroke(); }
    x.strokeStyle = C.fg; x.lineWidth = 6; glyph(x, d.shape, 540, PH / 2 + 40, 1.85);
  }

  x.font = `500 32px ${F.mono}`;
  const brand = "NODD MEN · FACIAL ANALYSIS";
  if (hasPhoto) { x.fillStyle = "rgba(20,19,18,.72)"; x.beginPath(); x.roundRect(84, 92, x.measureText(brand).width + 40, 56, 28); x.fill(); }
  x.fillStyle = C.brass; x.fillText(brand, 104, 132);
  if (d.tryOn) { x.textAlign = "right"; x.fillStyle = C.fg; x.fillText("AI PREVIEW", 980, 132); x.textAlign = "left"; }

  // Verdict
  const y = PH + 20;
  x.fillStyle = C.muted; x.font = `500 34px ${F.mono}`; x.fillText("MY FACE SHAPE IS", 80, y);
  x.fillStyle = C.brass;
  const headline = d.headline.toUpperCase();
  const fs = fitFont(x, headline, 900, F.display, 240, 920);
  x.fillText(headline, 72, y + Math.max(120, fs * 0.92), 920);

  // Footer
  const fy = 1920 - 230;
  x.fillStyle = C.brass; x.beginPath(); x.roundRect(80, fy, 920, 150, 24); x.fill();
  x.fillStyle = C.ink; x.font = `600 44px ${F.body}`; x.fillText("Find your face shape. Use my code", 120, fy + 64);
  x.font = `500 50px ${F.mono}`; x.fillText(d.code, 120, fy + 122);
}
