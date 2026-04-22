import nodemailer from 'nodemailer';
import { headers } from "next/headers";

/**
 * Utilitário de E-mail usando Sistema Próprio (SMTP).
 * Para funcionar, adicione as credenciais no seu arquivo .env:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */

async function getSiteUrl() {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    return process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
  } catch {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }
}

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn("[MAIL] Credenciais SMTP não encontradas no .env. O envio será simulado no log.");
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true para 465, false para outras portas
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export async function sendPaymentSuccessEmail(to: string, name: string, amount: number, description: string) {
  const transporter = getTransporter();
  const siteUrl = await getSiteUrl();

  const html = `
    <div style="font-family: sans-serif; color: #131A26; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #131A26; padding: 30px; text-align: center; border-bottom: 4px solid #DE2027;">
        <h1 style="color: #fff; margin: 0; text-transform: uppercase; font-style: italic;">On-line Produções</h1>
      </div>
      <div style="padding: 30px;">
        <p>Olá, <strong>${name}</strong>!</p>
        <p>Recebemos a confirmação do seu pagamento com sucesso.</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="font-size: 12px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Valor Confirmado</p>
          <p style="font-size: 24px; font-weight: bold; color: #DE2027; margin: 0;">R$ ${amount.toFixed(2).replace('.', ',')}</p>
          <p style="font-size: 11px; color: #999; margin-top: 5px;">${description}</p>
        </div>

        <p>Sua assinatura ou serviço já foi atualizado em nosso sistema. Você pode acompanhar tudo pelo seu painel de controle.</p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${siteUrl}/cliente/dashboard" style="background-color: #131A26; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Acessar Meu Painel</a>
        </div>
      </div>
      <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 10px; color: #999;">
        &copy; ${new Date().getFullYear()} On-line Produções - Sistema de Pagamentos Automático
      </div>
    </div>
  `;

  if (!transporter) {
    console.log("-----------------------------------------");
    console.log("[SIMULAÇÃO DE E-MAIL]");
    console.log("PARA:", to);
    console.log("ASSUNTO: ✅ Pagamento Confirmado - On-line Produções");
    console.log("CORPO (Texto):", `Olá ${name}, seu pagamento de R$ ${amount} (${description}) foi confirmado.`);
    console.log("-----------------------------------------");
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from: `"On-line Produções" <${process.env.SMTP_USER}>`,
      to,
      subject: '✅ Pagamento Confirmado - On-line Produções',
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("[MAIL ERROR]", error);
    return { success: false, error };
  }
}

/**
 * Envia e-mail de Boas-vindas e Ativação de Conta (Cadastro).
 */
export async function sendWelcomeEmail(to: string, name: string, activationLink: string) {
  const transporter = getTransporter();
  
  const html = `
    <div style="font-family: sans-serif; color: #131A26; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #131A26; padding: 40px 20px; text-align: center; border-bottom: 4px solid #DE2027;">
        <h1 style="color: #fff; margin: 0; font-size: 28px; text-transform: uppercase; font-style: italic; letter-spacing: 1px;">Bem-vindo(a) à On-line Produções!</h1>
      </div>
      <div style="padding: 40px; line-height: 1.6;">
        <p style="font-size: 18px; margin-top: 0;">Olá, <strong>${name}</strong>!</p>
        <p>Estamos muito felizes em ter você conosco! Sua conta foi criada com sucesso e está quase pronta para uso.</p>
        <p>Para sua segurança e ativação completa dos seus serviços, por favor confirme seu endereço de e-mail clicando no botão abaixo:</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${activationLink}" style="background-color: #DE2027; color: #fff; padding: 18px 35px; text-decoration: none; border-radius: 50px; font-weight: 800; font-size: 16px; display: inline-block; text-transform: uppercase; box-shadow: 0 4px 6px rgba(222, 32, 39, 0.2);">Ativar Minha Conta Agora</a>
        </div>

        <p style="font-size: 14px; color: #64748b;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
        <p style="font-size: 12px; color: #94a3b8; word-break: break-all; background: #f8fafc; padding: 10px; border-radius: 5px;">${activationLink}</p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
          Atenciosamente,<br>
          <strong>Equipe On-line Produções</strong>
        </div>
      </div>
      <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} On-line Produções - Tecnologia e Performance Digital.<br>
        Você recebeu este e-mail porque se cadastrou em onlineproducoes.com.br.
      </div>
    </div>
  `;

  if (!transporter) {
    console.log("-----------------------------------------");
    console.log("[SIMULAÇÃO DE BOAS-VINDAS]");
    console.log("PARA:", to);
    console.log("LINK ATIVAÇÃO:", activationLink);
    console.log("-----------------------------------------");
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from: `"On-line Produções" <${process.env.SMTP_USER}>`,
      to,
      subject: '🚀 Bem-vindo(a)! Ative sua conta na On-line Produções',
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("[MAIL ERROR - WELCOME]", error);
    return { success: false, error };
  }
}

/**
 * Envia e-mail de Recuperação de Senha.
 */
export async function sendRecoveryEmail(to: string, name: string, resetLink: string) {
  const transporter = getTransporter();
  
  const html = `
    <div style="font-family: sans-serif; color: #131A26; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #131A26; padding: 40px 20px; text-align: center; border-bottom: 4px solid #DE2027;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; text-transform: uppercase; font-style: italic; letter-spacing: 1px;">Recuperação de Senha</h1>
      </div>
      <div style="padding: 40px; line-height: 1.6;">
        <p style="font-size: 18px; margin-top: 0;">Olá!</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta na <strong>On-line Produções</strong>.</p>
        <p>Se você não solicitou esta alteração, pode ignorar este e-mail com segurança. Caso contrário, clique no botão abaixo para criar uma nova senha:</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetLink}" style="background-color: #131A26; color: #fff; padding: 18px 35px; text-decoration: none; border-radius: 50px; font-weight: 800; font-size: 16px; display: inline-block; text-transform: uppercase;">Redefinir Minha Senha</a>
        </div>

        <p style="font-size: 14px; color: #64748b;">Este link é válido por tempo limitado. Se o botão não funcionar, utilize o endereço abaixo:</p>
        <p style="font-size: 12px; color: #94a3b8; word-break: break-all; background: #f8fafc; padding: 10px; border-radius: 5px;">${resetLink}</p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
          Atenciosamente,<br>
          <strong>Suporte On-line Produções</strong>
        </div>
      </div>
      <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} On-line Produções.<br>
        Sistema de Segurança.
      </div>
    </div>
  `;

  if (!transporter) {
    console.log("-----------------------------------------");
    console.log("[SIMULAÇÃO DE RECUPERAÇÃO]");
    console.log("PARA:", to);
    console.log("LINK RESET:", resetLink);
    console.log("-----------------------------------------");
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from: `"Suporte On-line" <${process.env.SMTP_USER}>`,
      to,
      subject: '🔑 Recuperação de Senha - On-line Produções',
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("[MAIL ERROR - RECOVERY]", error);
    return { success: false, error };
  }
}
