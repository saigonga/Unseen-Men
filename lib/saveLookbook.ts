import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShapeKey, TraitKey } from "./content";
import { createLookbook, isLookbook, lookbookSignature } from "./lookbook";

export async function saveLookbook(
  db: SupabaseClient,
  memberId: string,
  shape: ShapeKey,
  traits: TraitKey[],
  faceData: Record<string, unknown>,
  email: string | null,
  beard: string | null,
) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const { data: existing, error: readError } = await db.from("scan_lookbooks")
      .select("lookbook,email,face_data").eq("member_id", memberId).maybeSingle();
    if (readError) throw readError;

    const measurements = { face_data: faceData, email, beard, updated_at: new Date().toISOString() };
    if (existing) {
      if (existing.email && existing.email !== email) throw new Error("Use the email from your original scan.");
      const previousFaceData = existing.face_data && typeof existing.face_data === "object" && !Array.isArray(existing.face_data)
        ? existing.face_data as Record<string, unknown>
        : {};
      const update = db.from("scan_lookbooks")
        .update({ ...measurements, face_data: { ...previousFaceData, ...faceData } })
        .eq("member_id", memberId)
        .eq("face_data", JSON.stringify(existing.face_data));
      const { data: updated, error } = await (existing.email ? update.eq("email", existing.email) : update.is("email", null))
        .select("member_id").maybeSingle();
      if (error) throw error;
      if (!updated) continue;
      return isLookbook(existing.lookbook) ? existing.lookbook : null;
    }

    const book = createLookbook(shape, traits, Math.random);
    const { error } = await db.from("scan_lookbooks").insert({
      member_id: memberId,
      pack_signature: lookbookSignature(book),
      lookbook: book,
      ...measurements,
    });
    if (!error) return book;
    // Another request may have assigned this member a pack or taken the signature.
    if (error.code !== "23505") throw error;
  }
  throw new Error("Could not reserve a unique lookbook.");
}
