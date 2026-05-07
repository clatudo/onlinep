"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight, ShieldCheck, FileText, CheckCircle2, ShoppingCart, Globe, Server, AlertCircle } from "lucide-react";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { createPreferenceAction } from "@/features/billing/actions/mp-actions";
import { PlanId, PLANS } from "@/features/billing/constants";
import { Button } from "@/components/ui/button";

// Inicializa o Mercado Pago
if (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
  initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
}

const CONTRACT_BODY = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE HOSPEDAGEM DE SITES

1. OBJETO
O presente contrato tem por objeto a prestação de serviços de hospedagem de sites e registro de domínios na infraestrutura da contratada.

2. PREÇO E PAGAMENTO
O usuário compromete-se a pagar o valor referente ao plano escolhido no ato da contratação. A ativação dos serviços ocorre após a confirmação do pagamento.

3. PRAZO
Este contrato tem validade mensal, renovando-se automaticamente mediante o pagamento da mensalidade subsequente.

4. CANCELAMENTO
O cancelamento pode ser solicitado a qualquer momento através do painel do cliente, sem multas rescisórias, interrompendo a próxima cobrança.

5. SUPORTE
O suporte técnico será prestado através dos canais oficiais (ticket e e-mail) em horário comercial.

6. RESPONSABILIDADE
A contratada não se responsabiliza pelo conteúdo publicado pelo usuário, bem como por backups não realizados pelo contratante.

7. PRIVACIDADE
Os dados do usuário serão tratados com confidencialidade e segurança, em conformidade com a Lei Geral de Proteção de Dados (LGPD).

