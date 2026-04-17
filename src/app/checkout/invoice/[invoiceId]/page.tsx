"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ShieldCheck, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import { processInvoicePaymentAction } from "@/features/billing/actions/mp-actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export default function InvoiceCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pixData, setPixData] = useState<{qr_code: string, qr_code_base64: string} | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const brickInstance = useRef<any>(null);
  const mpInstance = useRef<any>(null);

  // 1. Buscar detalhes da fatura
  useEffect(() => {
    async function fetchInvoice() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setErrorMsg("Fatura não localizada.");
        setLoading(false);
        return;
      }
      setInvoice(data);
      setLoading(false);
    }
    fetchInvoice();
  }, [invoiceId, router]);

  // 2. Inicializar Mercado Pago Brick com Segurança Máxima
  useEffect(() => {
    // Só prosseguimos se a fatura estiver carregada, o container existir e não estivermos em sucesso
    if (loading || !invoice || !containerRef.current || success) return;

    let isMounted = true;
    const container = containerRef.current;

    const initBrick = async (retryCount = 0) => {
      // Espera pelo SDK global (carregado no layout.tsx)
      if (!window.MercadoPago) {
        if (retryCount < 15 && isMounted) {
          setTimeout(() => initBrick(retryCount + 1), 500);
        } else {
          setErrorMsg("Gateway indisponível. Recarregue a página.");
          setPaymentLoading(false);
        }
        return;
      }

      try {
        if (!mpInstance.current) {
          mpInstance.current = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, {
            locale: 'pt-BR'
          });
        }

        const bricksBuilder = mpInstance.current.bricks();
        
        // Limpeza preventiva antes de criar um novo
        if (brickInstance.current) {
          await brickInstance.current.unmount();
        }
        container.innerHTML = '';

        const settings = {
          initialization: {
            amount: Number(invoice.amount),
            payer: { email: "" }, 
          },
          customization: {
            visual: { style: { theme: 'default' } },
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              ticket: 'all',
              bankTransfer: 'all',
              maxInstallments: 1
            },
          },
          callbacks: {
            onReady: () => {
              if (isMounted) setPaymentLoading(false);
            },
            onSubmit: ({ selectedPaymentMethod, formData }: { selectedPaymentMethod: string; formData: any }) => {
              return new Promise<void>((resolve, reject) => {
                if (!isMounted) return resolve();
                console.log('[INVOICE FRONTEND] selectedPaymentMethod:', selectedPaymentMethod);
                console.log('[INVOICE FRONTEND] formData:', JSON.stringify(formData));
                setPaymentLoading(true);
                
                processInvoicePaymentAction(invoiceId, formData)
                  .then(result => {
                    if (result.success) {
                      if (result.pix) {
                         setPixData(result.pix as any);
                      }
                      setSuccess(true);
                      resolve();
                    } else {
                      setErrorMsg(result.error || "Erro de comunicação.");
                      setPaymentLoading(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      reject(new Error(result.error || "Erro de comunicação.")); // Rejecting re-enables the brick UI button!
                    }
                  })
                  .catch((err: any) => {
                    setErrorMsg("Falha na comunicação.");
                    setPaymentLoading(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    reject(new Error(err?.message || "Falha na comunicação."));
                  });
              });
            },
            onError: (err: any) => {
              console.error(err);
              if (err?.type === 'non_critical') return;
              if (isMounted) {
                setErrorMsg("Erro ao processar checkout.");
                setPaymentLoading(false);
              }
            },
          },
        };

        brickInstance.current = await bricksBuilder.create('payment', 'paymentBrick_container', settings);
      } catch (e) {
        console.error("Init Error:", e);
        if (isMounted) setErrorMsg("Erro na inicialização segura.");
      }
    };

    initBrick();

    // Cleanup crucial: desmonta o brick se o componente sair da tela
    return () => {
      isMounted = false;
      if (brickInstance.current) {
        try { brickInstance.current.unmount(); } catch(e) {}
      }
    };
  }, [invoice, loading, success]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFA]">
        <Loader2 className="w-10 h-10 animate-spin text-[#DE2027]" />
        <p className="mt-4 font-bold text-gray-500">Buscando detalhes...</p>
      </div>
    );
  }

  if (errorMsg && !invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFA] p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">{errorMsg}</h2>
        <Button className="mt-6 bg-[#131A26] text-white px-8 py-3 rounded-full" onClick={() => router.push('/cliente/faturas')}>Voltar para faturas</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFA] flex flex-col justify-center items-center py-12 px-4 font-sans text-[#131A26]">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-[2rem] shadow-xl overflow-hidden mb-4 animate-in fade-in duration-700">
        
        <div className="bg-[#131A26] p-8 text-center border-b-4 border-[#DE2027]">
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
            {success ? "Fatura Concluída" : "Checkout de Fatura"}
          </h1>
          <p className="text-gray-300 mt-2 font-medium">#{invoiceId.split('-')[0].toUpperCase()} — R$ {Number(invoice?.amount).toFixed(2).replace('.', ',')}</p>
        </div>

        <div className="p-8 md:p-10">
          
          {success ? (
            <div className="flex flex-col items-center py-10 space-y-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-3xl font-black text-[#131A26] italic uppercase tracking-tighter text-center">
                {pixData ? 'Pagamento PIX Gerado!' : 'Pagamento Confirmado!'}
              </h3>
              
              {pixData ? (
                <div className="flex flex-col items-center space-y-4 w-full text-center">
                   <p className="text-gray-500 font-medium italic">Abra o app do seu banco e escaneie o código abaixo ou use o Copia e Cola para pagar e liquidar sua fatura.</p>
                   <img src={`data:image/jpeg;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" className="w-48 h-48 border-4 border-gray-100 rounded-2xl shadow-sm" />
                   
                   <div className="w-full">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Código Copia e Cola</p>
                     <div className="flex w-full items-center gap-2">
                       <input 
                         type="text" 
                         readOnly 
                         value={pixData.qr_code} 
                         className="flex-1 text-xs bg-gray-50 border border-gray-200 p-3 rounded-lg overflow-hidden text-ellipsis"
                         onClick={(e) => (e.target as HTMLInputElement).select()}
                       />
                       <Button 
                         variant="outline" 
                         className="px-4 py-3 shrink-0"
                         onClick={() => {
                           navigator.clipboard.writeText(pixData.qr_code);
                           alert("Código Copiado com Sucesso!");
                         }}
                       >
                         Copiar
                       </Button>
                     </div>
                   </div>
                </div>
              ) : (
                <p className="text-gray-500 font-medium text-center italic">Obrigado. Sua fatura está sendo processada e o recibo já está no painel.</p>
              )}
              
              <Button className="bg-[#131A26] text-white px-10 py-6 rounded-full font-black uppercase italic tracking-widest mt-4 w-full sm:w-auto" onClick={() => router.push('/cliente/faturas')}>Voltar ao Extrato</Button>
            </div>
          ) : (
            <div className="space-y-8">
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-500 rounded-lg text-red-600 text-sm font-bold text-center italic">
                  {errorMsg}
                </div>
              )}

              {/* Loader isolado do container do Mercado Pago */}
              {paymentLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-[#DE2027] mb-4" />
                  <p className="font-bold text-gray-500 italic">Estabelecendo conexão segura...</p>
                </div>
              )}

              {/* Container EXCLUSIVO para o Mercado Pago - Mantido vazio pelo React */}
              <div 
                id="paymentBrick_container" 
                ref={containerRef}
                className={paymentLoading ? "hidden" : "block animate-in fade-in duration-500"}
              ></div>

              {!paymentLoading && (
                <div className="pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#DE2027] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 opacity-50 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#DE2027]" /> Gateway de Pagamento Produção On-line Produções</p>
    </div>
  );
}
