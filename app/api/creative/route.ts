import { NextResponse } from "next/server";

export const maxDuration = 60; // Allow sufficient time for server-side polling on Vercel Fluid compute

interface HiggsfieldRequestBody {
  photoUrl?: string;
  photoBase64?: string;
  faceShape?: string;
  cutName?: string;
  userName?: string;
  stylePreset?: "nordman_editorial" | "gq_cover" | "studio_cinematic";
  customPrompt?: string;
  resolution?: "2K" | "4K";
  aspectRatio?: "4:5" | "1:1" | "9:16" | "16:9";
}

function getHiggsfieldAuthHeader(clientKey?: string | null): string | null {
  const rawKey =
    clientKey?.trim() ||
    process.env.HIGGSFIELD_API_KEY?.trim() ||
    (process.env.HF_API_KEY_ID && process.env.HF_API_KEY_SECRET
      ? `${process.env.HF_API_KEY_ID.trim()}:${process.env.HF_API_KEY_SECRET.trim()}`
      : null);

  if (!rawKey) return null;

  if (rawKey.startsWith("Key ") || rawKey.startsWith("Bearer ")) {
    return rawKey;
  }

  // Higgsfield format: "Key <key-id>:<key-secret>"
  return `Key ${rawKey}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get("requestId");
  const clientKey = req.headers.get("x-higgsfield-key");
  const authHeader = getHiggsfieldAuthHeader(clientKey);

  // If requestId is provided, poll status for the client
  if (requestId) {
    if (!authHeader) {
      return NextResponse.json({ ok: false, error: "not_configured" }, { status: 401 });
    }

    try {
      const statusRes = await fetch(`https://api.higgsfield.ai/requests/${requestId}/status`, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (!statusRes.ok) {
        const errText = await statusRes.text();
        return NextResponse.json(
          { ok: false, error: `Higgsfield status check failed: ${errText}` },
          { status: statusRes.status }
        );
      }

      const statusData = await statusRes.json();
      const isCompleted = statusData.status === "completed";
      const isFailed = statusData.status === "failed" || statusData.status === "nsfw" || statusData.status === "canceled";

      return NextResponse.json({
        ok: true,
        status: statusData.status,
        imageUrl: isCompleted ? statusData.images?.[0]?.url || statusData.video_url || null : null,
        failed: isFailed,
        data: statusData,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
  }

  // Otherwise, return whether Higgsfield is configured
  return NextResponse.json({
    ok: true,
    configured: Boolean(authHeader),
    provider: "higgsfield",
    models: ["higgsfield-ai/soul/standard", "higgsfield/genjutsu/restyle/v1.0"],
  });
}

export async function POST(req: Request) {
  const clientKey = req.headers.get("x-higgsfield-key");
  const authHeader = getHiggsfieldAuthHeader(clientKey);

  if (!authHeader) {
    return NextResponse.json(
      {
        ok: false,
        error: "not_configured",
        message:
          "Higgsfield API key is not configured. Please add HIGGSFIELD_API_KEY in .env.local or enter it in the studio.",
      },
      { status: 503 }
    );
  }

  let body: HiggsfieldRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const {
    photoUrl,
    faceShape = "Oval",
    cutName = "Textured Crop",
    userName = "Founding Member",
    stylePreset = "nordman_editorial",
    customPrompt,
    resolution = "2K",
    aspectRatio = "4:5",
  } = body;

  const presets: Record<string, string> = {
    nordman_editorial: `Luxury high-fashion grooming campaign portrait of an Indian gentleman named ${userName}, ${faceShape} face shape, wearing a tailored dark espresso collar, precision ${cutName} haircut, clean groomed beard silhouette, soft dramatic Nordic rim lighting, 8k resolution, photorealistic, cinematic depth of field, minimalist warm studio background.`,
    gq_cover: `GQ magazine style cover portrait of an Indian gentleman, ${faceShape} face shape, sharp ${cutName} haircut, sophisticated confident expression, crisp studio lighting, high-end editorial styling, photorealistic, 8k.`,
    studio_cinematic: `Cinematic 35mm film still of an Indian man, ${faceShape} face shape, tailored styling, precision groomed ${cutName} hair, golden hour ambient rim light, deep cinematic contrast, photorealistic, 4k.`,
  };

  const finalPrompt = customPrompt?.trim() || presets[stylePreset] || presets.nordman_editorial;
  const endpoint =
    process.env.HIGGSFIELD_MODEL_ENDPOINT || "https://api.higgsfield.ai/higgsfield-ai/soul/standard";

  const idempotencyKey = crypto.randomUUID();

  const payload: Record<string, unknown> = {
    prompt: finalPrompt,
    num_images: 1,
    resolution: resolution,
    aspect_ratio: aspectRatio,
  };

  // If public photo URL is available, include as reference
  if (photoUrl && photoUrl.startsWith("http")) {
    payload.image_url = photoUrl;
    payload.image_urls = [photoUrl];
  }

  try {
    const submitRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.error("[Higgsfield API Submit Error]:", submitRes.status, errText);
      return NextResponse.json(
        {
          ok: false,
          error: "higgsfield_api_error",
          status: submitRes.status,
          message: errText,
        },
        { status: submitRes.status }
      );
    }

    const submitData = await submitRes.json();
    const requestId = submitData.request_id;
    const statusUrl = submitData.status_url || `https://api.higgsfield.ai/requests/${requestId}/status`;

    // If it completed immediately (synchronous or cached)
    if (submitData.status === "completed" && submitData.images?.[0]?.url) {
      return NextResponse.json({
        ok: true,
        status: "completed",
        imageUrl: submitData.images[0].url,
        requestId,
      });
    }

    // Server-side polling loop (up to 30s with backoff)
    const startTime = Date.now();
    const maxPollTimeMs = 32_000;
    let delayMs = 1500;

    while (Date.now() - startTime < maxPollTimeMs) {
      await new Promise((r) => setTimeout(r, delayMs));

      const pollRes = await fetch(statusUrl, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (pollRes.ok) {
        const pollData = await pollRes.json();

        if (pollData.status === "completed") {
          const finalUrl = pollData.images?.[0]?.url || pollData.video_url || null;
          return NextResponse.json({
            ok: true,
            status: "completed",
            imageUrl: finalUrl,
            requestId,
          });
        }

        if (pollData.status === "failed" || pollData.status === "nsfw" || pollData.status === "canceled") {
          return NextResponse.json(
            {
              ok: false,
              status: pollData.status,
              error: `Higgsfield generation ${pollData.status}`,
              details: pollData,
            },
            { status: 422 }
          );
        }
      }

      // Exponential backoff up to 3s
      delayMs = Math.min(delayMs * 1.3, 3000);
    }

    // If still in progress after 32s, hand over requestId to frontend to continue polling
    return NextResponse.json({
      ok: true,
      status: "queued",
      requestId,
      statusUrl,
      message: "Creative generation in progress. Polling in background.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error during Higgsfield call";
    console.error("[Creative Generation Exception]:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
