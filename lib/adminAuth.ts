import { createClient, type Session } from '@supabase/supabase-js';
import type { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_EMAILS = new Set(['sai.gonga@theboredmonkey.com', 'aayushi.tripathi@noddmen.com']);
export const ADMIN_COOKIE = 'nodd_admin_session';
export const ADMIN_REFRESH_COOKIE = 'nodd_admin_refresh';
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

export function setAdminCookies(response: NextResponse, session: Session) {
  response.cookies.set(ADMIN_COOKIE, session.access_token, { ...cookieOptions, maxAge: session.expires_in });
  response.cookies.set(ADMIN_REFRESH_COOKIE, session.refresh_token, { ...cookieOptions, maxAge: REFRESH_MAX_AGE });
}

export function clearAdminCookies(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  response.cookies.set(ADMIN_REFRESH_COOKIE, '', { ...cookieOptions, maxAge: 0 });
}

export function authClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Admin authentication is not configured.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function isAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const { data, error } = await authClient().auth.getUser(token);
    return !error && !!data.user?.email && ADMIN_EMAILS.has(data.user.email.toLowerCase()) && !!data.user.email_confirmed_at;
  } catch { return false; }
}

export function adminEmailMatches(value: unknown) {
  return typeof value === 'string' && ADMIN_EMAILS.has(value.trim().toLowerCase());
}
