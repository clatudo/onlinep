-- Active: PostgreSQL

-- 1. Cria a tabela customizada 'profiles' usando as extensões e features do schema public
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  cpf TEXT UNIQUE,
  phone TEXT,
  cellphone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Configura níveis de segurança no PostgreSQL (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2.1 Políticas: O próprio usuário pode ler seus dados
CREATE POLICY "Usuários podem ver seu próprio perfil." 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 2.2 Políticas: O próprio usuário pode atualizar seus dados
CREATE POLICY "Usuários podem atualizar seu próprio perfil." 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2.3 Políticas: Apenas o backend (através do service_role) pode INSERIR dados ao registrar
CREATE POLICY "Apenas serviço interno pode inserir perfis" 
ON public.profiles FOR INSERT 
WITH CHECK (true); -- Vai ser criado pelo trigger do DB.

-- 3. Trigger para copiar automaticamente informações do auth.users para public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, cpf, phone, cellphone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'cellphone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Anexar o Trigger à tabela "users" existente na camada 'auth' do Supabase
-- Excluímos se existir para evitar duplicação do trigger em re-runs deste script
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
