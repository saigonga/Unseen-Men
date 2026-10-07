// One-off: pulls the face-api weights bundled inside face-scan.html into public/models,
// and copies the face-api browser build into public/vendor. Run with `npm run models`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "face-scan.html"), "utf8");
const line = html.split("\n").find(l => l.startsWith("<script>window.FACE_MODELS="));
if (!line) throw new Error("FACE_MODELS not found in face-scan.html");
const models = JSON.parse(line.replace(/^<script>window\.FACE_MODELS=/, "").replace(/;?<\/script>\s*$/, ""));

const outDir = path.join(root, "public", "models");
fs.mkdirSync(outDir, { recursive: true });
for (const [name, m] of Object.entries(models)) {
  fs.writeFileSync(path.join(outDir, `${name}.bin`), Buffer.from(m.b64, "base64"));
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(m.manifest));
  console.log(`models/${name}.bin + .json`);
}

const vendorDir = path.join(root, "public", "vendor");
fs.mkdirSync(vendorDir, { recursive: true });
fs.copyFileSync(path.join(root, "node_modules/@vladmandic/face-api/dist/face-api.js"), path.join(vendorDir, "face-api.js"));
console.log("vendor/face-api.js");
