-- Adiciona campos de domínio às assinaturas
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS domain TEXT,
ADD COLUMN IF NOT EXISTS domain_type TEXT; -- 'new' ou 'existing'

-- Comentários para documentação
COMMENT ON COLUMN public.subscriptions.domain IS 'Nome do domínio associado à hospedagem';
COMMENT ON COLUMN public.subscriptions.domain_type IS 'Tipo do domínio: new (registrar novo) ou existing (já possui)';
