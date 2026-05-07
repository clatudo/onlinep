import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type") || searchParams.get("topic");
    let resourceId = searchParams.get("data.id") || searchParams.get("id");

    if (!resourceId) {
      const body = await req.json();
      resourceId = body.data?.id || body.id || body.resource?.split("/").pop();
    }

    if (!resourceId) return NextResponse.json({ message: "No ID provided" }, { status: 400 });

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

    // FLUXO DE PAGAMENTO (PIX/BOLETO/CARTÃO AVULSO)
    if (type === "payment" || !type) {
      const paymentApi = new Payment(client);
      const payment = await paymentApi.get({ id: resourceId });
      
      if (payment && payment.external_reference) {
        const extRef = payment.external_reference;
        const mpStatus = payment.status === "approved" ? "active" : "pending";
        const invoiceStatus = payment.status === "approved" ? "paid" : "pending";
        
        // 1. Tentar encontrar se é um Checkout Inicial (external_reference == contract.id)
        const { data: contract } = await supabaseAdmin
          .from("contracts")
          .select("subscription_id")
          .eq("id", extRef)
          .single();

        if (contract && contract.subscription_id) {
          // Atualiza o status da assinatura
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: mpStatus })
            .eq("id", contract.subscription_id);

          // Atualiza a fatura inicial
          // Primeiro tenta pelo mp_preference_id (Checkout Pro)
          // Se não encontrar, tenta pelo resourceId (Pix/Antigo)
          const prefId = (payment as any).preference_id;
          
          if (prefId) {
            await supabaseAdmin
              .from("invoices")
              .update({ status: invoiceStatus, mp_payment_url: resourceId.toString() }) // Guardamos o ID do pagamento aqui se quiser
              .eq("mp_preference_id", prefId);
          } else {
            await supabaseAdmin
              .from("invoices")
              .update({ status: invoiceStatus })
              .eq("mp_preference_id", resourceId.toString());
          }
        } else {
          // 2. Se não encontrou contrato, pode ser um pagamento direto de Fatura (external_reference == invoice.id)
          const { data: invoice } = await supabaseAdmin
            .from("invoices")
            .select("id, subscription_id")
            .eq("id", extRef)
            .single();

          if (invoice) {
            await supabaseAdmin
              .from("invoices")
              .update({ status: invoiceStatus })
              .eq("id", invoice.id);

            // Reativar assinatura caso fatura seja paga
            if (payment.status === "approved" && invoice.subscription_id) {
               await supabaseAdmin
                 .from("subscriptions")
                 .update({ status: "active" })
                 .eq("id", invoice.subscription_id);
            }
          }
        }
      }
    } 

    return NextResponse.json({ message: "Webhook processed" }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
