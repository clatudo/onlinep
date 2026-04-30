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

// Monta o objeto identification: valida tamanho antes de enviar ao MP
const buildIdentification = (formData: any, userMeta: any): { type: string; number: string } | undefined => {
  const rawType = formData.payer?.identification?.type || (userMeta?.account_type === 'pj' ? 'CNPJ' : 'CPF');
  const rawNumber = formData.payer?.identification?.number || userMeta?.cpf || userMeta?.cnpj;
  const cleanNumber = sanitizeDoc(rawNumber);

  console.log('[MP] Identification raw:', { type: rawType, rawNumber, cleanNumber, length: cleanNumber.length });

  if (!cleanNumber) {
    console.log('[MP] Identification ausente — não enviando');
    return undefined;
  }

// Valida o tamanho, mas deixa a validação matemática por conta do MercadoPago
  // (Pois em testes é muito comum usar CPFs fictícios que falham na matemática)
  const isCPF = cleanNumber.length === 11;
  const isCNPJ = cleanNumber.length === 14;

  if (!isCPF && !isCNPJ) {
    console.error('[MP] Documento com tamanho inválido:', cleanNumber.length, 'dígitos');
    throw new Error(`Documento inválido: ${cleanNumber.length} dígitos. CPF deve ter 11 e CNPJ 14 dígitos (apenas números).`);
  }

  const finalType = cleanNumber.length === 14 ? 'CNPJ' : 'CPF';
  console.log('[MP] Identification válida (tamanho OK):', { type: finalType, number: cleanNumber });
  return { type: finalType, number: cleanNumber };
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

    // Buscar CPF/CNPJ do profile no banco (fallback robusto)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('cpf, cnpj, account_type, full_name')
      .eq('id', user.id)
      .single();

    const mergedMeta = {
      ...user.user_metadata,
      cpf: profile?.cpf || user.user_metadata?.cpf,
      cnpj: profile?.cnpj || user.user_metadata?.cnpj,
      account_type: profile?.account_type || user.user_metadata?.account_type,
    };

    const nameObj = splitName(formData.fullName || profile?.full_name || user.user_metadata?.full_name || 'Cliente');
    const identification = buildIdentification(formData, mergedMeta);

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
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://onlineproducoes.com.br'}/api/webhooks/mercadopago`,
      additional_info: {
        items: [
          {
            id: planId,
            title: plan.title,
            description: plan.description,
            category_id: 'services',
            quantity: 1,
            unit_price: totalAmount,
          }
        ],
        payer: {
          first_name: nameObj.first_name,
          last_name: nameObj.last_name,
          registration_date: user.created_at,
        }
      }
    };

    console.log('[MP] paymentBody payer:', JSON.stringify(paymentBody.payer));

    if (formData.token) {
      // Cartão de crédito/débito
      paymentBody.token = formData.token;
      paymentBody.installments = formData.installments || 1;
      paymentBody.payment_method_id = formData.payment_method_id;
      if (formData.issuer_id) paymentBody.issuer_id = formData.issuer_id;
      const paymentTypeId = formData.payment_type_id || formData.paymentMethodTypeId || 'credit_card';
      paymentBody.payment_type_id = paymentTypeId;
      paymentBody.binary_mode = true;
      paymentBody.capture = true;
    } else {
      // Pix / Boleto
      paymentBody.payment_method_id = formData.payment_method_id;
    }

    console.log('[MP] FINAL paymentBody:', JSON.stringify(paymentBody, null, 2));

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
    // Log completo do erro do MercadoPago para diagnóstico
    const cause = error.cause || error.causes || error.errors || error.response?.data || {};
    console.error("=== ERRO CRÍTICO CHECKOUT ===", {
      message: error.message,
      status: error.status,
      cause: JSON.stringify(cause, null, 2),
      stack: error.stack?.split('\n').slice(0, 3).join(' | ')
    });

    // Tentar extrair uma mensagem de erro mais amigável do MP
    let errorMsg = error.message || "Erro interno no processamento do pagamento.";
    if (Array.isArray(cause)) {
      const details = cause.map((c: any) => c.description || c.message || JSON.stringify(c)).join(' | ');
      if (details) errorMsg = `Erro Mercado Pago: ${details}`;
    }

    return { success: false, error: errorMsg };
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
    
    // Buscar CPF/CNPJ do profile no banco (fallback robusto)
    const { data: profileInvoice } = await supabaseAdmin
      .from('profiles')
      .select('cpf, cnpj, account_type, full_name')
      .eq('id', user.id)
      .single();

    const mergedMetaInvoice = {
      ...user.user_metadata,
      cpf: profileInvoice?.cpf || user.user_metadata?.cpf,
      cnpj: profileInvoice?.cnpj || user.user_metadata?.cnpj,
      account_type: profileInvoice?.account_type || user.user_metadata?.account_type,
    };
    
    const nameObj = splitName(profileInvoice?.full_name || user.user_metadata?.full_name || 'Cliente');
    const identification = buildIdentification(formData, mergedMetaInvoice);

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
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://onlineproducoes.com.br'}/api/webhooks/mercadopago`,
      additional_info: {
        items: [
          {
            id: invoiceId,
            title: `Fatura #${invoiceId.split('-')[0]}`,
            category_id: 'services',
            quantity: 1,
            unit_price: Number(invoice.amount),
          }
        ],
        payer: {
          first_name: nameObj.first_name,
          last_name: nameObj.last_name,
          registration_date: user.created_at,
        }
      }
    };

    if (formData.token) {
      paymentBody.token = formData.token;
      paymentBody.installments = 1;
      paymentBody.payment_method_id = formData.payment_method_id;
      if (formData.issuer_id) paymentBody.issuer_id = formData.issuer_id;
      const paymentTypeId = formData.payment_type_id || formData.paymentMethodTypeId || 'credit_card';
      paymentBody.payment_type_id = paymentTypeId;
      paymentBody.binary_mode = true;
      paymentBody.capture = true;
    } else {
      paymentBody.payment_method_id = formData.payment_method_id;
    }

    console.log('[MP INVOICE] FINAL paymentBody:', JSON.stringify(paymentBody, null, 2));

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
    const cause = error.cause || error.causes || error.errors || error.response?.data || {};
    console.error("=== ERRO AO PAGAR FATURA ===", {
      message: error.message,
      cause: JSON.stringify(cause, null, 2)
    });
    
    let errorMsg = error.message || "Falha no pagamento da fatura.";
    if (Array.isArray(cause)) {
      const details = cause.map((c: any) => c.description || c.message || JSON.stringify(c)).join(' | ');
      if (details) errorMsg = `Erro Mercado Pago: ${details}`;
    }

    return { success: false, error: errorMsg };
  }
}
