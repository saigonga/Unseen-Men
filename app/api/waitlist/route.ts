import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase";
import { checkIndianMobile, isEmail } from "@/lib/phone";

const ABC = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_RE = /^UM-[A-HJ-KM-NP-Z2-9]{4}$/;

function generateReferralCode(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return "UM-" + Array.from(bytes, (b) => ABC[b % ABC.length]).join("");
}

/** Upload captured selfie and full face-analysis JSON to Supabase Storage `scans` bucket. */
async function uploadScanAssets(
  supabase: SupabaseClient,
  referralCode: string,
  photoBase64: string | null,
  faceDataRecord: Record<string, unknown> | null
): Promise<{ photoUrl: string | null; faceDataUrl: string | null }> {
  let photoUrl: string | null = null;
  let faceDataUrl: string | null = null;

  if (photoBase64 && photoBase64.includes("base64")) {
    try {
      const cleanBase64 = photoBase64.includes(",") ? photoBase64.split(",")[1] : photoBase64;
      const buffer = Buffer.from(cleanBase64, "base64");
      const mime = photoBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg";
      const ext = mime === "image/png" ? "png" : "jpg";
      const fileName = `${referralCode}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("scans")
        .upload(fileName, buffer, { contentType: mime, upsert: true });

      if (!uploadError) {
        const { data: pubData } = supabase.storage.from("scans").getPublicUrl(fileName);
        photoUrl = pubData?.publicUrl || null;
      } else {
        console.warn("Storage photo upload warning:", uploadError.message);
      }
    } catch (photoErr) {
      console.warn("Failed to process photo upload:", photoErr);
    }
  }

  if (faceDataRecord) {
    try {
      const jsonName = `${referralCode}_face_data.json`;
      const { error: jsonErr } = await supabase.storage
        .from("scans")
        .upload(jsonName, Buffer.from(JSON.stringify(faceDataRecord, null, 2), "utf8"), {
          contentType: "application/json",
          upsert: true,
        });

      if (!jsonErr) {
        const { data: pubJson } = supabase.storage.from("scans").getPublicUrl(jsonName);
        faceDataUrl = pubJson?.publicUrl || null;
      } else {
        console.warn("Storage face_data JSON warning:", jsonErr.message);
      }
    } catch (jsonErr) {
      console.warn("Failed to upload face_data JSON:", jsonErr);
    }
  }

  return { photoUrl, faceDataUrl };
}

/** Encode complete summary into skin_concern if optional schema columns are absent. */
function buildFallbackSkinConcern(
  skinConcern: string | null,
  rawEmail: string,
  beard: string | null,
  faceData: Record<string, unknown> | null,
  faceDataUrl: string | null
): string | null {
  const parts: string[] = [];
  if (skinConcern) parts.push(skinConcern);
  if (rawEmail) parts.push(`email:${rawEmail}`);
  if (beard) parts.push(`beard:${beard}`);
  if (faceData) {
    const m = (faceData.measurements || {}) as Record<string, unknown>;
    const t = (faceData.facialThirds || {}) as Record<string, unknown>;
    const summary = [
      faceData.confidencePct != null ? `${faceData.confidencePct}%` : "",
      m.lengthToWidth != null ? `L:W=${m.lengthToWidth}` : "",
      m.jawToCheek != null ? `J:C=${m.jawToCheek}` : "",
      m.jawAngleDeg != null ? `ang=${m.jawAngleDeg}` : "",
      t.upperPct != null ? `3rds=${t.upperPct}/${t.midPct}/${t.lowerPct}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    if (summary) parts.push(`metrics:[${summary}]`);
  }
  if (faceDataUrl) parts.push(`face_json:${faceDataUrl}`);
  return parts.length ? parts.join(" | ") : null;
}

/** Persist waitlist row, stripping missing optional columns cleanly if schema hasn't migrated yet. */
async function writeWaitlistWithFallback(
  supabase: SupabaseClient,
  mode: "insert" | "update",
  payload: Record<string, unknown>,
  fallbackConcern: string | null,
  rowId?: string
) {
  const exec = (data: Record<string, unknown>) =>
    mode === "insert"
      ? supabase.from("waitlist").insert(data)
      : supabase.from("waitlist").update(data).eq("id", rowId!);

  const first = await exec(payload);
  if (!first.error) return first;

  const fallback = { ...payload };
  delete fallback.email;
  delete fallback.beard;
  delete fallback.face_data;
  if (first.error.message?.includes("photo_url")) {
    delete fallback.photo_url;
  }
  if (fallbackConcern) {
    fallback.skin_concern = fallbackConcern;
  }

  return exec(fallback);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawName = String(body.name || "").trim().replace(/\s+/g, " ");
    const rawContact = String(body.contact || body.phone || "").trim();
    const rawPhone = String(body.phone || body.contact || "").trim();
    const rawEmail = String(body.email || "").trim().toLowerCase();
    const ageBracket = body.ageBracket ? String(body.ageBracket) : null;
    const faceShape = body.faceShape ? String(body.faceShape) : null;
    const skinConcern = body.skinConcern ? String(body.skinConcern) : null;
    const beard = body.beard ? String(body.beard) : null;
    const stylingData = body.styling || null;
    const faceData =
      body.faceData && typeof body.faceData === "object"
        ? (body.faceData as Record<string, unknown>)
        : stylingData && typeof stylingData === "object"
          ? { facialThirds: stylingData.facialThirds, faceShape }
          : null;
    const skipPhotoIfPresent = Boolean(body.skipPhotoIfPresent);
    const requestedMemberNumber = body.memberNumber ? parseInt(String(body.memberNumber), 10) : null;
    let referredBy = body.referredBy ? String(body.referredBy).trim().toUpperCase() : null;

    if (!rawName || rawName.length < 2) {
      return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
    }

    // Normalize contact: either validated email or validated Indian phone
    let normalizedContact = "";
    let prettyContact = "";

    if (rawPhone && !rawPhone.includes("@")) {
      const phoneCheck = checkIndianMobile(rawPhone);
      if (!phoneCheck.ok) {
        return NextResponse.json({ ok: false, error: phoneCheck.error }, { status: 400 });
      }
      normalizedContact = phoneCheck.e164;
      prettyContact = phoneCheck.pretty;
    } else if (rawContact.includes("@") || rawEmail) {
      const em = rawEmail || rawContact;
      if (!isEmail(em)) {
        return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
      }
      normalizedContact = em.toLowerCase();
      prettyContact = normalizedContact;
    } else {
      const phoneCheck = checkIndianMobile(rawContact);
      if (!phoneCheck.ok) {
        return NextResponse.json({ ok: false, error: phoneCheck.error }, { status: 400 });
      }
      normalizedContact = phoneCheck.e164;
      prettyContact = phoneCheck.pretty;
    }

    const supabase = getSupabaseServerClient();

    // 1. Check if contact already exists
    const { data: existing, error: existingErr } = await supabase
      .from("waitlist")
      .select("id, name, contact, member_number, referral_code, referral_count, created_at, photo_url")
      .eq("contact", normalizedContact)
      .maybeSingle();

    if (existingErr) {
      console.error("Waitlist lookup error:", existingErr);
      return NextResponse.json({ ok: false, error: "Database error during lookup." }, { status: 500 });
    }

    const photoBase64 = body.photoBase64 ? String(body.photoBase64) : null;

    if (existing) {
      // When starting a new scan before faceData is submitted, read prior baseline measures so
      // repeat scans for the same member settle smoothly rather than jumping between close shapes.
      let priorMeasures: Record<string, number> | null = null;
      let scanCount = 1;
      if (!faceData) {
        try {
          const { data: blob } = await supabase.storage
            .from("scans")
            .download(`${existing.referral_code}_face_data.json`);
          if (blob) {
            const parsed = JSON.parse(await blob.text());
            const prev = parsed?.faceData;
            if (prev?.rawMeasures && typeof prev.rawMeasures.R === "number") {
              priorMeasures = prev.rawMeasures;
              scanCount = typeof prev.scanCount === "number" ? prev.scanCount : 1;
            }
          }
        } catch {
          // Non-fatal: first-time scan or legacy JSON format
        }
      }

      const shouldUploadPhoto = Boolean(photoBase64) && !(skipPhotoIfPresent && existing.photo_url);
      const { photoUrl: newPhotoUrl, faceDataUrl } = await uploadScanAssets(
        supabase,
        existing.referral_code,
        shouldUploadPhoto ? photoBase64 : null,
        faceData
          ? {
              memberNumber: existing.member_number,
              referralCode: existing.referral_code,
              name: rawName || existing.name,
              contact: prettyContact,
              email: rawEmail || null,
              ageBracket,
              beard,
              skinConcern,
              photoUrl: existing.photo_url || null,
              faceData,
              savedAt: new Date().toISOString(),
            }
          : null
      );

      const updatedPhotoUrl = newPhotoUrl || existing.photo_url || null;
      const updatePayload: Record<string, unknown> = {};
      if (faceShape) updatePayload.face_shape = faceShape;
      if (ageBracket) updatePayload.age_bracket = ageBracket;
      if (beard) updatePayload.beard = beard;
      if (rawName && rawName !== existing.name) updatePayload.name = rawName;
      if (updatedPhotoUrl) updatePayload.photo_url = updatedPhotoUrl;
      if (rawEmail) updatePayload.email = rawEmail;
      if (skinConcern) updatePayload.skin_concern = skinConcern;
      if (faceData) {
        updatePayload.face_data = faceDataUrl ? { ...faceData, faceDataUrl } : faceData;
      }

      if (Object.keys(updatePayload).length > 0) {
        const fallbackConcern = buildFallbackSkinConcern(skinConcern, rawEmail, beard, faceData, faceDataUrl);
        await writeWaitlistWithFallback(supabase, "update", updatePayload, fallbackConcern, existing.id);
      }

      const { count: priorCount } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true })
        .lt("created_at", existing.created_at);

      const waitlistPosition = (priorCount || 0) + 1;

      const n8nWebhook = process.env.N8N_WEBHOOK_URL;
      if (n8nWebhook && (faceShape || updatedPhotoUrl)) {
        try {
          fetch(n8nWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "scan_completed",
              timestamp: new Date().toISOString(),
              memberNumber: existing.member_number,
              referralCode: existing.referral_code,
              referralLink: `https://unseen-men.vercel.app/?ref=${existing.referral_code}`,
              waitlistPosition,
              user: {
                name: rawName || existing.name,
                phone: prettyContact,
                email: rawEmail || null,
                ageBracket,
                beard,
                faceShape: faceShape || null,
                skinConcern,
                photoUrl: updatedPhotoUrl,
                faceDataUrl,
              },
              faceData,
              styling: stylingData,
            }),
          }).catch((e: Error) => console.warn("[n8n webhook error]:", e.message));
        } catch (e) {
          console.warn("[n8n webhook error]:", e);
        }
      }

      return NextResponse.json({
        ok: true,
        alreadyJoined: true,
        name: rawName || existing.name,
        contact: prettyContact,
        memberNumber: existing.member_number,
        waitlistPosition,
        referralCode: existing.referral_code,
        referralCount: existing.referral_count || 0,
        photoUrl: updatedPhotoUrl,
        faceDataUrl,
        priorMeasures,
        scanCount,
      });
    }

    // 2. Validate referred_by if provided
    let validReferrerCode: string | null = null;
    if (referredBy && CODE_RE.test(referredBy)) {
      const { data: referrerUser } = await supabase
        .from("waitlist")
        .select("referral_code")
        .eq("referral_code", referredBy)
        .maybeSingle();

      if (referrerUser) {
        validReferrerCode = referrerUser.referral_code;
      }
    }

    // 3. Generate a collision-free referral code
    let assignedCode = generateReferralCode();
    for (let attempts = 0; attempts < 5; attempts++) {
      const { data: codeCheck } = await supabase
        .from("waitlist")
        .select("id")
        .eq("referral_code", assignedCode)
        .maybeSingle();

      if (!codeCheck) break;
      assignedCode = generateReferralCode();
    }

    // 4. Assign Member Number
    let assignedMemberNumber = requestedMemberNumber && requestedMemberNumber > 0 ? requestedMemberNumber : 347;

    const { data: numCheck } = await supabase
      .from("waitlist")
      .select("id")
      .eq("member_number", assignedMemberNumber)
      .maybeSingle();

    if (numCheck) {
      const { data: maxRow } = await supabase
        .from("waitlist")
        .select("member_number")
        .order("member_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      assignedMemberNumber = maxRow?.member_number ? maxRow.member_number + 1 : 348;
    }

    // 5. Upload photo + complete face data JSON to Supabase Storage
    const { photoUrl, faceDataUrl } = await uploadScanAssets(
      supabase,
      assignedCode,
      photoBase64,
      faceData
        ? {
            memberNumber: assignedMemberNumber,
            referralCode: assignedCode,
            name: rawName,
            contact: prettyContact,
            email: rawEmail || null,
            ageBracket,
            beard,
            skinConcern,
            faceData,
            savedAt: new Date().toISOString(),
          }
        : null
    );

    // 6. Insert new waitlist row
    const insertPayload: Record<string, unknown> = {
      name: rawName,
      contact: normalizedContact,
      email: rawEmail || null,
      age_bracket: ageBracket,
      beard: beard,
      face_shape: faceShape,
      skin_concern: skinConcern,
      referral_code: assignedCode,
      referred_by: validReferrerCode,
      member_number: assignedMemberNumber,
      referral_count: 0,
    };

    if (photoUrl) insertPayload.photo_url = photoUrl;
    if (faceData) {
      insertPayload.face_data = faceDataUrl ? { ...faceData, faceDataUrl } : faceData;
    }

    const fallbackConcern = buildFallbackSkinConcern(skinConcern, rawEmail, beard, faceData, faceDataUrl);
    const { error: insertErr } = await writeWaitlistWithFallback(supabase, "insert", insertPayload, fallbackConcern);

    if (insertErr) {
      console.error("Waitlist insertion error:", insertErr);
      return NextResponse.json({ ok: false, error: "Failed to join waitlist. Please try again." }, { status: 500 });
    }

    // 7. Atomically increment referrer's count if applicable
    if (validReferrerCode) {
      try {
        await supabase.rpc("increment_referral_count", { ref_code: validReferrerCode });
      } catch {
        // Ignore fallback RPC error
      }
    }

    // 8. Calculate waitlist position
    const { count: totalWaitlist } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    // 9. Trigger n8n Webhook if configured
    const n8nWebhook = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhook) {
      try {
        fetch(n8nWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "scan_completed",
            timestamp: new Date().toISOString(),
            memberNumber: assignedMemberNumber,
            referralCode: assignedCode,
            referralLink: `https://unseen-men.vercel.app/?ref=${assignedCode}`,
            waitlistPosition: totalWaitlist || 1,
            user: {
              name: rawName,
              phone: normalizedContact,
              email: rawEmail || (rawContact.includes("@") ? rawContact : null),
              ageBracket,
              beard,
              faceShape,
              skinConcern,
              photoUrl,
              faceDataUrl,
            },
            faceData,
            styling: stylingData,
          }),
        }).catch((e: Error) => console.warn("[n8n webhook error]:", e.message));
      } catch (e) {
        console.warn("[n8n webhook call failed]:", e);
      }
    }

    return NextResponse.json({
      ok: true,
      alreadyJoined: false,
      name: rawName,
      contact: prettyContact,
      memberNumber: assignedMemberNumber,
      waitlistPosition: totalWaitlist || 1,
      referralCode: assignedCode,
      referralCount: 0,
      photoUrl,
      faceDataUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Waitlist API error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code || !CODE_RE.test(code)) {
      return NextResponse.json({ ok: false, error: "Invalid referral code" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: user, error } = await supabase
      .from("waitlist")
      .select("name, member_number, referral_code, referral_count, created_at")
      .eq("referral_code", code)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ ok: false, error: "Referral code not found" }, { status: 404 });
    }

    const { count: priorCount } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .lt("created_at", user.created_at);

    return NextResponse.json({
      ok: true,
      name: user.name,
      memberNumber: user.member_number,
      referralCode: user.referral_code,
      referralCount: user.referral_count || 0,
      waitlistPosition: (priorCount || 0) + 1,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
