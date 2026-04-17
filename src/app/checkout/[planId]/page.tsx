"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight, ShieldCheck, FileText, CheckCircle2, ShoppingCart, Globe, Server } from "lucide-react";
import { processPaymentAction } from "@/features/billing/actions/mp-actions";
import { PlanId, PLANS } from "@/features/billing/constants";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const CONTRACT_BODY = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE HOSPEDAGEM DE "WEBSITE"

CONTRATADA: RAZAO SOCIAL (ON-LINE PRODUÇÕES), com sede na Rua Soraia, nº 636, Jardim Soraia, São José do Rio Preto – SP, inscrita no CNPJ sob nº 00.000.000/0000-00.

CONTRANTE: Pessoa Física ou Jurídica, qualificada na "SOLICITAÇÃO DE SERVIÇO", que é parte integrante deste instrumento.
CLÁUSULA PRIMEIRA – DO OBJETO E ESPECIFICAÇÕES

1.1. Disponibilização de espaço em servidor compartilhado para hospedagem de "website" e domínio.
1.2. Recursos técnicos conforme o plano aderido:
    Espaço e Transferência: Variando de 100MB a 400MB de disco e 1GB a 5GB de tráfego mensal.
    Recursos: Contas de e-mail (30MB cada), Webmail, FTP, Backup diário e estatísticas.
    Tecnologias: Servidor Windows; ASP, ASP.NET, PHP, SSL, XML; Access, MYSQL.

CLÁUSULA SEGUNDA – DO SUPORTE E LIMITAÇÕES

2.1. O suporte técnico limita-se exclusivamente ao funcionamento do servidor de hospedagem.
2.2. Não estão incluídos: suporte a desenvolvimento HTML, scripts (PHP, ASP, JS), criação de bancos de dados ou design.
2.3. A CONTRATADA manterá conectividade de 99,5% ao mês, salvo interrupções para ajustes técnicos superiores a 3 horas, as quais serão comunicadas via e-mail.

CLÁUSULA TERCEIRA – DAS OBRIGAÇÕES E CONDUTAS PROIBIDAS

3.1. O CONTRATANTE é o único responsável pelo conteúdo publicado e deve garantir que não viole leis federais, estaduais ou municipais.
3.2. SPAM: É terminantemente proibido o envio de mensagens não solicitadas (SPAM), sob pena de suspensão imediata.
3.3. O CONTRATANTE deve realizar suas próprias transferências de arquivos, criação de e-mails e troca de DNS, salvo se contratados como serviços adicionais.

CLÁUSULA QUARTA – ANTIVÍRUS E SEGURANÇA

4.1. A CONTRATADA oferece antivírus para e-mails, porém não garante proteção integral contra vírus desconhecidos ou falhas do software.
4.2. A CONTRATADA não se responsabiliza por danos decorrentes de arquivos contaminados trafegados ou pelo uso indevido de senhas.

CLÁUSULA QUINTA – FINANCEIRO E REAJUSTE

5.1. Mensalidades antecipadas com vencimento todo dia 10.
5.2. O atraso gera multa de 2% e juros de 1% ao mês. Após 5 dias de atraso, o serviço será suspenso.
5.3. Se a suspensão exceder 10 dias, será cobrada taxa de reativação de R$ 15,00.
5.4. Reajuste: Os valores serão reajustados anualmente pelo IGP-DI, mediante aviso prévio de 30 dias.

CLÁUSULA SEXTA – PROTEÇÃO DE DADOS E LGPD

6.1. Ambas as partes devem cumprir a Lei 13.709/2018. A CONTRATADA manterá sigilo absoluto sobre os dados do sistema do CONTRATANTE.
6.2. Eventuais indenizações por falhas técnicas limitam-se ao valor de uma mensalidade do plano, excluindo lucros cessantes.

CLÁUSULA SÉTIMA – VIGÊNCIA E RESCISÃO

7.1. Prazo de 3 meses, prorrogável automaticamente.
7.2. Denúncia por qualquer parte com 30 dias de antecedência.
7.3. A rescisão plena exige a quitação de débitos e a efetiva retirada do DNS dos servidores da ON-LINE PRODUÇÕES.

