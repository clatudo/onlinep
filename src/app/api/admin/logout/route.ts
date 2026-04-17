import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_OPTIONS } from '@/lib/admin-auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    ...ADMIN_COOKIE_OPTIONS,
    value: '',
    maxAge: 0,
  });
  return response;
}
