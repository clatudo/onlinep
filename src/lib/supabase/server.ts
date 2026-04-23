import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const headersList = await headers()
  const isHttps = !!(headersList.get('x-forwarded-proto') === 'https' || (headersList.get('host') && !headersList.get('host')?.includes('localhost')))

  return createServerClient(
    'https://yqhdxzihagyxaqiihdzt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxaGR4emloYWd5eGFxaWloZHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjgxODgsImV4cCI6MjA5MDMwNDE4OH0.AAro76GRVQmiFfXmJuUL5tLMJGjWT2WJcjeRMjD-H_E',
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
                secure: isHttps,
                sameSite: 'lax' as const
              };
              
              // Garante que o cookie grude no domínio atual da requisição
              delete cleanOptions.domain;

              cookieStore.set(name, value, cleanOptions);
            });
          } catch {
            // O método setAll foi chamado de um Server Component.
            // Pode ser ignorado se o middleware está renovando a sessão.
          }
        },
      },
    }
  )
}
