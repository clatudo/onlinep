import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/cliente/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const response = NextResponse.redirect(`${origin}${next}`);
    
    // Configura o client do Supabase para injetar os cookies DIRETAMENTE na Resposta
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Seta o cookie no cabeçalho da resposta
              response.cookies.set(name, value, options);
              // Também seta no store atual para garantir consistência
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Adiciona o parâmetro verified para mostrar o alerta no dashboard
      const redirectUrl = new URL(`${origin}${next}`);
      redirectUrl.searchParams.set("verified", "true");
      
      // Cria uma nova resposta com a URL atualizada
      const verifiedResponse = NextResponse.redirect(redirectUrl.toString());
      
      // Copia os cookies da resposta original (que foram setados pelo Supabase)
      response.cookies.getAll().forEach(cookie => {
        verifiedResponse.cookies.set(cookie.name, cookie.value);
      });

      return verifiedResponse;
    }
    
    console.error("Erro na troca de código:", error.message);
  }

  // Se houver erro, volta para o login com aviso
  return NextResponse.redirect(`${origin}/auth/login?error=auth-link-invalid`);
}
