import { NextResponse } from 'next/server';
import { adminEmailMatches, authClient, setAdminCookies } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!adminEmailMatches(body.email) || typeof body.password !== 'string' || body.password.length > 256) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    const { data, error } = await authClient().auth.signInWithPassword({ email: body.email.trim().toLowerCase(), password: body.password });
    if (error || !data.session || !data.user.email_confirmed_at) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    setAdminCookies(response, data.session);
    return response;
  } catch { return NextResponse.json({ error: 'Sign-in is unavailable.' }, { status: 503 }); }
}
