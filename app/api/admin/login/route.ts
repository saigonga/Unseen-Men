import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminEmailMatches, authClient } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!adminEmailMatches(body.email) || typeof body.password !== 'string' || body.password.length > 256) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    const { data, error } = await authClient().auth.signInWithPassword({ email: body.email.trim().toLowerCase(), password: body.password });
    if (error || !data.session || !data.user.email_confirmed_at) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(ADMIN_COOKIE, data.session.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: Math.min(data.session.expires_in, 3600) });
    return response;
  } catch { return NextResponse.json({ error: 'Sign-in is unavailable.' }, { status: 503 }); }
}
