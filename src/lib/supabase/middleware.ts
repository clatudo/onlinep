import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Permite que o Supabase acesse e modifique os cookies no Request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yqhdxzihagyxaqiihdzt.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxaGR4emloYWd5eGFxaWloZHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjgxODgsImV4cCI6MjA5MDMwNDE4OH0.AAro76GRVQmiFfXmJuUL5tLMJGjWT2WJcjeRMjD-H_E',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          const isHttps = request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
          
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            const cleanOptions = { ...options, secure: false, sameSite: 'lax' as const };
            delete cleanOptions.domain;
            supabaseResponse.cookies.set(name, value, cleanOptions);
          })
        },
      },
    }
  )

  // Obtem o usuário autenticado do Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteger rotas filhas de /checkout e /cliente
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/checkout') || request.nextUrl.pathname.startsWith('/cliente')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  // Se tenta acessar rota protegida sem logar -> joga pro login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Se ja ta logado e tenta ir para tela de login -> joga pro dashboard do cliente
  // EXCEÇÃO: Se for a página de reset de senha, permitimos que ele continue para trocar a senha.
  const isResetPasswordRoute = request.nextUrl.pathname === '/auth/reset-password'
  
  if (isAuthRoute && user && !isResetPasswordRoute) {
     const url = request.nextUrl.clone()
     url.pathname = '/cliente/dashboard'
     return NextResponse.redirect(url)
  }

  return supabaseResponse
}
