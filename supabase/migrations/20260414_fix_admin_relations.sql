-- Adiciona chaves estrangeiras para permitir o join automático no PostgREST (usado pela API Admin)

-- 1. Vincula subscriptions ao profile (via user_id)
ALTER TABLE subscriptions 
ADD CONSTRAINT fk_subscriptions_profile 
FOREIGN KEY (user_id) 
REFERENCES profiles(id)
ON DELETE CASCADE;

-- 2. Vincula invoices às subscriptions (via subscription_id)
ALTER TABLE invoices 
ADD CONSTRAINT fk_invoices_subscription 
FOREIGN KEY (subscription_id) 
REFERENCES subscriptions(id)
ON DELETE CASCADE;

-- 3. Vincula invoices ao profile (via user_id)
ALTER TABLE invoices 
ADD CONSTRAINT fk_invoices_profile 
FOREIGN KEY (user_id) 
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Comentário para o PostgREST identificar as relações automaticamente
COMMENT ON CONSTRAINT fk_subscriptions_profile ON subscriptions IS 'Relaciona assinaturas com usuários';
COMMENT ON CONSTRAINT fk_invoices_subscription ON invoices IS 'Relaciona faturas com assinaturas';
COMMENT ON CONSTRAINT fk_invoices_profile ON invoices IS 'Relaciona faturas diretamente com usuários';
