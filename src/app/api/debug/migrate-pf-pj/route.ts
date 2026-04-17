import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const sql = `
      ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'pf',
      ADD COLUMN IF NOT EXISTS birth_date DATE,
      ADD COLUMN IF NOT EXISTS company_name TEXT,
      ADD COLUMN IF NOT EXISTS cnpj TEXT UNIQUE;

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
            WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL AND NEW.raw_user_meta_data->>'birth_date' != '' THEN (NEW.raw_user_meta_data->>'birth_date')::DATE 
            ELSE NULL 
          END,
          NEW.raw_user_meta_data->>'company_name',
          NEW.raw_user_meta_data->>'cnpj'
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    await client.query(sql);
    return NextResponse.json({ success: true, message: 'Migração PF/PJ executada com sucesso!' });
  } catch (error: any) {
    console.error('Erro na migração PF/PJ:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
