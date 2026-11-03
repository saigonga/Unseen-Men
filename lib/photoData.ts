/**
 * Converts a photo object (Image element or Blob/Data URL) to a base64 JPEG data URL.
 * Works reliably across desktop and mobile browsers.
 */
export async function getPhotoDataUrl(photo?: { img?: HTMLImageElement | null; url?: string | null } | null): Promise<string | null> {
  if (!photo) return null;

  // 1. If already a data URL
  if (photo.url && photo.url.startsWith("data:image/")) {
    return photo.url;
  }

  // 2. Try drawing from HTMLImageElement if available and loaded
  if (photo.img) {
    try {
      const img = photo.img;
      const nw = img.naturalWidth || img.width;
      const nh = img.naturalHeight || img.height;
      if (nw > 0 && nh > 0) {
        const c = document.createElement("canvas");
        const maxW = 900;
        const scale = nw > maxW ? maxW / nw : 1;
        c.width = Math.round(nw * scale);
        c.height = Math.round(nh * scale);
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0, c.width, c.height);
          const dataUrl = c.toDataURL("image/jpeg", 0.85);
          if (dataUrl && dataUrl.startsWith("data:image/")) {
            return dataUrl;
          }
        }
      }
    } catch {
      // Fall through to blob conversion
    }
  }

  // 3. Fallback: Fetch the blob from blob: URL and read via FileReader
  if (photo.url && (photo.url.startsWith("blob:") || photo.url.startsWith("http"))) {
    try {
      const resp = await fetch(photo.url);
      const blob = await resp.blob();
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result;
          if (typeof res === "string" && res.startsWith("data:image/")) {
            resolve(res);
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  return null;
}
