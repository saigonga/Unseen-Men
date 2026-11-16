import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/adminAuth';
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', sameSite: 'strict', maxAge: 0, secure: process.env.NODE_ENV === 'production' });
  return response;
}
