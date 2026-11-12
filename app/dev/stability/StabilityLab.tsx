"use client";

import { useState } from "react";
import { detect, loadDetector } from "@/lib/detector";
import { analyseMeasures, shapeHeadline } from "@/lib/faceShape";
import { robustMeasures } from "@/lib/robust";
import { loadImage } from "@/lib/image";
import { checkQuality } from "@/lib/quality";

const DEFAULT = "leonard1.png leonard2.png leonard3.png raj1.png raj2.png raj3.png sheldon1.png sheldon2.png sheldon3.png howard1.png howard2.png howard3.png";

/* "Re-scan" variants: same photo, different framing and size, like scanning twice. */
const VARIANTS = [
  { pad: 0.4, scale: 1 }, { pad: 0.6, scale: 1 }, { pad: 0.9, scale: 1 },
  { pad: 0.4, scale: 1.6 }, { pad: 0.6, scale: 1.6 }, { pad: 0.9, scale: 1.6 },
];

function variant(img: HTMLImageElement, pad: number, scale: number) {
  const w = img.width * scale, h = img.height * scale, p = Math.round(w * pad);
  const c = document.createElement("canvas");
  c.width = Math.round(w + 2 * p); c.height = Math.round(h + 2 * p);
  const x = c.getContext("2d")!;
  x.fillStyle = "#808080"; x.fillRect(0, 0, c.width, c.height);
  x.drawImage(img, p, p, w, h);
  return c;
}

interface Row { file: string; primary: string[]; report: string[]; blocked: number }

export default function StabilityLab() {
  const [files, setFiles] = useState(DEFAULT);
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState("");

  async function run() {
    setRows([]); setStatus("Loading model…");
    await loadDetector();
    const out: Row[] = [];
    for (const f of files.split(/\s+/).filter(Boolean)) {
      setStatus(`Scanning ${f}…`);
      const img = await loadImage(`/_test/${f}`);
      const row: Row = { file: f, primary: [], report: [], blocked: 0 };
      for (const v of VARIANTS) {
        const c = variant(img, v.pad, v.scale);
        const d = await detect(c);
        if (d && checkQuality(c, d).blocking) row.blocked++;
        const r = d ? await robustMeasures(c, d) : null;
        const result = r && analyseMeasures(r.m, "none");
        row.primary.push(result?.key ?? "-");
        row.report.push(result ? shapeHeadline(result) : "-");
      }
      out.push(row); setRows([...out]);
    }
    setStatus("Done");
    (window as unknown as { __stab: Row[] }).__stab = out;
  }

  const flips = (a: string[]) => new Set(a.filter(s => s !== "-")).size;
  return (
    <div className="wrap" style={{ maxWidth: 900 }}>
      <h2>Stability lab</h2>
      <p className="small muted">Each photo is measured at six framings. The retake column counts failed quality gates. Both shape columns include all measurable variants so retakes cannot hide changes.</p>
      <textarea value={files} onChange={e => setFiles(e.target.value)} rows={3} style={{ width: "100%", font: "inherit", background: "var(--panel)", color: "var(--fg)" }} />
      <button className="primary" onClick={run}>Run</button>
      <p className="mono small" id="status">{status}</p>
      <table className="mono small" style={{ borderCollapse: "collapse" }}>
        <thead><tr><th align="left">Photo</th><th align="left">Top shape</th><th align="left">Report headline</th><th align="left">Retakes</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.file} style={{ borderTop: "1px solid var(--line)" }}>
              <td>{r.file}</td>
              <td>{flips(r.primary)} shape(s): {r.primary.join(" ")}</td>
              <td>{flips(r.report)} headline(s): {r.report.join(" / ")}</td>
              <td>{r.blocked}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
