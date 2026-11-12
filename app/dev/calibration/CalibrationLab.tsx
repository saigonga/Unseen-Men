"use client";

import { useState } from "react";
import { detect, loadDetector } from "@/lib/detector";
import { loadImage } from "@/lib/image";
import { checkQuality } from "@/lib/quality";
import { robustMeasures } from "@/lib/robust";
import { calibrate, parseManifest } from "./calibrate";
import type { MeasuredParticipant } from "./calibrate";

const EXAMPLE = JSON.stringify([
  { id: "P001", split: "fit", shapes: ["oval", "round"], photos: [{ file: "P001-a.jpg", beard: "none" }] },
  { id: "P002", split: "fit", shapes: ["square"], photos: [{ file: "P002-a.jpg", beard: "stubble" }] },
  { id: "P003", split: "test", shapes: ["heart"], photos: [{ file: "P003-a.jpg", beard: "full" }, { file: "P003-b.jpg", beard: "full" }] },
], null, 2);

const percent = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;

export default function CalibrationLab() {
  const [manifest, setManifest] = useState(EXAMPLE);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [rejected, setRejected] = useState<string[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calibrate> | null>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    setRejected([]);
    setStatus("Reading manifest…");
    const skipped: string[] = [];
    try {
      const people = parseManifest(JSON.parse(manifest));
      if (!people.some(person => person.split === "fit") || !people.some(person => person.split === "test")) {
        throw new Error("Assign separate participants to the fit and test groups.");
      }
      const byName = new Map(files.map(file => [file.name, file]));
      if (byName.size !== files.length) throw new Error("Selected photos need unique filenames.");
      const missing = people.flatMap(person => person.photos).filter(photo => !byName.has(photo.file));
      if (missing.length) throw new Error(`Select these missing photos: ${missing.map(photo => photo.file).join(", ")}`);

      setStatus("Loading face detector…");
      await loadDetector();
      const measured: MeasuredParticipant[] = [];
      for (const person of people) {
        const samples: MeasuredParticipant["samples"] = [];
        setStatus(`Measuring ${person.id}…`);
        for (const photo of person.photos) {
          const url = URL.createObjectURL(byName.get(photo.file)!);
          try {
            const image = await loadImage(url).catch(() => null);
            const detection = image && await detect(image);
            if (!image || !detection) {
              skipped.push(`${photo.file} · ${image ? "No face found" : "Unreadable image"}`);
              continue;
            }
            const quality = checkQuality(image, detection);
            if (quality.blocking) {
              skipped.push(`${photo.file} · ${quality.blocking}`);
              continue;
            }
            const measurements = await robustMeasures(image, detection);
            if (measurements?.raw3D) samples.push({ raw: measurements.raw3D, beard: photo.beard });
            else skipped.push(`${photo.file} · MediaPipe mesh unavailable`);
          } finally {
            URL.revokeObjectURL(url);
          }
        }
        measured.push({ ...person, samples });
      }
      setResult(calibrate(measured));
      setStatus("Complete");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Calibration failed.");
    } finally {
      setRejected(skipped);
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 850, margin: "auto", padding: 24 }}>
      <h1>Face shape calibration</h1>
      <p>Use consented photos and barber labels. Give each person one ID and keep all of their photos in one group. Photos are read in this browser.</p>
      <p>Use at least 50 people across all six shapes, with two or three separate photos each. Label close cases with both shapes. Reserve a group of people for testing.</p>
      <label htmlFor="calibration-manifest">Participant manifest (JSON)</label>
      <textarea id="calibration-manifest" value={manifest} onChange={event => setManifest(event.target.value)}
        rows={12} spellCheck={false} disabled={busy} style={{ display: "block", width: "100%", fontFamily: "monospace", marginBottom: 16 }} />
      <label htmlFor="calibration-photos">Local photo files</label>
      <input id="calibration-photos" type="file" accept="image/*" multiple disabled={busy}
        onChange={event => setFiles(Array.from(event.target.files ?? []))} style={{ display: "block", marginBottom: 16 }} />
      <button type="button" disabled={busy || !files.length} onClick={run}>Run calibration</button>
      <p role="status">{status}</p>
      {result && (
        <section>
          <h2>Results on held-out participants</h2>
          <p>{result.fit} people used for fitting. {result.test} different people used for testing.</p>
          {(result.missingFitShapes.length > 0 || result.missingTestShapes.length > 0) && (
            <p>Missing shape labels in fit group: {result.missingFitShapes.join(", ") || "none"}. In test group: {result.missingTestShapes.join(", ") || "none"}.</p>
          )}
          <table style={{ width: "100%", textAlign: "left" }}>
            <thead><tr><th scope="col">Model</th><th scope="col">Top shape in barber label</th><th scope="col">Exact label or blend</th><th scope="col">Same top shape on repeats</th></tr></thead>
            <tbody>
              {(["current", "candidate"] as const).map(model => {
                const stats = result[model];
                return <tr key={model}>
                  <th scope="row">{model === "current" ? "Current" : "Candidate"}</th>
                  <td>{percent(stats.top1)}</td><td>{percent(stats.exact)}</td>
                  <td>{stats.repeatParticipants ? `${stats.consistent}/${stats.repeatParticipants} people` : "No repeat photos accepted"}</td>
                </tr>;
              })}
            </tbody>
          </table>
          <details>
            <summary>Candidate norms and offsets</summary>
            <p>Review the test results before applying these values to <code>lib/faceShape.config.ts</code>.</p>
            <pre>{JSON.stringify(result.config, null, 2)}</pre>
          </details>
        </section>
      )}
      {rejected.length > 0 && (
        <details>
          <summary>{rejected.length} photos skipped</summary>
          <ul>{rejected.map(message => <li key={message}>{message}</li>)}</ul>
        </details>
      )}
    </main>
  );
}
