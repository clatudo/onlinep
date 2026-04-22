import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const headersList = await headers()
  const isHttps = headersList.get('x-forwarded-proto') === 'https' || (headersList.get('host') && !headersList.get('host')?.includes('localhost'))

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yqhdxzihagyxaqiihdzt.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxaGR4emloYWd5eGFxaWloZHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjgxODgsImV4cCI6MjA5MDMwNDE4OH0.AAro76GRVQmiFfXmJuUL5tLMJGjWT2WJcjeRMjD-H_E',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const cleanOptions = { 
                ...options,
                secure: false, // Forçamos false para evitar que proxies http descartem
                sameSite: 'lax' as const
              };
              
              // Garante que o cookie grude no domínio atual da requisição, não importando se é ngrok, localhost, etc.
              delete cleanOptions.domain;

              console.log(`[AUTH DEBUG] Setando cookie: ${name}`, cleanOptions);
              cookieStore.set(name, value, cleanOptions);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
