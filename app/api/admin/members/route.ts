import { NextResponse } from 'next/server';
import { isAdmin, authClient } from '@/lib/adminAuth';
export const dynamic = 'force-dynamic';
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = authClient();
    const fetchAll = async (table: string, columns: string) => {
      const rows: Record<string, unknown>[] = [];
      for (let start = 0; ; start += 1000) {
        const { data, error } = await db.from(table).select(columns).order(table === 'waitlist' ? 'created_at' : 'member_id', { ascending: false }).range(start, start + 999);
        if (error) throw error;
        rows.push(...(data || []) as unknown as Record<string, unknown>[]);
        if ((data?.length || 0) < 1000) return rows;
      }
    };
    const [members, books] = await Promise.all([fetchAll('waitlist', 'id,name,contact,member_number,face_shape,created_at'), fetchAll('scan_lookbooks', 'member_id,lookbook')]);
    const keys = ['w1_hair','w1_beard','w2_glasses','w2_sun','w3_office','w3_festive','w4_day','w4_night'];
    const byMember = new Map(books.map(b => {
      const book = b.lookbook && typeof b.lookbook === 'object' && !Array.isArray(b.lookbook) ? b.lookbook as Record<string, unknown> : {};
      return [b.member_id, Object.fromEntries(keys.map(key => [key, typeof book[key] === 'string']))];
    }));
    return NextResponse.json({ members: members.map(m => ({ ...m, lookbook: byMember.get(m.id) ?? null })) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Could not load members from Supabase.' }, { status: 503 }); }
}
