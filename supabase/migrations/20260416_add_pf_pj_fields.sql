-- Migração para suporte a Pessoa Jurídica (PJ) e Data de Nascimento (PF)
-- Além de correções de colunas de domínio nas assinaturas

-- 1. ADICIONA AS COLUNAS NECESSÁRIAS
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'pf',
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT UNIQUE;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS domain TEXT,
ADD COLUMN IF NOT EXISTS domain_type TEXT;

-- 2. ATUALIZA A FUNÇÃO QUE CRIA O PERFIL AUTOMATICAMENTE NO CADASTRO
-- Garante que os novos metadados (CNPJ, Empresa, etc) sejam salvos no perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    cpf, 
    phone, 
    cellphone,
    account_type,
    birth_date,
    company_name,
    cnpj
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'cellphone',
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'pf'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL AND NEW.raw_user_meta_data->>'birth_date' != '' 
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'cnpj'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
