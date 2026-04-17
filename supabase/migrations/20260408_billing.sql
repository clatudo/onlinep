-- Active: PostgreSQL
-- Migration: Assinaturas, Faturas, e Contratos Digitais

-- 1. Tabela: subscriptions (Assinaturas)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, active, canceled, failed
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_billing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver suas próprias assinaturas" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 2. Tabela: invoices (Faturas)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'open', -- open, paid, failed, pending
  due_date TIMESTAMP WITH TIME ZONE,
  mp_preference_id TEXT,
  mp_payment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver suas próprias faturas" ON public.invoices FOR SELECT USING (auth.uid() = user_id);

-- 3. Tabela: contracts (Contratos)
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  agreed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  contract_text TEXT
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver seus próprios contratos" ON public.contracts FOR SELECT USING (auth.uid() = user_id);
-- Serviço interno (admin) fará insert via admin client em ambas as tabelas
