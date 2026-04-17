import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 50; // Aumento para o dashboard pegar mais dados se necessário
  const offset = (page - 1) * limit;

  try {
    // 1. Busca Profiles
    let profilesQuery = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' });

    if (search) {
      profilesQuery = profilesQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%,cnpj.ilike.%${search}%,cellphone.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: profiles, count, error: pError } = await profilesQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (pError) throw pError;

    // 2. Busca Subscriptions e Invoices separadamente para evitar erro de join ausente
    const userIds = profiles?.map(p => p.id) || [];
    
    const { data: allSubscriptions, error: sError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .in('user_id', userIds);

    if (sError) throw sError;

    const subIds = allSubscriptions?.map(s => s.id) || [];
    const { data: allInvoices, error: iError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .in('subscription_id', subIds);

    if (iError) throw iError;

    // 3. Busca status de confirmação do Auth (Admin) para enriquecer o status real
    const { data: authUsers, error: auError } = await supabaseAdmin.auth.admin.listUsers();
    const authMap = new Map((authUsers?.users || []).map(u => [u.id, u.email_confirmed_at]));

    // 4. Consolidação manual dos dados
    const enriched = (profiles || []).map((p: any) => {
      const pSubs = (allSubscriptions || []).filter(s => s.user_id === p.id);
      const activeSub = pSubs.find(s => s.status === 'active');
      const pendingSub = pSubs.find(s => s.status === 'pending');
      const latestSub = pSubs[0] || null;

      const pInvoices = (allInvoices || []).filter(inv => pSubs.some(s => s.id === inv.subscription_id));
      const overdueInvoices = pInvoices.filter(inv => 
        (inv.status === 'open' || inv.status === 'failed') && 
        inv.due_date && new Date(inv.due_date) < new Date()
      );

      const emailConfirmedAt = authMap.get(p.id);

      let clientStatus: 'active' | 'pending' | 'overdue' | 'inactive' | 'new' | 'inativo';
      
      if (activeSub) {
        clientStatus = overdueInvoices.length > 0 ? 'overdue' : 'active';
      } else if (pendingSub) {
        clientStatus = 'pending';
      } else if (pSubs.length === 0) {
        // Se não tem plano, verificamos se ele já ativou o e-mail
        clientStatus = emailConfirmedAt ? 'new' : 'inativo';
      } else {
        clientStatus = 'inactive';
      }

      return {
        ...p,
        clientStatus,
        email_verified: !!emailConfirmedAt,
        plan_id: latestSub?.plan_id || null,
        subscription_id: latestSub?.id || null,
        subscription_status: latestSub?.status || null,
        next_billing_date: latestSub?.next_billing_date || null,
        pending_invoices: pInvoices.filter(i => i.status === 'open' || i.status === 'pending' || i.status === 'failed').length,
        total_invoices: pInvoices.length,
      };
    });

    // Filtros finais
    const filtered = status === 'all' ? enriched : enriched.filter((c: any) => c.clientStatus === status);

    return NextResponse.json({
      clients: filtered,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });

  } catch (error: any) {
    console.error('API Error /api/admin/clients:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
