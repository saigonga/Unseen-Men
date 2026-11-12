/* Full private PDF report, generated on the device with jsPDF.
   Print-friendly paper look with the brand's dark header and brass accent. */
import { SHAPES, SKIN_AREAS, ROUTINES, REWARD } from "./content";
import type { AgeBracket, Beard, Pair } from "./content";
import type { FaceResult } from "./faceShape";
import { TRAIT_LABEL, shapeHeadline } from "./faceShape";
import { TRAIT_Z } from "./faceShape.config";
import type { SkinRead } from "./skin";
import { cutSvg, beardSvg, svgToImage } from "./illustrations";

type JsPDFModule = typeof import("jspdf");
let mod: Promise<JsPDFModule> | null = null;
/** Start loading jsPDF early so the download tap stays fast. */
export const preloadPdf = () => (mod ??= import("jspdf"));

export interface PdfData {
  name: string;
  mobile: string;
  email: string | null;
  age: AgeBracket;
  beard: Beard;
  result: FaceResult;
  skin: SkinRead | null;
  code: string;
  faceImage: HTMLCanvasElement | null;
  tryOn: string | null; // data URL
}

type RGB = [number, number, number];
const K = {
  dark: [20, 19, 18] as RGB, ink: [27, 25, 22] as RGB, muted: [108, 101, 91] as RGB, line: [214, 207, 195] as RGB,
  paper: [248, 245, 239] as RGB, brass: [138, 101, 38] as RGB, brassL: [201, 164, 106] as RGB, bad: [168, 64, 44] as RGB, ok: [47, 122, 69] as RGB,
};

async function artPng(svg: string, px = 240) {
  const img = await svgToImage(svg);
  const c = document.createElement("canvas");
  c.width = px; c.height = Math.round(px * 140 / 120);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/png");
}
const artOpts = { color: "#8a6526", line: "#1b1916", bg: "#ffffff" };

