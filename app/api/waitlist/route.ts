import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { checkIndianMobile, isEmail } from "@/lib/phone";

const ABC = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_RE = /^UM-[A-HJ-KM-NP-Z2-9]{4}$/;

function generateReferralCode(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return "UM-" + Array.from(bytes, (b) => ABC[b % ABC.length]).join("");
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
    const stylingData = body.styling || null;
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

    if (existing) {
      // User was registered upfront or visited before.
      // If this call contains the scan photo or face shape, update the existing database row!
      let updatedPhotoUrl: string | null = existing.photo_url || null;
      const photoBase64 = body.photoBase64 ? String(body.photoBase64) : null;

      if (photoBase64 && photoBase64.includes("base64")) {
        try {
          const cleanBase64 = photoBase64.includes(",") ? photoBase64.split(",")[1] : photoBase64;
          const buffer = Buffer.from(cleanBase64, "base64");
          const mime = photoBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg";
          const ext = mime === "image/png" ? "png" : "jpg";
          const fileName = `${existing.referral_code}_${Date.now()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("scans")
            .upload(fileName, buffer, {
              contentType: mime,
              upsert: true,
            });

          if (!uploadError) {
            const { data: pubData } = supabase.storage.from("scans").getPublicUrl(fileName);
            updatedPhotoUrl = pubData?.publicUrl || null;
          } else {
            console.warn("Storage upload warning during update:", uploadError.message);
          }
        } catch (photoErr) {
          console.warn("Photo upload update error:", photoErr);
        }
      }

      const updatePayload: Record<string, unknown> = {};
      if (faceShape) updatePayload.face_shape = faceShape;
      if (ageBracket) updatePayload.age_bracket = ageBracket;
      if (rawName && rawName !== existing.name) updatePayload.name = rawName;
      if (updatedPhotoUrl) updatePayload.photo_url = updatedPhotoUrl;
      if (rawEmail) {
        updatePayload.skin_concern = skinConcern ? `${skinConcern} | email:${rawEmail}` : `email:${rawEmail}`;
      }

      if (Object.keys(updatePayload).length > 0) {
        const { error: updateErr } = await supabase
          .from("waitlist")
          .update(updatePayload)
          .eq("id", existing.id);

        if (updateErr) {
          // If photo_url column caused error, retry without photo_url
          if (updateErr.message?.includes("photo_url")) {
            delete updatePayload.photo_url;
            await supabase.from("waitlist").update(updatePayload).eq("id", existing.id);
          }
        }
      }

      // Calculate their existing position
      const { count: priorCount } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true })
        .lt("created_at", existing.created_at);

      const waitlistPosition = (priorCount || 0) + 1;

      // Trigger n8n Webhook if completed scan details (face shape or photo) are present
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
                faceShape: faceShape || null,
                skinConcern,
                photoUrl: updatedPhotoUrl,
              },
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
      });
    }

    // 2. Validate referral code format if present
    if (referredBy && !CODE_RE.test(referredBy)) {
      referredBy = null;
    }

    // Check if referrer exists in waitlist
    let validReferrerCode: string | null = null;
    if (referredBy) {
      const { data: referrerUser } = await supabase
        .from("waitlist")
        .select("id, referral_code")
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

    // Check if the requested number is taken
    const { data: numCheck } = await supabase
      .from("waitlist")
      .select("id")
      .eq("member_number", assignedMemberNumber)
      .maybeSingle();

    if (numCheck) {
      // Find highest member_number and increment
      const { data: maxRow } = await supabase
        .from("waitlist")
        .select("member_number")
        .order("member_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      assignedMemberNumber = maxRow?.member_number ? maxRow.member_number + 1 : 348;
    }

    // 5. Upload photo to Supabase Storage if provided
    let photoUrl: string | null = null;
    const photoBase64 = body.photoBase64 ? String(body.photoBase64) : null;

    if (photoBase64 && photoBase64.includes("base64")) {
      try {
        const cleanBase64 = photoBase64.includes(",") ? photoBase64.split(",")[1] : photoBase64;
        const buffer = Buffer.from(cleanBase64, "base64");
        const mime = photoBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg";
        const ext = mime === "image/png" ? "png" : "jpg";
        const fileName = `${assignedCode}_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("scans")
          .upload(fileName, buffer, {
            contentType: mime,
            upsert: true,
          });

        if (!uploadError) {
          const { data: pubData } = supabase.storage.from("scans").getPublicUrl(fileName);
          photoUrl = pubData?.publicUrl || null;
        } else {
          console.warn("Storage upload warning:", uploadError.message);
        }
      } catch (photoErr) {
        console.warn("Failed to process photo upload:", photoErr);
      }
    }

    // 6. Insert new waitlist row
    const storedSkinConcern = rawEmail
      ? (skinConcern ? `${skinConcern} | email:${rawEmail}` : `email:${rawEmail}`)
      : skinConcern;

    const insertPayload: Record<string, unknown> = {
      name: rawName,
      contact: normalizedContact,
      age_bracket: ageBracket,
      face_shape: faceShape,
      skin_concern: storedSkinConcern,
      referral_code: assignedCode,
      referred_by: validReferrerCode,
      member_number: assignedMemberNumber,
      referral_count: 0,
    };

    if (photoUrl) {
      insertPayload.photo_url = photoUrl;
    }

    let { error: insertErr } = await supabase.from("waitlist").insert(insertPayload);

    // If photo_url column doesn't exist yet, retry without photo_url so user flow never breaks
    if (insertErr && photoUrl && insertErr.message?.includes("photo_url")) {
      delete insertPayload.photo_url;
      const retry = await supabase.from("waitlist").insert(insertPayload);
      insertErr = retry.error;
    }

    if (insertErr) {
      console.error("Waitlist insertion error:", insertErr);
      return NextResponse.json({ ok: false, error: "Failed to join waitlist. Please try again." }, { status: 500 });
    }

    // 6. Atomically increment referrer's count if applicable
    if (validReferrerCode) {
      try {
        await supabase.rpc("increment_referral_count", { ref_code: validReferrerCode });
      } catch (rpcErr) {
        // Fallback update if RPC fails
        await supabase
          .from("waitlist")
          .update({ referral_count: supabase.rpc("increment_referral_count", { ref_code: validReferrerCode }) })
          .eq("referral_code", validReferrerCode);
      }
    }

    // 7. Calculate waitlist position
    const { count: totalWaitlist } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    // 8. Trigger n8n Webhook (if N8N_WEBHOOK_URL is configured in .env.local)
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
              faceShape,
              skinConcern,
              photoUrl,
            },
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
