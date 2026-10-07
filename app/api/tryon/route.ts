/* AI try-on: shows the recommended haircut + beard on the user's own photo (OpenAI image edit).
   Privacy: the photo is held in memory for this one call only. It is never written to disk,
   never logged, and never stored by us. Opt-in per tap, with consent shown in the UI. */
import { CUTS, SHAPES, SHAPE_ORDER } from "@/lib/content";

export const maxDuration = 120;

const ALLOWED_CUTS = new Set(CUTS.map(c => c.n));
const ALLOWED_BEARDS = new Set([...SHAPE_ORDER.flatMap(k => SHAPES[k].beard.styles.map(s => s[0])), "Clean shave"]);
const MAX_BYTES = 2_500_000;

// Basic abuse protection (per server instance). Phase 6 replaces this with a shared store.
const hits = new Map<string, number[]>();
const LIMIT = 6, WINDOW_MS = 60 * 60 * 1000;
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  if (list.length >= LIMIT) { hits.set(ip, list); return true; }
  list.push(now); hits.set(ip, list);
  return false;
}

export async function GET() {
  return Response.json({ enabled: Boolean(process.env.OPENAI_API_KEY) });
}

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "not_configured" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  let body: { image?: string; cut?: string; beard?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }
  const { image, cut, beard } = body;
  if (typeof image !== "string" || !/^data:image\/(jpeg|png|webp);base64,/.test(image) || image.length > MAX_BYTES * 1.37)
    return Response.json({ error: "bad_image" }, { status: 400 });
  if (!cut || !ALLOWED_CUTS.has(cut) || !beard || !ALLOWED_BEARDS.has(beard))
    return Response.json({ error: "bad_style" }, { status: 400 });

  const beardLine = beard === "Clean shave" ? "Make him clean-shaven." : `Give him a neatly groomed "${beard}" beard style.`;
  const prompt = [
    "Edit this selfie of an adult man to preview a new haircut and beard, like a barber's reference photo.",
    `Change his hair to a "${cut}" haircut. ${beardLine}`,
    "Keep everything else exactly the same: his face, identity, facial features, skin tone and skin colour, expression, eyes, clothes, background, lighting and camera angle.",
    "Do not lighten or change his skin, do not beautify or slim the face. Photorealistic, natural hair texture, front view.",
  ].join(" ");

  try {
    const r = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
        images: [{ image_url: image }],
        prompt,
        size: "1024x1536",
        quality: "medium",
        output_format: "jpeg",
        output_compression: 85,
        n: 1,
      }),
      signal: AbortSignal.timeout(110_000),
    });
    if (!r.ok) {
      console.error("tryon: OpenAI error", r.status); // status only, never the image
      return Response.json({ error: r.status === 429 ? "rate_limited" : "upstream" }, { status: 502 });
    }
    const out = await r.json();
    const b64 = out?.data?.[0]?.b64_json;
    if (!b64) return Response.json({ error: "upstream" }, { status: 502 });
    return Response.json({ image: `data:image/jpeg;base64,${b64}` }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("tryon: request failed");
    return Response.json({ error: "upstream" }, { status: 502 });
  } finally {
    body.image = undefined;
  }
}
