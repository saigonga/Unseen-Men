import type { Detection } from "./detector";
import type { Pt } from "./geometry";

/** Key craniofacial mesh triangulation edges (indices into MediaPipe 478 mesh)
 *  for Lenskart-style 3D biometric structural visualization. */
const MESH_EDGES: readonly [number, number][] = [
  // Forehead & frontotemporal crown
  [10, 109], [109, 67], [67, 103], [103, 54], [54, 70],
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 300],
  [10, 151], [151, 9], [9, 8], [8, 168], [168, 6], [6, 197], [197, 195], [195, 5], [5, 4], [4, 1],
  // Zygomatic & midface structural struts
  [54, 127], [127, 234], [234, 93], [93, 132], [132, 58], [58, 172], [172, 150], [150, 149], [149, 148], [148, 152],
  [284, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397], [397, 379], [379, 378], [378, 377], [377, 152],
  // Cross-cheekbone & infraorbital triangulation
  [234, 116], [116, 123], [123, 50], [50, 205], [205, 58], [50, 1],
  [454, 345], [345, 352], [352, 280], [280, 425], [425, 288], [280, 1],
  // Chin & mandibular triangle
  [172, 136], [136, 152], [397, 365], [365, 152], [2, 152],
];

function drawCaliperLine(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, tickLen: number, dashed = true) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < 2) return;
  const nx = -dy / len;
  const ny = dx / len;

  if (dashed) ctx.setLineDash([tickLen * 1.1, tickLen * 0.8]);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Endpoint caliper ticks
  ctx.beginPath();
  ctx.moveTo(a.x - nx * tickLen, a.y - ny * tickLen);
  ctx.lineTo(a.x + nx * tickLen, a.y + ny * tickLen);
  ctx.moveTo(b.x - nx * tickLen, b.y - ny * tickLen);
  ctx.lineTo(b.x + nx * tickLen, b.y + ny * tickLen);
  ctx.stroke();
}

/** Draw the photo with landmarks. `forResult` crops around the face and adds measurement lines. */
export function drawOverlay(canvas: HTMLCanvasElement, img: HTMLImageElement, det: Detection, forResult: boolean, show478 = false) {
  const W = img.naturalWidth, H = img.naturalHeight;
  let sx = 0, sy = 0, sw = W, sh = H;
  if (forResult) {
    const b = det.box, pad = b.width * 0.55;
    sx = Math.max(0, b.x - pad); sy = Math.max(0, b.y - pad * 1.1);
    sw = Math.min(W - sx, b.width + pad * 2); sh = Math.min(H - sy, b.height + pad * 2.1);
  }
  const scale = Math.min(1, 900 / Math.max(sw, sh));
  canvas.width = Math.round(sw * scale); canvas.height = Math.round(sh * scale);
  const x = canvas.getContext("2d")!;
  x.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  const P = det.P.map(p => ({ x: (p.x - sx) * scale, y: (p.y - sy) * scale }));
  const brass = getComputedStyle(document.documentElement).getPropertyValue("--brass").trim() || "#c9a46a";
  const lw = Math.max(1.5, canvas.width / 300);

  if (det.P478 && det.P478.length >= 468) {
    const pts = det.P478.map(p => ({ x: (p.x - sx) * scale, y: (p.y - sy) * scale }));

    // Subtle 3D biometric triangulation edges
    x.save();
    x.lineWidth = lw * 0.65;
    x.strokeStyle = "rgba(201, 164, 106, 0.36)";
    x.beginPath();
    for (const [i, j] of MESH_EDGES) {
      if (pts[i] && pts[j]) {
        x.moveTo(pts[i].x, pts[i].y);
        x.lineTo(pts[j].x, pts[j].y);
      }
    }
    x.stroke();

    // Dense 478 mesh points (subtle in standard view, bright in debug show478)
    x.globalAlpha = show478 ? 0.55 : 0.24;
    x.fillStyle = show478 ? "#00ff88" : "#ffffff";
    const rDot = show478 ? lw * 0.55 : lw * 0.42;
    pts.forEach(p => { x.beginPath(); x.arc(p.x, p.y, rDot, 0, 7); x.fill(); });
    x.restore();
  }

  x.lineWidth = lw; x.strokeStyle = brass; x.fillStyle = brass;
  x.beginPath(); P.slice(0, 17).forEach((p, i) => i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y)); x.stroke();
  P.forEach(p => { x.beginPath(); x.arc(p.x, p.y, lw * 0.9, 0, 7); x.fill(); });

  if (forResult) {
    const tick = lw * 3.2;
    // Horizontal proportion calipers: Cheekbone (1-15), Jaw (4-12), Forehead (17-26)
    [[1, 15], [4, 12], [17, 26]].forEach(([a, b]) => {
      if (P[a] && P[b]) drawCaliperLine(x, P[a], P[b], tick, true);
    });
    // Vertical facial axis (trichion to menton when P478 is available)
    if (det.P478 && det.P478.length >= 468) {
      const top = { x: (det.P478[10].x - sx) * scale, y: (det.P478[10].y - sy) * scale };
      const bot = { x: (det.P478[152].x - sx) * scale, y: (det.P478[152].y - sy) * scale };
      x.save();
      x.strokeStyle = "rgba(255, 255, 255, 0.55)";
      x.lineWidth = lw * 0.85;
      drawCaliperLine(x, top, bot, tick, true);
      x.restore();
    }
  }
}

