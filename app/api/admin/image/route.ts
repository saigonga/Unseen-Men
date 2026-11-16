import { NextResponse } from 'next/server';
import { isAdmin, authClient } from '@/lib/adminAuth';
const KEYS = new Set(['w1_hair','w1_beard','w2_glasses','w2_sun','w3_office','w3_festive','w4_day','w4_night']);
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  if (!await isAdmin()) return new NextResponse('Unauthorized', { status: 401 });
  const query = new URL(request.url).searchParams;
  const member = query.get('member') || '', key = query.get('key') || '';
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(member) || !KEYS.has(key)) return new NextResponse('Invalid request', { status: 400 });
  try {
    const db = authClient();
    const { data, error } = await db.from('scan_lookbooks').select('lookbook').eq('member_id', member).maybeSingle();
    if (error || !data?.lookbook || typeof data.lookbook[key] !== 'string') return new NextResponse('Image unavailable', { status: 404 });
    let path = data.lookbook[key] as string;
    let bucket = '';
    if (path.startsWith('lookbooks-private/')) { bucket = 'lookbooks-private'; path = path.slice(bucket.length + 1); }
    else if (path.startsWith('https://')) {
      const parsed = new URL(path);
      const expected = new URL(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '');
      const prefix = '/storage/v1/object/public/scans/';
      if (parsed.origin !== expected.origin || !parsed.pathname.startsWith(prefix)) return new NextResponse('Unsupported image', { status: 404 });
      bucket = 'scans'; path = decodeURIComponent(parsed.pathname.slice(prefix.length));
    }
    if (!bucket || !path.startsWith('lookbooks/') || path.includes('..')) return new NextResponse('Unsupported image', { status: 404 });
    const { data: file, error: storageError } = await db.storage.from(bucket).download(path);
    if (storageError || !file || !['image/webp','image/jpeg','image/png'].includes(file.type)) return new NextResponse('Image unavailable', { status: 404 });
    return new NextResponse(file, { headers: { 'Content-Type': file.type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new NextResponse('Image unavailable', { status: 503 }); }
}
