import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShapeKey, TraitKey } from "./content";
import { createLookbook, lookbookSignature } from "./lookbook";

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
    // A concurrent request must never replace the first saved scan.
    if (existing) throw new Error("A scan already exists for this member.");

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
