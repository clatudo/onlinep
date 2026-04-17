import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yqhdxzihagyxaqiihdzt.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxaGR4emloYWd5eGFxaWloZHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjgxODgsImV4cCI6MjA5MDMwNDE4OH0.AAro76GRVQmiFfXmJuUL5tLMJGjWT2WJcjeRMjD-H_E'
  )
}
