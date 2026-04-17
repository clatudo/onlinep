-- Migration: Adiciona role para usuários (admin/client)
-- Roda este script no Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'client' 
CHECK (role IN ('client', 'admin'));

-- Política para admin visualizar todos os perfis (via service_role não precisa, mas documentamos)
-- O admin sempre acessa via supabaseAdmin (service_role), então RLS não se aplica.

COMMENT ON COLUMN public.profiles.role IS 'Papel do usuário: client (padrão) ou admin';
