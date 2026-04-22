"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/mail";
import { headers } from "next/headers";

async function getSiteUrl() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
}

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const cpf = formData.get("cpf") as string;
  const cnpj = formData.get("cnpj") as string;
  const companyName = formData.get("company_name") as string;
  const birthDate = formData.get("birth_date") as string;
  const phone = formData.get("phone") as string;
  const cellphone = formData.get("cellphone") as string;
  const accountType = formData.get("account_type") as "pf" | "pj" || "pf";

  const { redirect } = await import("next/navigation");
  
  // 1. CHECAGEM RÁPIDA DE CONFLITO (Sem limpezas complexas para não travar)
  let conflictFilter = `email.eq.${email}`;
  if (cpf && accountType === 'pf') conflictFilter += `,cpf.eq.${cpf}`;
  if (cnpj && accountType === 'pj') conflictFilter += `,cnpj.eq.${cnpj}`;

  const { data: existingUser } = await supabaseAdmin
    .from("profiles")
    .select("id, email, cpf, cnpj")
    .or(conflictFilter)
    .maybeSingle();

  if (existingUser) {
    if (existingUser.email === email) return { error: "Este e-mail já está sendo utilizado." };
    if (accountType === 'pf' && cpf && existingUser.cpf === cpf) return { error: "Este CPF já possui cadastro." };
    if (accountType === 'pj' && cnpj && existingUser.cnpj === cnpj) return { error: "Este CNPJ já possui cadastro." };
  }

  // 2. TENTAR O CADASTRO VIA ADMIN (Solução definitiva contra erro de SMTP do Supabase)
  // Usamos admin.createUser para evitar que o Supabase tente enviar e-mail pelo servidor dele, que está instável.
  const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // Forçamos a confirmação via nosso próprio e-mail SMTP
    user_metadata: {
      full_name: fullName,
      cpf: accountType === 'pf' ? cpf : null,
      cnpj: accountType === 'pj' ? cnpj : null,
      company_name: accountType === 'pj' ? fullName : null, 
      birth_date: accountType === 'pf' ? birthDate : null,
      account_type: accountType,
      phone: phone || null,
      cellphone: cellphone || null,
    }
  });

  if (createError) {
    // Se o usuário já existe no Auth mas não no Profile (raro), tentamos recuperar o ID para salvar os dados
    if (createError.message.includes("already registered")) {
       return { error: "Este e-mail já está sendo utilizado." };
    }
    return { error: createError.message };
  }

  // 3. GARANTIA DE DADOS: Persistência direta no Profile
  const userId = data.user?.id;
  if (userId) {
    try {
      const profileData = {
        id: userId,
        full_name: fullName,
        email: email,
        account_type: accountType,
        cellphone: cellphone || null,
        phone: phone || null,
        cnpj: accountType === 'pj' ? (cnpj || null) : null,
        company_name: accountType === 'pj' ? fullName : null,
        cpf: accountType === 'pf' ? (cpf || null) : null,
        birth_date: accountType === 'pf' ? (birthDate || null) : null
      };

      await supabaseAdmin.from('profiles').upsert(profileData);
      console.log(`[AUTH] Profile ${userId} persistido via Admin Pivot.`);
    } catch (upsertError) {
      console.error("[AUTH] Erro na persistência do profile:", upsertError);
    }
  }

  // 4. ENVIO DE EMAIL (Via nossa Fila e SMTP Próprio)
  try {
    const siteUrl = await getSiteUrl();
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      password: password,
      options: { redirectTo: `${siteUrl}/auth/verify-callback` }
    });

    if (linkData?.properties?.action_link) {
       const activationLink = linkData.properties.action_link;
       const { enqueueEmail } = await import("@/lib/email-queue");
       
       // Tentativa imediata (timeout curto de 3s para o admin ser rápido)
       const emailPromise = sendWelcomeEmail(email, fullName, activationLink);
       const timeoutPromise = new Promise<{success: boolean}>((resolve) => setTimeout(() => resolve({ success: false }), 3000));

       const result = await Promise.race([emailPromise, timeoutPromise]);

       if (!result.success) {
         await enqueueEmail({
           email,
           name: fullName,
           link: activationLink,
           subject: '🚀 Bem-vindo(a)! Ative sua conta na On-line Produções'
         });
       }
    }
  } catch (err) {
    console.error("[AUTH] Erro ao agendar e-mail:", err);
  }

  return { success: "Cadastro realizado com sucesso! Verifique seu e-mail para ativar a conta." };
}

export async function signInAction(formData: FormData) {
  const identifier = formData.get("identifier") as string; // Pode ser email ou cpf
  const password = formData.get("password") as string;

  console.log(`[AUTH DEBUG] Tentativa de login iniciada. Identifier: ${identifier}, origin/host (Next.js):`, await getSiteUrl());

  if (!identifier || !password) {
    console.log(`[AUTH DEBUG] E-mail/CPF ou senha ausentes.`);
    return { error: "E-mail/CPF e senha são obrigatórios." };
  }

  let emailToLogin = identifier;

  const cleanCPF = identifier.replace(/\D/g, "");
  if (cleanCPF.length === 11) {
    console.log(`[AUTH DEBUG] Identifier detectado como CPF. Formatado: ${identifier}, Limpo: ${cleanCPF}`);
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("cpf", identifier)
      .single();

    if (profile?.email) {
      emailToLogin = profile.email;
      console.log(`[AUTH DEBUG] CPF formatado encontrado. Email correspondente: ${emailToLogin}`);
    } else {
      const { data: profileClean } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("cpf", cleanCPF)
        .single();
        
      if (profileClean?.email) {
        emailToLogin = profileClean.email;
        console.log(`[AUTH DEBUG] CPF limpo encontrado. Email correspondente: ${emailToLogin}`);
      } else {
         console.log(`[AUTH DEBUG] Nenhum perfil encontrado para o CPF informado.`);
         return { error: "Nenhuma conta associada a este CPF encontrada." };
      }
    }
  }

  console.log(`[AUTH DEBUG] Iniciando Supabase Client para signInWithPassword. Email: ${emailToLogin}`);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailToLogin,
    password,
  });

  if (error) {
    console.error("[AUTH DEBUG] Erro retornado pelo Supabase no signInWithPassword:", error);
    console.error("[AUTH DEBUG] HTTP Status do erro (se houver):", error.status);
    return { error: `Erro no login: ${error.message || 'Credenciais inválidas'}` };
  }

  console.log(`[AUTH DEBUG] Login bem-sucedido. Usuário:`, data.user?.id);

  return { success: true };
}

export async function signOutAction() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase.auth.signOut();
  const { redirect } = await import("next/navigation");
  redirect("/");
}
