import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { sendPaymentSuccessEmail } from '@/lib/mail';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const { userId } = await params;

    // 1. Buscar todas as faturas pendentes do usuário
    const { data: invoices, error } = await supabaseAdmin
      .from('invoices')
      .select('id, mp_preference_id, status, subscription_id, amount, profiles(email, full_name)')
      .eq('user_id', userId)
      .in('status', ['pending', 'open']);

    if (error || !invoices) {
      return NextResponse.json({ error: 'Erro ao buscar faturas.' }, { status: 500 });
    }

    if (invoices.length === 0) {
      return NextResponse.json({ message: 'Nenhuma fatura pendente encontrada.' });
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
    const paymentApi = new Payment(client);
    
    let updatedCount = 0;

    // 2. Para cada fatura, verificar status no Mercado Pago
    for (const invoice of invoices) {
      if (!invoice.mp_preference_id) continue;

      try {
        const payment = await paymentApi.get({ id: invoice.mp_preference_id });
        
        if (payment && payment.status === 'approved' && invoice.status !== 'paid') {
          // Atualiza fatura
          await supabaseAdmin
            .from('invoices')
            .update({ status: 'paid' })
            .eq('id', invoice.id);

          // Atualiza assinatura se houver
          if (invoice.subscription_id) {
             await supabaseAdmin
               .from('subscriptions')
               .update({ status: 'active' })
               .eq('id', invoice.subscription_id);
          }

          // DISPARAR E-MAIL DE CONFIRMAÇÃO (SINCRONIZADO)
          const profile = (invoice.profiles as any);
          if (profile && profile.email) {
             await sendPaymentSuccessEmail(
               profile.email,
               profile.full_name || 'Cliente',
               Number(invoice.amount),
               `Fatura #${invoice.id.split('-')[0]} Sincronizada`
             );
          }

          updatedCount++;
        } else if (payment && (payment.status === 'rejected' || payment.status === 'cancelled') && invoice.status !== 'failed') {
             await supabaseAdmin
               .from('invoices')
               .update({ status: 'failed' })
               .eq('id', invoice.id);
               updatedCount++;
        }
      } catch (mpError) {
        console.error(`Erro ao verificar pagamento MP ${invoice.mp_preference_id}:`, mpError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: updatedCount > 0 ? `${updatedCount} fatura(s) sincronizada(s) e atualizada(s).` : 'Sincronização concluída. Nenhuma alteração de status detectada no gateway.' 
    });

  } catch (error: any) {
    console.error('Erro na sincronização:', error);
    return NextResponse.json({ error: 'Erro interno ao sincronizar pagamentos.' }, { status: 500 });
  }
}
