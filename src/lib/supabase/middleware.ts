import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Permite que o Supabase acesse e modifique os cookies no Request
  const supabase = createServerClient(
    'https://yqhdxzihagyxaqiihdzt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxaGR4emloYWd5eGFxaWloZHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjgxODgsImV4cCI6MjA5MDMwNDE4OH0.AAro76GRVQmiFfXmJuUL5tLMJGjWT2WJcjeRMjD-H_E',
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
            const cleanOptions = { ...options, secure: isHttps, sameSite: 'lax' as const };
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

  // Se tenta acessar rota protegida sem logar -> joga pro login salvando o destino original
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    const next = url.pathname + url.search
    url.pathname = '/auth/login'
    url.searchParams.set('next', next)
    return NextResponse.redirect(url)
  }

  // Se ja ta logado e tenta ir para tela de login -> joga pro dashboard ou destino salvo
  // EXCEÇÃO: Se for a página de reset de senha, permitimos que ele continue para trocar a senha.
  const isResetPasswordRoute = request.nextUrl.pathname === '/auth/reset-password'
  
  if (isAuthRoute && user && !isResetPasswordRoute) {
     const next = request.nextUrl.searchParams.get('next')
     const url = request.nextUrl.clone()
     
     // Se houver um destino salvo, redireciona para ele, caso contrário para o dashboard
     if (next) {
       return NextResponse.redirect(new URL(next, request.url))
     }
     
     url.pathname = '/cliente/dashboard'
     url.searchParams.delete('next')
     return NextResponse.redirect(url)
  }

  return supabaseResponse
}
