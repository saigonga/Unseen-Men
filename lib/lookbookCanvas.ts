import type { Detection } from "./detector";
import { cropFaceMapped } from "./crop";
import { avgPts, dist, mid } from "./geometry";
import type { Pt } from "./geometry";
import { getLookAssets, lookTitle } from "./lookbook";
import type { BeardAsset, FrameAsset, Look } from "./lookbook";

function drawGlasses(ctx: CanvasRenderingContext2D, left: Pt, right: Pt, bridge: Pt, asset: FrameAsset) {
  const width = dist(left, right);
  const angle = Math.atan2(right.y - left.y, right.x - left.x);
  const shapes = {
    rectangle: "M-72 -35 Q-77 -34 -77 -25 L-73 21 Q-72 31 -61 33 L58 33 Q71 32 73 21 L76 -25 Q76 -35 63 -35 Z",
    round: "M-67 0 A67 52 0 1 0 67 0 A67 52 0 1 0 -67 0 Z",
    browline: "M-78 -38 Q-8 -47 74 -32 L65 18 Q55 47 0 45 Q-62 46 -71 17 Z",
    navigator: "M-79 -36 L76 -36 L64 24 Q61 42 34 45 L-35 44 Q-66 43 -70 24 Z",
    geometric: "M-74 -14 L-44 -42 L49 -42 L73 -16 L56 34 L-48 41 L-71 20 Z",
    oval: "M-73 0 A73 39 0 1 0 73 0 A73 39 0 1 0 -73 0 Z",
    wayfarer: "M-79 -37 Q-5 -49 75 -34 L59 29 Q50 46 -3 44 Q-59 44 -65 28 Z",
    aviator: "M-77 -32 Q-28 -50 71 -27 Q79 -15 65 18 Q45 62 7 53 Q-53 49 -77 -12 Z",
  };
  const scale = width / 176;
  ctx.save();
  ctx.translate(bridge.x, (left.y + right.y) / 2 + (bridge.y - (left.y + right.y) / 2) * 0.34);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = asset.finish;
  ctx.shadowColor = "rgba(24,16,12,.35)";
  ctx.shadowBlur = 5;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-22, -9);
  ctx.quadraticCurveTo(0, -28, 22, -9);
  ctx.moveTo(-159, -13);
  ctx.lineTo(-172, -18);
  ctx.moveTo(159, -13);
  ctx.lineTo(172, -18);
  ctx.stroke();
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 88, 0);
    ctx.scale(side, 1);
    const path = new Path2D(shapes[asset.shape]);
    const tint = ctx.createLinearGradient(-40, -46, 35, 48);
    tint.addColorStop(0, asset.sun ? "rgba(20,26,24,.95)" : "rgba(235,246,246,.22)");
    tint.addColorStop(1, asset.sun ? "rgba(77,64,45,.76)" : "rgba(223,237,237,.05)");
    ctx.fillStyle = tint;
    ctx.fill(path);
    ctx.stroke(path);
    ctx.shadowBlur = 0;
    ctx.translate(0, 1);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,.32)";
    ctx.stroke(path);
    ctx.restore();
  }
  ctx.restore();
}

function drawBeard(ctx: CanvasRenderingContext2D, points: Pt[], asset: BeardAsset) {
  const jaw = points.slice(2, 15);
  const chin = points[8];
  const mouth = mid(points[48], points[54]);
  const width = dist(jaw[0], jaw[12]);
  const curve = new Path2D();
  if (asset.style === "goatee") {
    const half = width * asset.width * 0.45;
    curve.moveTo(mouth.x - half, mouth.y + width * 0.07);
    curve.quadraticCurveTo(chin.x, mouth.y + width * 0.20, mouth.x + half, mouth.y + width * 0.07);
    curve.quadraticCurveTo(chin.x + half, chin.y + width * 0.13, chin.x, chin.y + width * asset.length);
    curve.quadraticCurveTo(chin.x - half, chin.y + width * 0.13, mouth.x - half, mouth.y + width * 0.07);
  } else {
    curve.moveTo(jaw[0].x, jaw[0].y);
    const outline = jaw.map((point, i) => ({
      x: chin.x + (point.x - chin.x) * asset.width,
      y: point.y + width * asset.length * Math.sin(i * Math.PI / 12) ** (asset.style === "boxed" ? 0.8 : 1.7),
    }));
    for (const point of outline) curve.lineTo(point.x, point.y);
    const upper = asset.style === "strap" ? chin.y - width * 0.02 : mouth.y + width * 0.12;
    curve.quadraticCurveTo(mouth.x, upper + width * 0.13, jaw[0].x, jaw[0].y);
  }
  curve.closePath();
  ctx.save();
  ctx.fillStyle = asset.style === "stubble" ? "rgba(39,28,23,.30)" : "rgba(39,28,23,.62)";
  ctx.fill(curve);
  ctx.clip(curve);
  ctx.strokeStyle = "rgba(24,17,15,.40)";
  ctx.lineWidth = Math.max(0.7, width / 300);
  ctx.beginPath();
  for (let i = 0; i < 530; i++) {
    const x = chin.x + (Math.sin(i * 71.29) * 0.5) * width * 1.1;
    const y = jaw[0].y + (0.5 + Math.sin(i * 117.23) * 0.5) * width;
    ctx.moveTo(x, y);
    ctx.lineTo(x + (x - chin.x) * 0.012, y + width * 0.016);
  }
  ctx.stroke();
  ctx.restore();
}

