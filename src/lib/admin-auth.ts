import * as jose from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const COOKIE_NAME = 'admin_token';
const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
const EXPIRES_IN = '8h';

export interface AdminTokenPayload {
  username: string;
  role: 'admin';
}

export async function createAdminToken(username: string): Promise<string> {
  return await new jose.SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') return null;
    return payload as unknown as AdminTokenPayload;
  } catch {
    return null;
  }
}

/** Verifica o token admin a partir de um NextRequest (para uso no middleware) */
export async function verifyAdminRequest(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const decoded = await verifyAdminToken(token);
  return decoded !== null;
}

/** Verifica o token admin a partir dos cookies do server component */
export async function getAdminSession(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

export const ADMIN_COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  httpOnly: true,
  // IMPORTANTE: Em desenvolvimento, deve ser false para funcionar em localhost sem HTTPS
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 8, // 8h
};
