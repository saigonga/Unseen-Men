import type { Box, Pt } from "./geometry";

export interface Crop { canvas: HTMLCanvasElement; map: (p: Pt) => Pt }

/** Crop around the face (head and a little shoulder), scaled to fit `max` px. */
export function cropFaceMapped(img: CanvasImageSource & { naturalWidth?: number; naturalHeight?: number; width: number; height: number }, box: Box,
  opts: { padX?: number; padTop?: number; padBottom?: number; max?: number; aspect?: number } = {}): Crop {
  const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
  const { padX = 0.75, padTop = 0.9, padBottom = 0.7, max = 1024, aspect } = opts;
  let sx = box.x - box.width * padX, sw = box.width * (1 + 2 * padX);
  let sy = box.y - box.height * padTop, sh = box.height * (1 + padTop + padBottom);
  if (aspect) { // force width/height ratio around the face centre
    const cx = sx + sw / 2, cy = sy + sh / 2;
    if (sw / sh > aspect) sh = sw / aspect; else sw = sh * aspect;
    if (sw > W) { sw = W; sh = sw / aspect; }
    if (sh > H) { sh = H; sw = sh * aspect; }
    sx = cx - sw / 2; sy = cy - sh / 2;
  }
  sw = Math.min(sw, W); sh = Math.min(sh, H);
  sx = Math.max(0, Math.min(W - sw, sx)); sy = Math.max(0, Math.min(H - sh, sy));
  const sc = Math.min(1, max / Math.max(sw, sh));
  const c = document.createElement("canvas");
  c.width = Math.round(sw * sc); c.height = Math.round(sh * sc);
  c.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return { canvas: c, map: p => ({ x: (p.x - sx) * sc, y: (p.y - sy) * sc }) };
}

export const cropFace = (img: HTMLImageElement, box: Box, opts?: Parameters<typeof cropFaceMapped>[2]) =>
  cropFaceMapped(img, box, opts).canvas;
