-- Atualiza a função handle_new_user para ser mais robusta com NULLIF
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
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'cpf', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'cellphone', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'account_type', ''), 'pf'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL AND NEW.raw_user_meta_data->>'birth_date' != '' 
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE 
      ELSE NULL 
    END,
    NULLIF(NEW.raw_user_meta_data->>'company_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'cnpj', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    cpf = EXCLUDED.cpf,
    phone = EXCLUDED.phone,
    cellphone = EXCLUDED.cellphone,
    account_type = EXCLUDED.account_type,
    birth_date = EXCLUDED.birth_date,
    company_name = EXCLUDED.company_name,
    cnpj = EXCLUDED.cnpj;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
