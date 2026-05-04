import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { verifyAdminRequest } from '@/lib/admin-auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Atualiza a sessão e obtém a resposta (necessário para o Supabase)
  const response = await updateSession(request);

  // 2. Proteção Global: Bloqueia acesso a qualquer página se não estiver logado
  // Ignora arquivos estáticos, api e a própria página de login para não criar loop
  const isAuthPage = pathname === '/admsdc/login';
  const isPublicAsset = pathname.startsWith('/_next') || pathname.includes('/api/') || pathname.includes('.');

  // 3. Lógica específica para a página de Login (Redireciona logado para o dashboard)
  if (isAuthPage) {
    const isAuthenticated = await verifyAdminRequest(request);
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/admsdc';
      return NextResponse.redirect(url);
    }
    return response;
  }


  // 4. Proteção das rotas admin (Já coberta pelo item 2, mas mantida por clareza)
  if (pathname.startsWith('/admsdc') && !isAuthPage) {
    const isAuthenticated = await verifyAdminRequest(request);
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/admsdc/login';
      return NextResponse.redirect(url);
    }
  }

  return response;
  // return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match todas as rotas exceto:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone do navegador)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    //'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
