import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminToken, ADMIN_COOKIE_OPTIONS } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const expectedUsername = process.env.ADMIN_USERNAME;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!expectedUsername || !passwordHash) {
      return NextResponse.json({ error: 'Configuração do servidor inválida.' }, { status: 500 });
    }

    if (username !== expectedUsername) {
      // Delay para mitigar brute force
      await new Promise(r => setTimeout(r, 500));
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    // Comparamos a senha plana enviada com o hash do .env
    const passwordMatch = await bcrypt.compare(password, passwordHash);
    
    if (!passwordMatch) {
      await new Promise(r => setTimeout(r, 500));
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const token = await createAdminToken(username);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      ...ADMIN_COOKIE_OPTIONS,
      value: token,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erro interno ao processar login.' }, { status: 500 });
  }
}
