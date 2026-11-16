import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const ADMIN_EMAILS = new Set(['sai.gonga@theboredmonkey.com', 'aayushi.tripathi@noddmen.com']);
export const ADMIN_COOKIE = 'nodd_admin_session';

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
