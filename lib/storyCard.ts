/* 9:16 story card (1080×1920). Fun part only: face shape, best cut, beard verdict.
   Never put skin observations on this card. */
import { SHAPES } from "./content";
import type { ShapeKey } from "./content";

export interface CardData { shape: ShapeKey; cut: string; code: string }

const cssVar = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

function wrap(x: CanvasRenderingContext2D, t: string, X: number, Y: number, maxW: number, lh: number) {
  let line = "";
  for (const word of t.split(" ")) {
    const test = line ? line + " " + word : word;
    if (x.measureText(test).width > maxW && line) { x.fillText(line, X, Y); line = word; Y += lh; }
    else line = test;
  }
  x.fillText(line, X, Y);
}

export async function drawCard(c: HTMLCanvasElement, d: CardData) {
  const display = `${cssVar("--font-display", "")}, "Big Shoulders Display", Impact, sans-serif`;
  const body = `${cssVar("--font-body", "")}, "Instrument Sans", sans-serif`;
  const mono = `${cssVar("--font-mono", "")}, "JetBrains Mono", monospace`;
  try {
    await Promise.all([
      document.fonts.load(`900 200px ${display}`),
      document.fonts.load(`800 84px ${display}`),
      document.fonts.load(`500 40px ${body}`),
      document.fonts.load(`600 46px ${body}`),
      document.fonts.load(`500 30px ${mono}`),
    ]);
  } catch { /* fall back to system fonts */ }

  c.width = 1080; c.height = 1920;
  const x = c.getContext("2d")!, sh = SHAPES[d.shape];
  x.fillStyle = "#141312"; x.fillRect(0, 0, 1080, 1920);
  x.strokeStyle = "#34302b"; x.lineWidth = 2;
  for (let y = 160; y < 1920; y += 120) { x.beginPath(); x.moveTo(80, y); x.lineTo(1000, y); x.stroke(); }
  x.fillStyle = "#c9a46a"; x.font = `500 34px ${mono}`; x.fillText("UNSEEN MEN · FACE SCAN", 80, 130);
  x.fillStyle = "#9d958a"; x.font = `500 48px ${body}`; x.fillText("My face shape is", 80, 420);
  x.fillStyle = "#c9a46a";
  let fs = 260; x.font = `900 ${fs}px ${display}`;
  while (x.measureText(sh.name.toUpperCase()).width > 920) { fs -= 10; x.font = `900 ${fs}px ${display}`; }
  x.fillText(sh.name.toUpperCase(), 72, 420 + fs * 0.95);

  // outline glyph
  x.strokeStyle = "#ece6da"; x.lineWidth = 6;
  const gx = 760, gy = 1180;
  x.beginPath();
  const glyph: Record<ShapeKey, () => void> = {
    oval: () => x.ellipse(gx, gy, 120, 170, 0, 0, 7),
    round: () => x.arc(gx, gy, 150, 0, 7),
    square: () => x.roundRect(gx - 140, gy - 160, 280, 320, 30),
    rectangle: () => x.roundRect(gx - 110, gy - 190, 220, 380, 30),
    heart: () => { x.moveTo(gx - 150, gy - 130); x.quadraticCurveTo(gx, gy - 200, gx + 150, gy - 130); x.quadraticCurveTo(gx + 140, gy + 60, gx, gy + 190); x.quadraticCurveTo(gx - 140, gy + 60, gx - 150, gy - 130); },
    diamond: () => { x.moveTo(gx, gy - 190); x.lineTo(gx + 150, gy); x.lineTo(gx, gy + 190); x.lineTo(gx - 150, gy); x.closePath(); },
  };
  glyph[d.shape](); x.stroke();

  x.fillStyle = "#9d958a"; x.font = `500 36px ${mono}`; x.fillText("MY CUT", 80, 1040);
  x.fillStyle = "#ece6da"; x.font = `800 84px ${display}`;
  wrap(x, d.cut.toUpperCase(), 80, 1130, 560, 86);
  x.fillStyle = "#9d958a"; x.font = `500 36px ${mono}`; x.fillText("BEARD", 80, 1390);
  x.fillStyle = "#ece6da"; x.font = `800 84px ${display}`; x.fillText(sh.beard.v.toUpperCase(), 80, 1480);
  x.fillStyle = "#c9a46a"; x.fillRect(80, 1660, 920, 150);
  x.fillStyle = "#1a1408"; x.font = `600 46px ${body}`; x.fillText("Find yours. Use my code", 120, 1730);
  x.font = `500 50px ${mono}`; x.fillText(d.code, 120, 1790);
}
