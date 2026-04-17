import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const { userId } = await params;
    const { action } = await req.json(); // 'activate' ou 'deactivate'

    if (action !== 'activate' && action !== 'deactivate') {
      return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
    }

    // Busca a assinatura mais recente (assumimos que este é o controle principal)
    const { data: sub, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError || !sub) {
       // Opcionalmente poderíamos ter um campo is_active no profile se quisermos desativar usuários que nem assinaram.
       // Mas pela arquitetura, se não tem sub, não há o que suspender pro momento.
       // Vamos focar em suspender a assinatura (que suspende os acessos e serviços). 
       return NextResponse.json({ error: 'Cliente não possui assinatura para ser alterada.' }, { status: 404 });
    }

    const newStatus = action === 'activate' ? 'active' : 'canceled';

    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: newStatus })
      .eq('id', sub.id);

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao atualizar assinatura.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Cliente ${action === 'activate' ? 'ativado' : 'desativado'} com sucesso.` });

  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