8. FORO
8.1. Eleito o foro de São José do Rio Preto – SP.`;

function CheckoutContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = (params.planId as string) || "starter";
  const planDetails = PLANS[planId as PlanId];

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  
  // Estados de Domínio - Inicializados via URL se houver retorno do MP
  const [domain, setDomain] = useState(searchParams.get("domain") || "");
  const [domainType, setDomainType] = useState<"new" | "existing">((searchParams.get("domainType") as "new" | "existing") || "existing");
  const [domainPrice, setDomainPrice] = useState<number | null>(null);
  const [checkingDomain, setCheckingDomain] = useState(false);
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{qr_code: string, qr_code_base64: string} | null>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  // Detectar retorno de erro do Mercado Pago e Logs de Depuração
  useEffect(() => {
    const success = searchParams.get("success");
    const status = searchParams.get("status");
    const domainFromUrl = searchParams.get("domain");
    
    console.log("[CHECKOUT] Retorno MP:", { success, status, domainFromUrl });
    
    if (success === "false" || status === "rejected" || status === "cancelled") {
      setErrorMsg("O pagamento não pôde ser concluído ou foi recusado. Por favor, revise seus dados ou tente outro meio de pagamento.");
    }
  }, [searchParams]);

  const contractRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  if (!planDetails) return <div className="p-12 text-center text-red-500 font-bold">Plano Inválido.</div>;

  useEffect(() => {
    if (domainType !== 'new' || !domain || domain.length < 4) {
      setDomainAvailable(null);
      setDomainPrice(null);
      return;
    }

    const timer = setTimeout(() => {
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
      if (domainRegex.test(domain)) {
        handleCheckDomain();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [domain, domainType]);

  const handleCheckDomain = async () => {
    if (!domain || domain.length < 4) return;
    setCheckingDomain(true);
    setDomainAvailable(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/domains/check?domain=${domain}`);
      const data = await res.json();
      if (data.available !== undefined) {
        setDomainAvailable(data.available);
        if (data.available) setDomainPrice(data.price);
      } else {
        setErrorMsg(data.error || "Formato de domínio inválido.");
        setDomainAvailable(null);
      }
    } catch (e: any) {
      setErrorMsg("Erro de conexão ao verificar domínio. Tente novamente.");
    } finally {
      setCheckingDomain(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setIsScrolledToBottom(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFA] flex flex-col justify-center items-center py-12 px-4 font-sans text-[#131A26]">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-[2rem] shadow-xl overflow-hidden mb-4 animate-in fade-in duration-700">
        
        <div className="bg-[#131A26] p-8 text-center border-b-4 border-[#DE2027]">
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
            Finalizar Contratação
          </h1>
          <p className="text-gray-300 mt-2 font-medium">Plano: <strong className="text-white">{planDetails.title}</strong></p>
        </div>

        <div className="p-8 md:p-10">
          
          {errorMsg && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl animate-in slide-in-from-top duration-500 shadow-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600 w-6 h-6 shrink-0" />
                <p className="text-red-700 font-bold text-sm italic leading-tight">
                  {errorMsg}
                </p>
              </div>
            </div>
          )}

          {step === 0 && (
            <div className="space-y-8">
              <div className="space-y-4 text-center mb-8">
                <h2 className="text-xl font-extrabold text-[#131A26]">Informações do Domínio</h2>
                <p className="text-gray-500 text-sm">Todo plano de hospedagem precisa de um domínio associado.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setDomainType("new")}
                  className={`p-6 border-2 rounded-2xl text-left transition-all ${domainType === "new" ? "border-[#DE2027] bg-red-50/30" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${domainType === "new" ? "bg-[#DE2027] text-white" : "bg-gray-100 text-gray-500"}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm uppercase mb-1">Novo Domínio</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Quero registrar um novo domínio para o meu site.</p>
                </button>

                <button 
                  onClick={() => setDomainType("existing")}
                  className={`p-6 border-2 rounded-2xl text-left transition-all ${domainType === "existing" ? "border-[#DE2027] bg-red-50/30" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${domainType === "existing" ? "bg-[#DE2027] text-white" : "bg-gray-100 text-gray-500"}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm uppercase mb-1">Domínio Existente</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Já possuo um domínio e quero apenas a hospedagem.</p>
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Endereço do Domínio (ex: meusite.com.br)</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={domain}
                    onChange={(e) => {
                      setDomain(e.target.value.toLowerCase());
                      setDomainAvailable(null);
                      setDomainPrice(null);
                    }}
                    placeholder="exemplo.com.br"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-[#131A26] font-bold focus:outline-none focus:border-[#DE2027] transition-colors"
                  />
                  {domainType === "new" && (
                    <button
                      onClick={handleCheckDomain}
                      disabled={checkingDomain || !domain || domain.length < 4}
                      className="bg-[#131A26] hover:bg-black text-white px-6 rounded-xl font-bold text-xs uppercase transition-colors disabled:bg-gray-300 flex items-center gap-2"
                    >
                      {checkingDomain ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar"}
                    </button>
                  )}
                </div>
                
                {domainAvailable !== null && domainType === "new" && (
                  <div className={`text-xs font-bold italic p-3 rounded-lg ${domainAvailable ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {domainAvailable 
                      ? `✅ Domínio DISPONÍVEL! Valor de registro: R$ ${domainPrice?.toFixed(2).replace('.', ',')} /ano` 
                      : "❌ Desculpe, este domínio já está em uso. Tente outro."}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100 text-right">
                <button
                  disabled={!domain || domain.length < 4 || (domainType === "new" && !domainAvailable)}
                  onClick={() => setStep(1)}
                  className={`px-10 py-5 rounded-full font-black uppercase italic tracking-widest transition-all text-white flex items-center justify-center ml-auto ${domain && domain.length >= 4 && (domainType === "existing" || domainAvailable) ? "bg-[#131A26] hover:scale-105 active:scale-95 shadow-xl" : "bg-gray-300 cursor-not-allowed"}`}
                >
                  Continuar para o Contrato <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-3 h-3" /> Resumo do Pedido
                </h3>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 font-bold text-[#131A26]">
                         <Server className="w-4 h-4 text-[#DE2027]" />
                         {planDetails.title}
                      </div>
                      <span className="font-mono text-gray-500">R$ {planDetails.price.toFixed(2).replace('.', ',')}</span>
                   </div>
                   {domainType === "new" && domainPrice && (
                     <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 font-bold text-[#131A26]">
                           <Globe className="w-4 h-4 text-[#DE2027]" />
                           Registro de Domínio ({domain})
                        </div>
                        <span className="font-mono text-gray-500">R$ {domainPrice.toFixed(2).replace('.', ',')}</span>
                     </div>
                   )}
                   {domainType === "existing" && (
                     <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 font-bold text-gray-400">
                           <Globe className="w-4 h-4" />
                           Domínio Existente ({domain})
                        </div>
                        <span className="text-[10px] uppercase font-bold text-green-600">Incluso</span>
                     </div>
                   )}
                   <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-[#131A26]">Total a Pagar</span>
                      <span className="text-xl font-black text-[#DE2027]">
                        R$ {(planDetails.price + (domainType === "new" ? (domainPrice || 0) : 0)).toFixed(2).replace('.', ',')}
                      </span>
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                 <h2 className="text-lg font-extrabold flex items-center gap-2">
                   <FileText className="w-5 h-5 text-[#DE2027]" />
                   Termos do Contrato
                 </h2>
                 <div 
                   ref={contractRef}
                   onScroll={handleScroll}
                   className="bg-gray-50 border border-gray-200 rounded-xl p-6 h-72 overflow-y-auto text-xs font-mono text-gray-700 whitespace-pre-wrap shadow-inner leading-relaxed"
                 >
                   {CONTRACT_BODY}
                 </div>
              </div>

              <label 
                 className={`flex items-start gap-4 p-4 sm:p-5 border-2 rounded-2xl transition-all ${!isScrolledToBottom ? 'opacity-40 cursor-not-allowed bg-gray-100 border-gray-200' : 'bg-blue-50/50 border-blue-400 cursor-pointer'}`}
               >
                 <input 
                   type="checkbox"
                   disabled={!isScrolledToBottom}
                   checked={agreed}
                   onChange={(e) => setAgreed(e.target.checked)}
                   className={`mt-1 w-5 h-5 sm:w-6 sm:h-6 accent-[#DE2027] ${!isScrolledToBottom ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                 />
                 <div>
                   <p className="text-xs sm:text-sm font-black text-[#131A26] uppercase italic tracking-tight">Eu li e aceito os termos</p>
                   {!isScrolledToBottom ? (
                     <p className="text-[9px] sm:text-[10px] text-red-500 mt-1 font-bold uppercase tracking-tighter">Por favor, role o contrato até o fim para liberar</p>
                   ) : (
                     <p className="text-[10px] sm:text-xs text-gray-500 mt-1 font-medium italic">Marque esta caixa para prosseguir.</p>
                   )}
                 </div>
              </label>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
                 <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Investimento Mensal</p>
                   <p className="text-4xl font-black text-[#131A26]">
                     R$ {(planDetails.price + (domainType === "new" ? (domainPrice || 0) : 0)).toFixed(2).replace('.', ',')}
                   </p>
                 </div>
                 
                 <button
                    type="button"
                    disabled={!agreed}
                    className={`w-full sm:w-auto px-10 py-7 rounded-full shadow-2xl font-black uppercase italic tracking-widest transition-all text-white flex items-center justify-center ${agreed ? 'bg-[#DE2027] hover:scale-105 active:scale-95' : 'bg-gray-400 cursor-not-allowed'}`}
                    onClick={async (e) => {
                       e.preventDefault();
                       setIsLoading(true);
                       setErrorMsg(null);
                       try {
                         const result = await createPreferenceAction(planId as PlanId, { domain, domainType, domainPrice });
                         if (result.success && result.preferenceId) {
                           setPreferenceId(result.preferenceId);
                           setStep(2);
                         } else {
                           setErrorMsg(result.error || "Erro ao gerar preferência.");
                         }
                       } catch (err) {
                         setErrorMsg("Erro de conexão.");
                       } finally {
                         setIsLoading(false);
                       }
                     }}
                   >
                    Assinar Agora <ArrowRight className="ml-2 w-6 h-6" />
                  </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-10">
              <div className="bg-[#131A26] text-white rounded-2xl p-4 mb-8 flex justify-between items-center shadow-lg">
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total da Contratação</p>
                    <p className="text-lg font-black text-white italic">
                      R$ {(planDetails.price + (domainType === "new" ? (domainPrice || 0) : 0)).toFixed(2).replace('.', ',')}
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{planDetails.title}</p>
                    <p className="text-[10px] font-mono text-gray-400">{domain}</p>
                 </div>
              </div>

              <div className="animate-in fade-in duration-500 min-h-[150px]">
                {preferenceId ? (
                  <Wallet initialization={{ preferenceId }} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-[#DE2027] mb-4" />
                    <p className="font-bold text-gray-500 italic">Preparando pagamento...</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
                <button onClick={() => setStep(1)} className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#DE2027]">
                  Voltar ao contrato
                </button>
                <button onClick={() => setStep(0)} className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#DE2027]">
                  Trocar domínio
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-10 text-center space-y-6 animate-in zoom-in duration-500">
               <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-12 h-12" />
               </div>
               <h2 className="text-3xl font-black uppercase italic tracking-tighter text-[#131A26]">
                 {pixData ? 'Pagamento PIX Gerado!' : 'Assinatura Realizada!'}
               </h2>
               
               {pixData ? (
                 <div className="flex flex-col items-center space-y-4 w-full text-center">
                    <p className="text-gray-500 font-medium italic">Abra o app do seu banco e escaneie o código abaixo ou use o Copia e Cola para pagar e ativar sua hospedagem.</p>
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
                 <p className="text-gray-500 font-medium max-w-md mx-auto">
                   Tudo pronto! Sua assinatura foi processada e sua hospedagem está sendo ativada.
                 </p>
               )}

               <button 
                onClick={() => router.push("/cliente/dashboard")}
                className="bg-[#131A26] hover:bg-black text-white px-12 py-5 rounded-full font-black uppercase italic tracking-widest transition-all shadow-xl hover:scale-105 mt-6"
               >
                 Acessar meu Painel
               </button>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
             <ShieldCheck className="w-3 h-3 text-green-500" /> Tecnologia Mercado Pago com Segurança On-line Produções
           </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFA]">
        <Loader2 className="w-12 h-12 animate-spin text-[#DE2027]" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