export async function buildPdf(d: PdfData): Promise<Blob> {
  const { jsPDF } = await preloadPdf();
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const PW = 595, L = 44, R = PW - 44, Wd = R - L, BOTTOM = 796;
  const sh = SHAPES[d.result.key], r = d.result;
  let y = 0;

  const font = (size: number, style: "normal" | "bold" | "italic" = "normal", color: RGB = K.ink) => {
    doc.setFont("helvetica", style); doc.setFontSize(size); doc.setTextColor(...color);
  };
  const text = (t: string, x: number, yy: number, w: number, lh: number) => {
    const rows: string[] = doc.splitTextToSize(t, w);
    rows.forEach((row, i) => doc.text(row, x, yy + i * lh));
    return rows.length * lh;
  };
  const footer = () => {
    font(7.5, "normal", K.muted);
    doc.text("NODD MEN · Founding Member Program · Grooming guidance, not medical advice.", L, 820);
  };
  const newPage = () => { footer(); doc.addPage(); y = 50; };
  const ensure = (h: number) => { if (y + h > BOTTOM) newPage(); };
  const section = (title: string, eyebrow?: string) => {
    ensure(60);
    y += 14;
    if (eyebrow) { font(7.5, "bold", K.brass); doc.text(eyebrow.toUpperCase(), L, y); y += 14; }
    font(15, "bold", K.ink); doc.text(title.toUpperCase(), L, y); y += 8;
    doc.setDrawColor(...K.line); doc.setLineWidth(0.8); doc.line(L, y, R, y); y += 16;
  };

  // ---------- Header band ----------
  doc.setFillColor(...K.dark); doc.rect(0, 0, PW, 128, "F");
  font(8, "bold", K.brassL); doc.text("NODD MEN · FACIAL ANALYSIS REPORT", L, 40);
  font(26, "bold", [236, 230, 218]); doc.text("A PRECISE ANALYSIS OF YOUR FACE", L, 72);
  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  font(9, "normal", [157, 149, 138]);
  doc.text(`Prepared for ${d.name} · ${d.mobile}${d.email ? ` · ${d.email}` : ""}`, L, 96);
  doc.text(`Age ${d.age} · ${date} · Invite code ${d.code}`, L, 110);
  y = 156;

  // ---------- Verdict: photo + shape ----------
  const photoW = 170, photoH = 210;
  if (d.faceImage && d.faceImage.width) {
    try {
      const ratio = d.faceImage.width / d.faceImage.height;
      const w = Math.min(photoW, photoH * ratio), h = w / ratio;
      doc.setFillColor(...K.paper); doc.roundedRect(L, y, photoW, photoH, 10, 10, "F");
      doc.addImage(d.faceImage.toDataURL("image/jpeg", 0.85), "JPEG", L + (photoW - w) / 2, y + (photoH - h) / 2, w, h);
    } catch { /* skip */ }
  }
  const vx = L + photoW + 24, vw = R - vx;
  font(8, "bold", K.muted); doc.text("YOUR FACE SHAPE", vx, y + 14);
  font(r.lean ? 21 : 44, "bold", K.brass);
  const headingHeight = text(shapeHeadline(r).toUpperCase(), vx, y + 50, vw, 25);
  const descY = y + Math.max(86, 55 + headingHeight);
  font(10, "normal", K.ink);
  let vy = descY + text(r.lean ? `Your measurements are close to both ${sh.name} and ${SHAPES[r.lean].name}.` : sh.desc, vx, descY, vw, 13.5);
  const apart = r.traits.length ? `What sets your face apart: ${r.traits.slice(0, 3).map(t => t.label.toLowerCase()).join(", ")}.` : "Balanced proportions: nothing stands out strongly.";
  font(10, "italic", K.muted); vy += 6 + text(apart, vx, vy + 6, vw, 13.5);
  y = Math.max(y + photoH, vy) + 10;

  // ---------- Compare bars ----------
  section("How your face compares with the scan reference");
  const BARS: [keyof typeof r.z, string, string, string][] = [["R", "Face length", "Shorter", "Longer"], ["J", "Jaw width", "Narrower", "Wider"], ["F", "Forehead width", "Narrower", "Wider"], ["K", "Chin", "Pointed", "Broad"], ["A", "Jaw angle", "Soft", "Sharp"]];
  BARS.forEach(([k, label, lo, hi]) => {
    ensure(30);
    const v = r.z[k], strong = Math.abs(v) >= TRAIT_Z;
    font(9.5, "normal", K.ink); doc.text(label, L, y);
    font(8.5, "bold", strong ? K.brass : K.muted);
    doc.text(strong ? (v > 0 ? hi : lo) : "Near reference", R, y, { align: "right" });
    const ty = y + 8;
    doc.setFillColor(...K.line); doc.roundedRect(L, ty, Wd, 4, 2, 2, "F");
    doc.setDrawColor(...K.muted); doc.setLineWidth(0.6); doc.line(L + Wd / 2, ty - 2, L + Wd / 2, ty + 6);
    const pos = L + Wd * Math.max(0.03, Math.min(0.97, 0.5 + v * 0.16));
    doc.setFillColor(...K.brass); doc.circle(pos, ty + 2, 5, "F");
    font(7, "normal", K.muted); doc.text(lo.toUpperCase(), L, ty + 16); doc.text(hi.toUpperCase(), R, ty + 16, { align: "right" });
    y += 44;
  });

  // ---------- Style cards ----------
  async function cards(items: { name: string; why: string; tag?: string; tagColor?: RGB; kind: "cut" | "beard" }[]) {
    for (const it of items) {
      const png = await artPng(it.kind === "cut" ? cutSvg(it.name, artOpts) : beardSvg(it.name, artOpts));
      font(10, "normal");
      const rows: string[] = doc.splitTextToSize(it.why, Wd - 110);
      const h = Math.max(86, 40 + rows.length * 13);
      ensure(h + 8);
      doc.setFillColor(...K.paper); doc.roundedRect(L, y, Wd, h, 8, 8, "F");
      doc.addImage(png, "PNG", L + 12, y + (h - 70) / 2, 60, 70);
      let ty = y + 22;
      if (it.tag) { font(7.5, "bold", it.tagColor ?? K.brass); doc.text(it.tag.toUpperCase(), L + 90, ty); ty += 14; }
      font(12, "bold", K.ink); doc.text(it.name, L + 90, ty); ty += 15;
      font(9.5, "normal", K.muted); rows.forEach((row, i) => doc.text(row, L + 90, ty + i * 13));
      y += h + 8;
    }
  }

  section("Top 3 cuts for your face", "Haircut");
  await cards(r.cuts.map((c, i) => ({
    name: c.n, kind: "cut" as const,
    tag: i === 0 ? "01 · Best match" : `0${i + 1}`,
    why: c.why + (c.hits.length ? ` Suits your ${c.hits.map(h => TRAIT_LABEL[h].toLowerCase()).join(" and ")}.` : ""),
  })));

  section("Cuts to avoid");
  await cards(r.avoid.map(([n, w]: Pair) => ({ name: n, why: w, kind: "cut" as const, tag: "Avoid", tagColor: K.bad })));

  // ---------- Beard ----------
  const b = sh.beard, tweaks = r.beardTweaks.length ? ` For your face specifically: ${r.beardTweaks.join(" ")}` : "";
  if (d.beard === "none") {
    section(`Beard verdict: ${b.v === "Yes" ? "a beard would help" : "optional"}`, "Beard");
    font(10, "normal"); ensure(60); y += text(`You're clean-shaven now. ${b.text}${tweaks}`, L, y, Wd, 13.5) + 8;
  } else {
    section(`Your ${d.beard === "full" ? "beard" : "stubble"}: how to shape it`, "Beard");
    font(10, "normal"); ensure(60); y += text(`${b.keep}${tweaks}`, L, y, Wd, 13.5) + 8;
  }
  await cards(b.styles.map(([n, w]) => ({ name: n, why: w, kind: "beard" as const })));

  // ---------- Try-on ----------
  if (d.tryOn) {
    section("Your new look", "AI preview");
    const h = 300, w = h * 2 / 3;
    ensure(h + 20);
    doc.addImage(d.tryOn, "JPEG", L, y, w, h);
    font(12, "bold", K.ink); doc.text(`${r.cuts[0].n}`, L + w + 20, y + 20);
    font(10, "normal", K.muted); text(`with ${b.styles[0][0].toLowerCase()}. AI preview; your barber will adapt it to your hair type.`, L + w + 20, y + 38, Wd - w - 20, 13.5);
    y += h + 10;
  }

  // ---------- Skin ----------
  if (d.skin) {
    section("Skin read", "Grooming guidance, not medical advice");
    for (const o of d.skin.observations.filter(o => SKIN_AREAS[o.area])) {
      const a = SKIN_AREAS[o.area];
      ensure(40);
      font(10.5, "bold", K.ink); doc.text(a.label, L, y);
      font(8.5, "bold", o.level === "none" ? K.ok : o.level === "mild" ? K.brass : K.bad); doc.text(o.level.toUpperCase(), R, y, { align: "right" });
      y += 13; font(9.5, "normal", K.muted); y += text(o.note || "", L, y, Wd, 12.5);
      if (o.level !== "none") { font(9, "normal", K.brass); y += text(`Look for: ${a.ing.join(", ")} (${a.sku})`, L, y, Wd, 12.5); }
      y += 8;
    }
    if (d.skin.see_dermatologist) { font(10, "bold", K.bad); ensure(20); y += text("Some of what we see is worth showing a dermatologist.", L, y, Wd, 13); }
  }

  // ---------- Routine ----------
  section(`Your grooming routine · ${d.age}`, "Routine");
  ROUTINES[d.age].forEach((t, i) => {
    font(10, "normal");
    const rows: string[] = doc.splitTextToSize(t, Wd - 28);
    ensure(rows.length * 13.5 + 8);
    font(14, "bold", K.brass); doc.text(String(i + 1), L, y + 2);
    font(10, "normal", K.ink); rows.forEach((row, k) => doc.text(row, L + 24, y + k * 13.5));
    y += rows.length * 13.5 + 8;
  });

  // ---------- Invite ----------
  ensure(96); y += 14;
  doc.setFillColor(...K.dark); doc.roundedRect(L, y, Wd, 82, 10, 10, "F");
  font(8, "bold", K.brassL); doc.text("NORDMAN EARLY LIST", L + 18, y + 22);
  font(20, "bold", [236, 230, 218]); doc.text(d.code, L + 18, y + 50);
  font(9.5, "normal", [157, 149, 138]);
  doc.text(`Get ${REWARD.referralsNeeded} friends to scan with your code to unlock ${REWARD.label}.`, L + 18, y + 68);
  y += 96;

  footer();
  return doc.output("blob");
}
