"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ArrowLeft, AlertCircle } from "lucide-react";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { getInvoicePreferenceAction } from "@/features/billing/actions/mp-actions";
import { Button } from "@/components/ui/button";

// Inicializa o Mercado Pago SDK para usar o componente Wallet (Checkout Pro)
if (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
  initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
}

export default function InvoiceCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function initRedirect() {
      try {
        // Geramos uma NOVA preferência a cada tentativa, conforme solicitado
        const result = await getInvoicePreferenceAction(invoiceId);
        
        if (result.success && result.init_point) {
          // Redireciona para o Mercado Pago imediatamente
          window.location.href = result.init_point;
        } else {
          setErrorMsg(result.error || "Erro ao gerar link de pagamento.");
          setLoading(false);
        }
      } catch (err) {
        setErrorMsg("Falha na comunicação com o gateway.");
        setLoading(false);
      }
    }
    initRedirect();
  }, [invoiceId]);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFA] p-6 text-center font-sans">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6 mx-auto" />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#131A26] mb-4">{errorMsg}</h2>
        <p className="text-gray-500 font-medium italic mb-8 max-w-md mx-auto">
          Não foi possível iniciar o pagamento. Por favor, tente novamente ou entre em contato com o suporte.
        </p>
        <Button 
          className="bg-[#131A26] text-white px-10 py-4 rounded-full font-bold italic uppercase tracking-widest hover:bg-[#DE2027] transition-all transform hover:scale-105" 
          onClick={() => router.push('/cliente/faturas')}
        >
          Voltar para faturas
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFA] font-sans">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-[#DE2027] blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <Loader2 className="w-24 h-24 animate-spin text-[#DE2027] mx-auto relative z-10" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[#131A26]">
            Redirecionando...
          </h1>
          <p className="text-gray-500 font-bold italic uppercase tracking-[0.2em] text-xs opacity-80">
            Você está sendo levado ao ambiente seguro do Mercado Pago
          </p>
        </div>

        <div className="pt-16 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 text-[12px] font-black text-gray-400 uppercase tracking-[0.3em]">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            Pagamento 100% Protegido
          </div>
          <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-[#DE2027] animate-progress-fast shadow-[0_0_15px_rgba(222,32,39,0.6)]"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress-fast {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress-fast {
          animation: progress-fast 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
