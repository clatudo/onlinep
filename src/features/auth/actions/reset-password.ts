"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendRecoveryEmail } from "@/lib/mail";

export async function requestPasswordResetAction(formData: FormData) {
  const identifier = formData.get("identifier") as string;

  if (!identifier) {
    return { error: "Informe o seu E-mail ou CPF." };
  }

  const cleanCPF = identifier.replace(/\D/g, "");
  let emailToReset = identifier;

  // Se o identificador parece um CPF (tem 11 dígitos após limpar)
  if (cleanCPF.length === 11 && !identifier.includes("@")) {
    const { data: profile, error: searchError } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .or(`cpf.eq.${identifier},cpf.eq.${cleanCPF}`)
      .single();

    if (profile?.email) {
      emailToReset = profile.email;
    } else {
      return { error: "Nenhuma conta associada a este CPF foi encontrada. Verifique os dados ou tente usar o e-mail." };
    }
  }

  const supabase = await createClient();

  try {
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: emailToReset,
      options: { 
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/verify-callback?next=/auth/reset-password`
      }
    });

    if (linkError) {
       // Se o Supabase falhar no link, tentamos o método padrão (que pode falhar no email, mas é o fallback)
       console.error("[AUTH] Erro ao gerar link de recovery:", linkError.message);
       const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
         redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-callback?next=/auth/reset-password`,
       });
       if (error) return { error: "Erro ao processar solicitação: " + error.message };
    } else if (linkData?.properties?.action_link) {
       await sendRecoveryEmail(emailToReset, "Cliente", linkData.properties.action_link);
    }

    return { success: "Instruções enviadas! Verifique sua caixa de entrada e também a pasta de spam." };
  } catch (err: any) {
    console.error("Erro interno reset-password:", err);
    return { error: "Ocorreu um erro inesperado. Tente novamente em instantes." };
  }
}

export async function updatePasswordAction(formData: FormData) {
  const newPassword = formData.get("password") as string;
  const repeatPassword = formData.get("repeatPassword") as string;

  if (!newPassword || newPassword !== repeatPassword) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: "Falha ao redefinir a senha. " + error.message };
  }

  return { success: "Senha redefinida com sucesso. Você pode voltar ao login." };
}
