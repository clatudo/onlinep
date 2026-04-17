import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string, subId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { subId } = await params;

  try {
    // A exclusão da sub deveria disparar cascade, mas faremos limpeza explícita de contratos e faturas
    // para garantir que não fiquem órfãos se a FK não estiver perfeita.
    await supabaseAdmin
      .from('contracts')
      .delete()
      .eq('subscription_id', subId);

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('id', subId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Assinatura removida definitivamente.' });
  } catch (error: any) {
    console.error('Delete subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
