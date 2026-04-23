"use server";

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PLANS, PlanId } from '../constants';
import { sendPaymentSuccessEmail } from '@/lib/mail';

const getMPClient = () => {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  }
  return new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
  });
};

const splitName = (fullName: string) => {
  const parts = (fullName || 'Cliente Online').trim().split(/\s+/);
  const first_name = parts[0];
  const last_name = parts.length > 1 ? parts.slice(1).join(' ') : first_name;
  return { first_name, last_name };
};

// Remove tudo que não for dígito (pontos, traços, barras) — obrigatório para o MP
const sanitizeDoc = (doc: string | undefined | null): string => {
  if (!doc) return '';
  return String(doc).replace(/\D/g, '');
};

// Monta o objeto identification sem enviar número vazio ao MP
const buildIdentification = (formData: any, userMeta: any) => {
  // O Brick já preenche type e number no formData.payer.identification
  const rawType = formData.payer?.identification?.type || (userMeta?.account_type === 'pj' ? 'CNPJ' : 'CPF');
  const rawNumber = formData.payer?.identification?.number || userMeta?.cpf || userMeta?.cnpj;
  const cleanNumber = sanitizeDoc(rawNumber);

  console.log('[MP] Identification:', { type: rawType, rawNumber, cleanNumber });

  if (!cleanNumber) return undefined; // Não envia identificador vazio
  return { type: rawType, number: cleanNumber };
};

export async function processPaymentAction(planId: PlanId, formData: any) {
  const { headers } = await import('next/headers');
  
  const plan = PLANS[planId];
  if (!plan) return { success: false, error: "Plano inválido." };

  try {
    console.log("=== PAYMENT FORM DATA ===", JSON.stringify({
      hasToken: !!formData.token,
      payment_method_id: formData.payment_method_id,
      payment_type_id: formData.payment_type_id,
      issuer_id: formData.issuer_id,
      installments: formData.installments,
      payerEmail: formData.payer?.email,
    }));

    const client = getMPClient();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Você precisa estar logado." };

    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = headerList.get("user-agent") || "unknown";

    // Processar Pagamento
    const payment = new Payment(client);
    
    const totalAmount = plan.price + (formData.domainType === 'new' ? (Number(formData.domainPrice) || 0) : 0);

    const nameObj = splitName(formData.fullName || user.user_metadata?.full_name || 'Cliente');
    const identification = buildIdentification(formData, user.user_metadata);

    const paymentBody: any = {
      transaction_amount: totalAmount,
      description: `Serviços de Hospedagem - ${plan.title} ${formData.domainPrice ? '+ Domínio' : ''}`,
      external_reference: user.id,
      payer: {
        email: formData.payer?.email || user.email,
        first_name: nameObj.first_name,
        last_name: nameObj.last_name,
        ...(identification ? { identification } : {}),
      },
    };

    if (formData.token) {
      // Cartão de crédito/débito
      paymentBody.token = formData.token;
      paymentBody.installments = formData.installments || 1;
      paymentBody.payment_method_id = formData.payment_method_id;
      if (formData.issuer_id) paymentBody.issuer_id = formData.issuer_id;
    } else {
      // Pix / Boleto
      paymentBody.payment_method_id = formData.payment_method_id;
    }

    const paymentResponse = await payment.create({ body: paymentBody });

    console.log("=== MP RESPONSE ===", {
      id: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail,
    });

    // Validação estrita de status: se for recusado, falhar no checkout!
    if (paymentResponse.status === 'rejected' || paymentResponse.status === 'cancelled') {
      return { 
        success: false, 
        error: "Pagamento negado, tente com outro cartão"
      };
    }

    // Registrar Assinatura
    const subStatus = paymentResponse.status === 'approved' ? 'active' : 'pending';
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const { data: subData, error: subError } = await supabaseAdmin.from("subscriptions").insert({
      user_id: user.id,
      plan_id: planId,
      status: subStatus,
      domain: formData.domain,
      domain_type: formData.domainType,
      start_date: new Date().toISOString(),
      next_billing_date: nextBillingDate.toISOString()
    }).select().single();

    if (subError) {
      console.error("ERRO GRAVE DB:", subError);
      throw new Error("Erro ao criar assinatura no banco: " + subError.message);
    }

    // Registrar Contrato AGORA (Somente após sucesso da assinatura)
    const { error: contractError } = await supabaseAdmin
      .from("contracts")
      .insert({
        user_id: user.id,
        subscription_id: subData.id,
        plan_id: planId,
        ip_address: ip,
        user_agent: userAgent,
        agreed_at: new Date().toISOString(),
      });

    if (contractError) console.error("Erro ao registrar contrato (não fatal):", contractError.message);

    // Registrar a Fatura (Invoice) da primeira compra
    const invoiceStatus = paymentResponse.status === 'approved' ? 'paid' : 'pending';
    const { error: invoiceError } = await supabaseAdmin.from("invoices").insert({
      user_id: user.id,
      subscription_id: subData?.id,
      amount: totalAmount,
      status: invoiceStatus,
      due_date: new Date().toISOString(),
      mp_preference_id: paymentResponse.id?.toString(),
    });

    if (invoiceError) console.error("Erro ao gerar fatura inicial (não fatal para o checkout):", invoiceError.message);

    // DISPARAR E-MAIL DE CONFIRMAÇÃO SE APROVADO
    if (paymentResponse.status === 'approved') {
       await sendPaymentSuccessEmail(
         user.email!,
         formData.fullName || user.user_metadata?.full_name || 'Cliente',
         totalAmount,
         `Ativação de Plano: ${plan.title}`
       );
    }

    // Retornar APENAS dados serializáveis
    return { 
      success: true, 
      paymentId: String(paymentResponse.id ?? ''),
      status: String(paymentResponse.status ?? ''),
      status_detail: String(paymentResponse.status_detail ?? ''),
      pix: paymentResponse.payment_method_id === 'pix' && paymentResponse.point_of_interaction?.transaction_data ? {
        qr_code: paymentResponse.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: paymentResponse.point_of_interaction.transaction_data.qr_code_base64
      } : null
    };

  } catch (error: any) {
    console.error("=== ERRO CRÍTICO CHECKOUT ===", error.message, JSON.stringify(error.cause || {}));
    return { success: false, error: String(error.message || "Erro interno no processamento do pagamento.") };
  }
}

