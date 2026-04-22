import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://yqhdxzihagyxaqiihdzt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxaGR4emloYWd5eGFxaWloZHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjgxODgsImV4cCI6MjA5MDMwNDE4OH0.AAro76GRVQmiFfXmJuUL5tLMJGjWT2WJcjeRMjD-H_E'
  )
}
