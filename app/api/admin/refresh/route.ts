import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_REFRESH_COOKIE, adminEmailMatches, authClient, clearAdminCookies, setAdminCookies } from '@/lib/adminAuth';

export async function POST() {
  const refreshToken = (await cookies()).get(ADMIN_REFRESH_COOKIE)?.value;
  if (!refreshToken) return NextResponse.json({ error: 'Session expired' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  try {
    const { data, error } = await authClient().auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session || !data.user || !adminEmailMatches(data.user.email) || !data.user.email_confirmed_at) {
      if (error && error.status && error.status >= 500) return NextResponse.json({ error: 'Sign-in is temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
      clearAdminCookies(response);
      return response;
    }
    const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    setAdminCookies(response, data.session);
    return response;
  } catch {
    return NextResponse.json({ error: 'Sign-in is temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