export async function processInvoicePaymentAction(invoiceId: string, formData: any) {
  try {
    console.log("=== INVOICE PAYMENT ===", JSON.stringify({
      hasToken: !!formData.token,
      payment_method_id: formData.payment_method_id,
      payerEmail: formData.payer?.email,
    }));

    const client = getMPClient();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Sessão expirada." };

    const { data: invoice } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();

    if (!invoice) return { success: false, error: "Fatura não encontrada." };

    const payment = new Payment(client);
    
    const nameObj = splitName(user.user_metadata?.full_name || 'Cliente');
    const identification = buildIdentification(formData, user.user_metadata);

    const paymentBody: any = {
      transaction_amount: Number(invoice.amount),
      description: `Pagamento Fatura #${invoiceId.split('-')[0]}`,
      external_reference: invoiceId,
      payer: {
        email: formData.payer?.email || user.email,
        first_name: nameObj.first_name,
        last_name: nameObj.last_name,
        ...(identification ? { identification } : {}),
      },
    };

    if (formData.token) {
      paymentBody.token = formData.token;
      paymentBody.installments = 1;
      paymentBody.payment_method_id = formData.payment_method_id;
      if (formData.issuer_id) paymentBody.issuer_id = formData.issuer_id;
    } else {
      paymentBody.payment_method_id = formData.payment_method_id;
    }

    const paymentResponse = await payment.create({ body: paymentBody });

    console.log("=== INVOICE MP RESPONSE ===", {
      id: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail,
    });

    // Validação estrita de status: se for recusado, falhar!
    if (paymentResponse.status === 'rejected' || paymentResponse.status === 'cancelled') {
      return { 
        success: false, 
        error: "Pagamento negado, tente com outro cartão"
      };
    }

    await supabaseAdmin
      .from("invoices")
      .update({ 
        status: paymentResponse.status === 'approved' ? 'paid' : 'pending',
        mp_preference_id: paymentResponse.id?.toString() 
      })
      .eq("id", invoiceId);

    // DISPARAR E-MAIL DE CONFIRMAÇÃO SE APROVADO (RENOVAÇÃO/FATURA INDIVIDUAL)
    if (paymentResponse.status === 'approved') {
       await sendPaymentSuccessEmail(
         user.email!,
         user.user_metadata?.full_name || 'Cliente',
         Number(invoice.amount),
         `Pagamento de Fatura #${invoiceId.split('-')[0]}`
       );
    }

    return { 
      success: true,
      paymentId: String(paymentResponse.id ?? ''),
      status: String(paymentResponse.status ?? ''),
      status_detail: String(paymentResponse.status_detail ?? ''),
      pix: paymentResponse.payment_method_id === 'pix' && paymentResponse.point_of_interaction?.transaction_data ? {
        qr_code: paymentResponse.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: paymentResponse.point_of_interaction.transaction_data.qr_code_base64
      } : null
    };

  } catch (error: any) {
    console.error("=== ERRO AO PAGAR FATURA ===", error.message, JSON.stringify(error.cause || {}));
    return { success: false, error: String(error.message || "Falha no pagamento da fatura.") };
  }
}
