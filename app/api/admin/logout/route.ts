import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_REFRESH_COOKIE, authClient, clearAdminCookies } from '@/lib/adminAuth';
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const refreshToken = cookieStore.get(ADMIN_REFRESH_COOKIE)?.value;
  try {
    const client = authClient();
    const refreshed = !token && refreshToken ? await client.auth.refreshSession({ refresh_token: refreshToken }) : null;
    const activeToken = token || refreshed?.data.session?.access_token;
    if (activeToken) await client.auth.admin.signOut(activeToken, 'local');
  } catch { /* Clear browser cookies even when Supabase is unavailable. */ }
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  clearAdminCookies(response);
  return response;
}
