import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteção das rotas admin (exceto a página de login)
  if (pathname.startsWith('/admsdc') && pathname !== '/admsdc/login') {
    const isAuthenticated = await verifyAdminRequest(request);
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/admsdc/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Se já está logado como admin e tenta acessar /admsdc/login, redireciona pro dashboard
  if (pathname === '/admsdc/login') {
    const isAuthenticated = await verifyAdminRequest(request);
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/admsdc';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
