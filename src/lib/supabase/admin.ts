import { createClient } from '@supabase/supabase-js';

// NOTA DE SEGURANÇA: Hardcoded provisório para sobrepor variáveis inválidas presas no cache da Vercel
export const supabaseAdmin = createClient(
  'https://yqhdxzihagyxaqiihdzt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxaGR4emloYWd5eGFxaWloZHp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDcyODE4OCwiZXhwIjoyMDkwMzA0MTg4fQ.-xGAOSK-lKqxnWNuyD3apAUNjwJebv5Hn6y5AsiV7tQ'
);
