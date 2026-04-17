import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { userId } = await params;

  try {
    // 1. Buscar Perfil
    const { data: profile, error: pError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (pError) throw pError;
    if (!profile) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });

    // 2. Buscar Assinaturas
    const { data: subscriptions, error: sError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (sError) throw sError;

    // 3. Buscar Faturas para vincular às assinaturas
    const { data: invoices, error: iError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (iError) throw iError;

    // 4. Buscar Contratos
    const { data: contracts, error: cError } = await supabaseAdmin
      .from('contracts')
      .select('*')
      .eq('user_id', userId)
      .order('agreed_at', { ascending: false });

    if (cError) throw cError;

    // 5. Vincular faturas às assinaturas
    const enrichedSubscriptions = (subscriptions || []).map(sub => ({
      ...sub,
      invoices: (invoices || []).filter(inv => inv.subscription_id === sub.id)
    }));

    return NextResponse.json({
      profile,
      subscriptions: enrichedSubscriptions,
      contracts: contracts || []
    });

  } catch (error: any) {
    console.error('Fetch client detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { userId } = await params;

  try {
    // 1. Deletar o usuário do Auth disparará o cascade em todas as tabelas (profiles, subs, etc.)
    // Usamos o admin auth do supabase.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      // Se der erro no auth (ex: usuário não existe mais lá), tentamos limpar o profile manualmente
      // mas o deleteUser é o caminho principal.
      console.error('Auth delete error:', error);
      
      const { error: pError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (pError) throw pError;
    }

    return NextResponse.json({ success: true, message: 'Conta e todos os dados associados foram excluídos definitivamente.' });
  } catch (error: any) {
    console.error('Delete client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
