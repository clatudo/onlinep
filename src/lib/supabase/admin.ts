import { createClient } from '@supabase/supabase-js';

// NOTA DE SEGURANÇA: NUNCA USE ESTE ARQUIVO DENTRO DE UM CLIENT COMPONENT.
// Isso usa a SERVICE_ROLE_KEY, que bypassa completamente as políticas de segurança do banco.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yqhdxzihagyxaqiihdzt.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'MISSING_SERVICE_ROLE_KEY'
);
