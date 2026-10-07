import type { Detection } from "./detector";

/** Draw the photo with landmarks. `forResult` crops around the face and adds measurement lines. */
export function drawOverlay(canvas: HTMLCanvasElement, img: HTMLImageElement, det: Detection, forResult: boolean) {
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
  x.lineWidth = Math.max(1.5, canvas.width / 300); x.strokeStyle = brass; x.fillStyle = brass;
  x.beginPath(); P.slice(0, 17).forEach((p, i) => i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y)); x.stroke();
  P.forEach(p => { x.beginPath(); x.arc(p.x, p.y, x.lineWidth * 0.9, 0, 7); x.fill(); });
  if (forResult) {
    x.setLineDash([x.lineWidth * 4, x.lineWidth * 3]);
    [[1, 15], [4, 12], [17, 26]].forEach(([a, b]) => { x.beginPath(); x.moveTo(P[a].x, P[a].y); x.lineTo(P[b].x, P[b].y); x.stroke(); });
    x.setLineDash([]);
  }
}