/** Real-time Lenskart-style 3D biometric AR overlay on the live camera canvas. */
export function drawLiveScannerHud(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  det: Detection | null,
  green: boolean,
  phase: string
) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return;
  if (canvas.width !== vw) canvas.width = vw;
  if (canvas.height !== vh) canvas.height = vh;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, vw, vh);
  if (!det) return;

  const lw = Math.max(1.5, vw / 340);
  const accent = green ? "#2ECF7F" : "#E0A526";
  const accentSoft = green ? "rgba(46, 207, 127, 0.32)" : "rgba(224, 165, 38, 0.28)";

  if (det.P478 && det.P478.length >= 468) {
    const pts = det.P478;
    // 1. 3D craniofacial triangulation struts
    ctx.save();
    ctx.lineWidth = lw * 0.7;
    ctx.strokeStyle = accentSoft;
    ctx.beginPath();
    for (const [i, j] of MESH_EDGES) {
      if (pts[i] && pts[j]) {
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
      }
    }
    ctx.stroke();

    // 2. Subtle 478-point biometric cloud
    ctx.fillStyle = green ? "rgba(46, 207, 127, 0.45)" : "rgba(255, 255, 255, 0.38)";
    const dotR = lw * 0.45;
    for (let i = 0; i < pts.length; i += 2) {
      const p = pts[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, dotR, 0, 7);
      ctx.fill();
    }

    // 3. Caliper measurement bars (Forehead 54-284, Cheekbone 234-454, Jaw 172-397, Vertical 10-152)
    ctx.strokeStyle = accent;
    ctx.lineWidth = lw * 0.95;
    const tick = lw * 3;
    drawCaliperLine(ctx, pts[54], pts[284], tick, true);
    drawCaliperLine(ctx, pts[234], pts[454], tick, true);
    drawCaliperLine(ctx, pts[172], pts[397], tick, true);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    drawCaliperLine(ctx, pts[10], pts[152], tick, true);
    ctx.restore();
  }

  // 4. Primary 68-point jawline contour & anchor nodes
  const P = det.P;
  if (P && P.length >= 68) {
    ctx.save();
    ctx.lineWidth = phase === "sweep" ? lw * 1.45 : lw * 1.1;
    ctx.strokeStyle = accent;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    P.slice(0, 17).forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();

    // Highlight key anthropometric landmarks (gonions, cheekbones, chin, brow peaks)
    const keyIdx = [1, 4, 6, 8, 10, 12, 15, 17, 19, 24, 26, 30];
    for (const idx of keyIdx) {
      const p = P[idx];
      if (!p) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, lw * 1.5, 0, 7);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, lw * 0.7, 0, 7);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    }
    ctx.restore();
  }
}
