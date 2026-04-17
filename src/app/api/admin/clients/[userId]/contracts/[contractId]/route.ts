import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string, contractId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { contractId } = await params;

  try {
    const { error } = await supabaseAdmin
      .from('contracts')
      .delete()
      .eq('id', contractId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Contrato removido com sucesso.' });
  } catch (error: any) {
    console.error('Delete contract error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
