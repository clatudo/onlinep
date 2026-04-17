-- Tabela para gerenciar a fila de e-mails pendentes/falhos
CREATE TABLE IF NOT EXISTS public.email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    link TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT DEFAULT 'welcome',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS apenas para segurança, mas apenas admin/service_role acessa
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Política simples: service_role pode tudo
CREATE POLICY "Service Role pode tudo na fila de emails" 
ON public.email_queue 
USING (true) 
WITH CHECK (true);
