import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Rota de diagnóstico temporária — mostra os dados do usuário logado
// Acesse: /api/debug/user-data (somente usuário autenticado)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Não autenticado', details: error?.message }, { status: 401 });
    }

    const meta = user.user_metadata || {};

    // Sanitizar o CPF/CNPJ para ver o que seria enviado ao MP
    const sanitize = (v: string | undefined | null) => (v || '').replace(/\D/g, '');
    const cpfRaw = meta.cpf;
    const cnpjRaw = meta.cnpj;
    const cpfClean = sanitize(cpfRaw);
    const cnpjClean = sanitize(cnpjRaw);

    return NextResponse.json({
      user_id: user.id,
      email: user.email,
      metadata: {
        full_name: meta.full_name,
        account_type: meta.account_type,
        cpf_raw: cpfRaw,
        cpf_clean: cpfClean,
        cpf_length: cpfClean.length,
        cnpj_raw: cnpjRaw,
        cnpj_clean: cnpjClean,
        cnpj_length: cnpjClean.length,
      },
      diagnosis: {
        has_cpf: !!cpfClean,
        has_cnpj: !!cnpjClean,
        cpf_valid_length: cpfClean.length === 11,
        cnpj_valid_length: cnpjClean.length === 14,
        what_mp_receives: cpfClean || cnpjClean || '(nenhum — campo omitido)'
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