CLÁUSULA OITAVA – DO FORO
8.1. Eleito o foro de São José do Rio Preto – SP.`;

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const planId = (params.planId as string) || "starter";
  const planDetails = PLANS[planId as PlanId];

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [domain, setDomain] = useState("");
  const [domainType, setDomainType] = useState<"new" | "existing">("existing");
  const [domainPrice, setDomainPrice] = useState<number | null>(null);
  const [checkingDomain, setCheckingDomain] = useState(false);
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Carregamento do Brick
  const [isProcessing, setIsProcessing] = useState(false); // Processamento do Pagamento
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pixData, setPixData] = useState<{qr_code: string, qr_code_base64: string} | null>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  useEffect(() => {
    console.log("[CHECKOUT] Hidratação Concluída. PlanId:", planId);
  }, [planId]);

  const contractRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mpInstance = useRef<any>(null);
  const brickInstance = useRef<any>(null);


  // 2. Inicialização do Mercado Pago com Isolamento de DOM
  useEffect(() => {
    if (step !== 2 || !planDetails || success) return;

    let isMounted = true;
    const container = containerRef.current;

    const initBrick = async (retryCount = 0) => {
      console.log(`[CHECKOUT] Iniciando Brick (Tentativa ${retryCount + 1}). SDK Presente:`, !!window.MercadoPago);
      if (!window.MercadoPago) {
        if (retryCount < 15 && isMounted) {
          setTimeout(() => initBrick(retryCount + 1), 500);
        } else {
          setErrorMsg("Gateway indisponível no momento. Por favor, recarregue a página ou verifique sua conexão.");
          setIsLoading(false);
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
        
        // Limpeza real do DOM para evitar conflitos de 'removeChild'
        if (brickInstance.current) {
          await brickInstance.current.unmount();
        }
        if (container) container.innerHTML = '';

        const settings = {
          initialization: {
            amount: (planDetails.price + (domainType === "new" ? (domainPrice || 0) : 0)),
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
              console.log("[CHECKOUT] Brick Pronto");
              if (isMounted) setIsLoading(false);
            },
            onSubmit: ({ selectedPaymentMethod, formData }: { selectedPaymentMethod: string; formData: any }) => {
              return new Promise<void>((resolve, reject) => {
                if (!isMounted) return resolve();
                console.log('[FRONTEND] selectedPaymentMethod:', selectedPaymentMethod);
                console.log('[FRONTEND] formData:', JSON.stringify(formData));
                setIsProcessing(true);
                
                processPaymentAction(planId as PlanId, { ...formData, domain, domainType, domainPrice })
                  .then(result => {
                    if (result.success) {
                      if (result.pix) {
                         setPixData(result.pix as any);
                      }
                      setStep(3);
                      setSuccess(true);
                      resolve();
                    } else {
                      setErrorMsg(result.error || "Erro de comunicação.");
                      setIsProcessing(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      reject(new Error(result.error || "Erro de comunicação.")); // Rejecting re-enables the brick UI button!
                    }
                  })
                  .catch((err: any) => {
                    setErrorMsg(err?.message || "Erro de comunicação com o servidor.");
                    setIsProcessing(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    reject(new Error(err?.message || "Erro de comunicação com o servidor."));
                  });
              });
            },
            onError: (err: any) => {
              console.error("[CHECKOUT] Erro Brick:", err);
              if (err?.type === 'non_critical') return;
              if (isMounted) {
                setErrorMsg("Erro ao carregar checkout. Tente atualizar a página.");
                setIsLoading(false);
              }
            },
          },
        };

        brickInstance.current = await bricksBuilder.create('payment', 'paymentBrick_container', settings);
      } catch (e) {
        console.error("[CHECKOUT] Falha Crítica:", e);
        if (isMounted) setErrorMsg("Falha na inicialização segura.");
      }
    };

    setIsLoading(true);
    initBrick();

    return () => {
      isMounted = false;
      if (brickInstance.current) {
        try { brickInstance.current.unmount(); } catch(e) {}
      }
    };
  }, [step, planDetails, planId, success]);

  if (!planDetails) return <div className="p-12 text-center text-red-500 font-bold">Plano Inválido.</div>;

  useEffect(() => {
    if (domainType !== 'new' || !domain || domain.length < 4) {
      setDomainAvailable(null);
      setDomainPrice(null);
      return;
    }

    const timer = setTimeout(() => {
      // Validar regex básico antes de chamar API
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
      if (domainRegex.test(domain)) {
        handleCheckDomain();
      }
    }, 1000); // Aguarda 1s após parar de digitar

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
      console.error("Erro check:", e);
    } finally {
      setCheckingDomain(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Tolerância de 5px para detectar o fim do scroll
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
              
              {/* Resumo do Pedido - Novo Compoment */}
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

              {errorMsg && (
                <div id="error-alert" className="p-4 bg-red-50 border border-red-500 rounded-lg text-red-600 text-sm font-bold text-center italic">
                  {errorMsg}
                </div>
              )}

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
                   {CONTRACT_BODY.split('8.1. ')[0]}
                   8.1. Eleito o foro de São José do Rio Preto – SP.
                 </div>
              </div>

              <label 
                 className={`flex items-start gap-4 p-4 sm:p-5 border-2 rounded-2xl transition-all ${!isScrolledToBottom ? 'opacity-40 cursor-not-allowed bg-gray-100 border-gray-200' : 'bg-blue-50/50 border-blue-400 cursor-pointer'}`}
               >
                 <input 
                   type="checkbox"
                   disabled={!isScrolledToBottom}
                   checked={agreed}
                   onChange={(e) => {
                     console.log("[CHECKOUT] Mudança Termos:", e.target.checked);
                     setAgreed(e.target.checked);
                   }}
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
                   {domainType === "new" && domainPrice && (
                     <p className="text-[9px] text-gray-400 font-bold italic uppercase tracking-tighter">
                       Inclui registro de domínio (R$ {domainPrice.toFixed(2).replace('.', ',')})
                     </p>
                   )}
                 </div>
                 
                 <button
                    type="button"
                    prev-id="btn-subscribe-step1"
                    disabled={!agreed}
                    className={`w-full sm:w-auto px-10 py-7 rounded-full shadow-2xl font-black uppercase italic tracking-widest transition-all text-white flex items-center justify-center ${agreed ? 'bg-[#DE2027] hover:scale-105 active:scale-95' : 'bg-gray-400 cursor-not-allowed'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("[CHECKOUT] Clique no botão assinar. Agreed:", agreed);
                      if (!agreed) {
                        setErrorMsg("Por favor, marque a caixa confirmando que leu e aceita os termos.");
                        return;
                      }
                      setErrorMsg(null);
                      console.log("[CHECKOUT] Transicionando para passo 2");
                      setStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                   Assinar Agora <ArrowRight className="ml-2 w-6 h-6" />
                 </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-10">
              
              {/* Resumo Rápido no topo do Pagamento */}
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

              {errorMsg && (
                <div className="p-4 mb-6 bg-red-50 border border-red-500 rounded-lg text-red-600 text-sm font-bold text-center italic">
                  {errorMsg}
                </div>
              )}

              {/* Loader isolado do container real para evitar o crash removeChild */}
              {(isLoading || isProcessing) && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-[#DE2027] mb-4" />
                  <p className="font-bold text-gray-500 italic">
                    {isProcessing ? "Verificando dados..." : "Criptografando conexão..."}
                  </p>
                </div>
              )}

              {/* Container EXCLUSIVO que o React NÃO gerencia internamente */}
              <div 
                id="paymentBrick_container" 
                ref={containerRef}
                className={isLoading ? "hidden" : "block animate-in fade-in duration-500"}
              ></div>

              {!isLoading && !isProcessing && (
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
                  <button onClick={() => setStep(1)} className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#DE2027]">
                    Voltar ao contrato
                  </button>
                  <button onClick={() => setStep(0)} className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#DE2027]">
                    Trocar domínio
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center py-10 space-y-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-3xl font-black text-[#131A26] italic uppercase tracking-tighter text-center">
                {pixData ? 'Pagamento PIX Gerado!' : 'Tudo Pronto!'}
              </h3>
              
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
                <p className="text-gray-500 font-medium text-center italic">Sua hospedagem foi ativada com sucesso e o pagamento foi processado.</p>
              )}
              
              <Button className="bg-[#131A26] text-white px-10 py-6 rounded-full font-black uppercase italic tracking-widest mt-4 w-full sm:w-auto" onClick={() => router.push('/cliente/dashboard')}>Ir ao Painel</Button>
            </div>
          )}
        </div>
      </div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 opacity-50 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#DE2027]" /> Tecnologia Mercado Pago com Segurança On-line Produções</p>
    </div>
  );
}
