-- Adiciona coluna updated_at à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Comentário para documentar a coluna
COMMENT ON COLUMN public.profiles.updated_at IS 'Data da última atualização do perfil';
