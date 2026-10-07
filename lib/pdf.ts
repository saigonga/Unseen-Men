/* Full private PDF report (jsPDF, generated on the device). */
import { SHAPES, SKIN_AREAS, ROUTINES, REWARD } from "./content";
import type { AgeBracket } from "./content";
import type { FaceResult } from "./faceShape";
import type { SkinRead } from "./skin";

type JsPDFModule = typeof import("jspdf");
let mod: Promise<JsPDFModule> | null = null;
/** Start loading jsPDF early so the download tap stays fast. */
export const preloadPdf = () => (mod ??= import("jspdf"));

export interface PdfData {
  name: string;
  age: AgeBracket;
  result: FaceResult;
  skin: SkinRead | null;
  code: string;
  faceImage: HTMLCanvasElement | null;
}

export async function buildPdf(d: PdfData): Promise<Blob> {
  const { jsPDF } = await preloadPdf();
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const sh = SHAPES[d.result.key], m = d.result.m;
  let y = 56; const L = 48, Wd = 499;
  const line = (t: string, size = 11, style = "normal", color: [number, number, number] = [30, 28, 25]) => {
    doc.setFont("helvetica", style); doc.setFontSize(size); doc.setTextColor(...color);
    const rows: string[] = doc.splitTextToSize(t, Wd);
    rows.forEach(r => { if (y > 790) { doc.addPage(); y = 56; } doc.text(r, L, y); y += size * 1.4; });
  };
  const gap = (n = 10) => { y += n; };
  const grey: [number, number, number] = [108, 101, 91];

  line("UNSEEN MEN · FACE SCAN REPORT", 9, "bold", [138, 101, 38]);
  line(`Prepared for ${d.name || "you"} · age ${d.age}`, 10, "normal", grey); gap(6);
  line(`Face shape: ${sh.name}`, 22, "bold"); line(sh.desc); gap(4);
  line(`Measurements — length/width ${m.R.toFixed(2)}, jaw/cheekbones ${m.J.toFixed(2)}, brow/cheekbones ${m.F.toFixed(2)}, chin/cheekbones ${m.K.toFixed(2)}, jaw angle ${m.G.toFixed(0)}°`, 9, "normal", grey);
  if (d.faceImage && d.faceImage.width) {
    try {
      const img = d.faceImage.toDataURL("image/jpeg", 0.8);
      const h = 200, w = h * d.faceImage.width / d.faceImage.height;
      gap(4); doc.addImage(img, "JPEG", L, y, w, h); y += h + 14;
    } catch { /* skip image */ }
  }
  line("What sets your face apart", 14, "bold");
  line(d.result.traits.length ? d.result.traits.map(t => t.label).join(", ") : "Balanced proportions; nothing stands out strongly."); gap();
  line("Best cuts for you", 14, "bold"); d.result.cuts.forEach((c, i) => line(`${i + 1}. ${c.n} — ${c.why}`)); gap();
  line("Cuts to avoid", 14, "bold"); d.result.avoid.forEach(([n, w]) => line(`• ${n} — ${w}`)); gap();
  line(`Beard verdict: ${sh.beard.v}`, 14, "bold"); line(sh.beard.text);
  d.result.beardTweaks.forEach(b => line("• " + b));
  sh.beard.styles.forEach(([n, w]) => line(`• ${n} — ${w}`)); gap();
  if (d.skin) {
    line("Skin read", 14, "bold");
    d.skin.observations.filter(o => SKIN_AREAS[o.area]).forEach(o => {
      const a = SKIN_AREAS[o.area];
      line(`${a.label}: ${o.level}. ${o.note || ""}`);
      if (o.level !== "none") line(`   Look for: ${a.ing.join(", ")}  (${a.sku})`, 10, "normal", grey);
    });
    if (d.skin.see_dermatologist) line("Some of what we see is worth showing a dermatologist.", 11, "bold", [168, 64, 44]);
    line("Grooming guidance, not medical advice.", 9, "italic", grey); gap();
  }
  line(`Your routine (${d.age})`, 14, "bold"); ROUTINES[d.age].forEach((r, i) => line(`${i + 1}. ${r}`)); gap();
  line(`Your Nordman invite code: ${d.code}`, 12, "bold", [138, 101, 38]);
  line(`Get ${REWARD.referralsNeeded} friends to scan with your code to unlock your launch discount.`, 10);
  return doc.output("blob");
}
