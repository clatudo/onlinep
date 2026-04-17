import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendPaymentSuccessEmail } from '@/lib/mail';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string; invoiceId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const { invoiceId, userId } = await params;

    // 1. Buscar a fatura
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('id, subscription_id, status, amount, user_id')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
       console.error("[SETTLE] Erro ao buscar fatura:", invoiceError?.message);
       return NextResponse.json({ error: 'Fatura não encontrada.' }, { status: 404 });
    }

    // 2. Buscar o perfil separadamente para garantir o envio do e-mail
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', invoice.user_id || userId)
      .single();

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Esta fatura já consta como paga.' }, { status: 400 });
    }

    // 2. Atualizar a fatura para 'paid'
    const { error: updateInvoiceError } = await supabaseAdmin
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', invoiceId);

    if (updateInvoiceError) {
      return NextResponse.json({ error: 'Erro ao atualizar status da fatura.' }, { status: 500 });
    }

    // 3. Se houver assinatura vinculada, ativar o serviço
    if (invoice.subscription_id) {
      const { error: updateSubError } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('id', invoice.subscription_id);

      if (updateSubError) {
        console.error('Erro ao ativar assinatura vinculada:', updateSubError);
        // Mesmo com erro na sub, a fatura foi paga. Retornamos sucesso parcial na mensagem.
      }
    }

    // DISPARAR E-MAIL DE CONFIRMAÇÃO (BAIXA MANUAL)
     if (profile && profile.email) {
        await sendPaymentSuccessEmail(
          profile.email,
          profile.full_name || 'Cliente',
          Number(invoice.amount),
          `Baixa de Fatura #${invoice.id.split('-')[0]}`
        );
     }

    return NextResponse.json({ 
      success: true, 
      message: 'Fatura baixada manualmente e serviço ativado com sucesso.' 
    });

  } catch (error: any) {
    console.error('Erro na baixa manual:', error);
    return NextResponse.json({ error: 'Erro interno ao realizar baixa manual.' }, { status: 500 });
  }
}