function drawHair(ctx: CanvasRenderingContext2D, left: Pt, right: Pt, top: Pt, height: number, profile: number) {
  const width = dist(left, right);
  const centre = mid(left, right);
  const tilt = Math.atan2(right.y - left.y, right.x - left.x);
  const lift = height * 91;
  const sweep = [-14, -27, 0, 19, -29, -7, 0, 0, -22, 16, 20, 0, -5, 11][profile];
  ctx.save();
  ctx.translate(top.x * 0.8 + centre.x * 0.2, top.y);
  ctx.rotate(tilt);
  ctx.scale(width / 152, width / 152);
  const outline = new Path2D();
  const fringe = [4, 5, 11, 13].includes(profile) ? 18 : 5;
  outline.moveTo(-83, 33);
  outline.bezierCurveTo(-87, -13, -78, -lift * 0.76, -42 + sweep * 0.3, -lift * 0.87);
  outline.bezierCurveTo(-14 + sweep, -lift * 1.24, 44 + sweep, -lift * 1.04, 74, -lift * 0.42);
  outline.quadraticCurveTo(86, 0, 81, 33);
  outline.quadraticCurveTo(65, fringe, 42, fringe * 0.8);
  outline.quadraticCurveTo(sweep, fringe - 13, -39, fringe * 0.65);
  outline.quadraticCurveTo(-68, fringe + 1, -83, 33);
  const shade = ctx.createLinearGradient(-51, -lift, 47, 26);
  shade.addColorStop(0, "#3c2d25");
  shade.addColorStop(0.5, "#261b16");
  shade.addColorStop(1, "#151111");
  ctx.fillStyle = shade;
  ctx.fill(outline);
  ctx.clip(outline);
  ctx.strokeStyle = "rgba(176,137,105,.27)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 34; i++) {
    const x = -94 + i * 5.6;
    const bend = profile === 11 ? (x > 0 ? 34 : -34) : sweep;
    ctx.beginPath();
    ctx.moveTo(x - bend * 0.7, 30);
    ctx.quadraticCurveTo(x + bend, -lift * 0.66, x + bend * 0.5, -lift * 1.1);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawLookCard(canvas: HTMLCanvasElement, image: HTMLImageElement, det: Detection, look: Look) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("The preview canvas is unavailable.");
  canvas.width = 640;
  canvas.height = 800;
  const { frame, hair, beard } = getLookAssets(look);
  const portrait = cropFaceMapped(image, det.box, { aspect: 1, padX: 0.30, padTop: 0.52, padBottom: 0.19, max: 900 });
  const scale = 640 / portrait.canvas.width;
  const map = (point: Pt) => {
    const mapped = portrait.map(point);
    return { x: mapped.x * scale, y: mapped.y * scale };
  };
  const points = det.P.map(map);
  const left = avgPts(points.slice(36, 42));
  const right = avgPts(points.slice(42, 48));

  ctx.fillStyle = "#17120f";
  ctx.fillRect(0, 0, 640, 800);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 640, 640);
  ctx.clip();
  ctx.drawImage(portrait.canvas, 0, 0, 640, 640);
  if (hair) {
    const top = det.P478 ? map(det.P478[10]) : { x: (left.x + right.x) / 2, y: left.y - dist(left, right) * 0.52 };
    const templeL = det.P478 ? map(det.P478[54]) : points[0];
    const templeR = det.P478 ? map(det.P478[284]) : points[16];
    drawHair(ctx, templeL, templeR, top, hair.height, hair.profile);
  }
  if (beard) drawBeard(ctx, points, beard);
  if (frame) drawGlasses(ctx, left, right, points[27], frame);
  ctx.restore();

  ctx.fillStyle = "#d8af7d";
  ctx.fillRect(32, 668, 42, 2);
  ctx.font = "500 14px monospace";
  ctx.fillText("NODD MEN / PERSONAL LOOKBOOK", 32, 699);
  ctx.font = "600 32px system-ui";
  ctx.fillStyle = "#fff8ef";
  ctx.fillText(lookTitle(look), 32, 743, 576);
  ctx.fillStyle = "#d8c3b3";
  ctx.font = "400 16px system-ui";
  const details = [frame?.name, hair?.name, beard?.name].filter(Boolean);
  ctx.fillText(details.length > 1 ? details.join(" · ") : hair || beard ? "Stylized preview" : "Eyewear preview", 32, 773, 576);
}
