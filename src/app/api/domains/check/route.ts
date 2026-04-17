import { NextResponse } from 'next/server';
import { checkDomainAvailability } from '@/lib/domain-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domínio não informado' }, { status: 400 });
  }

  // Limpar 'www.' caso o usuário digite
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '');

  // Regex para permitir domínios simples (.com) e compostos (.com.br)
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
  if (!domainRegex.test(cleanDomain)) {
    return NextResponse.json({ error: 'Formato de domínio inválido. Use exemplo.com ou exemplo.com.br' }, { status: 400 });
  }

  try {
    const result = await checkDomainAvailability(cleanDomain);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
