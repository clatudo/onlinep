"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/features/billing/constants";

const plans = [
  {
    id: "starter",
    name: "COMEÇANDO",
    price: PLANS.starter.price.toFixed(2).replace('.', ','),
    cycle: "CICLO MENSAL",
    features: [
      { text: "1 GB de Espaço", active: true },
      { text: "Tráfego Ilimitado", active: true },
      { text: "1 Conta de E-mail", active: true },
      { text: "Certificado SSL Grátis", active: true },
      { text: "Banco de dados MySQL", active: true },
      { text: "Backup Diário", active: true },
    ],
    buttonText: "CONTRATE",
    highlight: false,
    special: false
  },
  {
    id: "pro",
    name: "HOSPEDAGEM I",
    price: PLANS.pro.price.toFixed(2).replace('.', ','),
    cycle: "CICLO MENSAL",
    features: [
      { text: "10 GB de Espaço", active: true },
      { text: "Tráfego Ilimitado", active: true },
      { text: "1 Conta de E-mail (10GB)", active: true },
      { text: "Certificado SSL Grátis", active: true },
      { text: "Banco de dados MySQL", active: true },
      { text: "Backup Diário", active: true },
    ],
    buttonText: "CONTRATE AGORA",
    highlight: true,
    special: false
  },
  {
    id: "enterprise",
    name: "HOSPEDAGEM II",
    price: PLANS.enterprise.price.toFixed(2).replace('.', ','),
    cycle: "CICLO MENSAL",
    features: [
      { text: "20 GB de Espaço", active: true },
      { text: "Tráfego Ilimitado", active: true },
      { text: "10 Contas de E-mail", active: true },
      { text: "Certificado SSL Grátis", active: true },
      { text: "Banco de dados MySQL", active: true },
      { text: "Backup Diário", active: true },
    ],
    buttonText: "CONTRATE",
    highlight: false,
    special: false
  },
  {
    id: "custom",
    name: "PERSONALIZADO",
    price: null,
    cycle: null,
    description: "DESENVOLVEMOS O SERVIDOR PERFEITO PARA A SUA CARGA DE TRABALHO.",
    features: [
      { text: "Linux ou Windows", active: true },
      { text: "Espaço Sob Demanda", active: true },
      { text: "Suporte VIP Direto", active: true },
      { text: "Bancos Dedicados", active: true },
    ],
    buttonText: "FALAR CONSULTOR",
    highlight: false,
    special: true
  }
];

export function HostingPlans() {
  return (
    <section id="hospedagem" className="scroll-mt-24 pt-6 md:pt-10 pb-20 w-full bg-[#0B1121] relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-[1400px]">
        {/* Texts Header */}
        <div className="text-center w-full mb-10 relative z-10 flex flex-col items-center">
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-black italic tracking-tighter mb-4 text-white uppercase font-heading">
            Nossos Planos
          </h2>
          <p className="text-[#60739F] text-xs md:text-sm font-bold tracking-[0.1em] uppercase">
            Contratação Imediata Via Mercado Pago
          </p>
        </div>

        {/* CSS grid for 4 items side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-20 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`plan-card relative flex flex-col p-6 lg:p-8 rounded-[2rem] transition-all duration-300 ${
                plan.highlight 
                ? "bg-white shadow-[0_0_40px_rgba(222,32,39,0.3)] border-[3px] border-[#DE2027] lg:scale-105 z-10"
                : plan.special
                ? "bg-[#131A26] border border-gray-800"
                : "bg-white border border-gray-100"
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[#DE2027] text-white text-[10px] sm:text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    Recomendado
                  </span>
                </div>
              )}
              
              <h3 className={`text-xl font-extrabold italic uppercase tracking-tight mb-2 ${plan.special ? "text-white" : "text-[#131A26] font-heading"}`}>{plan.name}</h3>
              
              {plan.special && plan.description && (
                <p className="text-[#60739F] text-[10px] leading-relaxed font-bold tracking-widest uppercase mb-10 h-16 pt-2">
                  {plan.description}
                </p>
              )}

              {plan.price && (
                <div className="mt-2 mb-2 flex items-baseline font-black font-heading leading-none">
                  <span className={`text-2xl mr-1 ${plan.highlight ? "text-[#DE2027]" : "text-[#131A26]"}`}>R$</span>
                  <span className={`text-5xl tracking-tighter ${plan.highlight ? "text-[#DE2027]" : "text-[#131A26]"}`}>{plan.price}</span>
                </div>
              )}
              
              {plan.cycle && (
                <div className="mb-8">
                  <span className="text-[#60739F] text-[10px] font-bold tracking-widest uppercase italic">{plan.cycle}</span>
                </div>
              )}

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center">
                    <Check className={`w-4 h-4 mr-3 flex-shrink-0 ${plan.special ? "text-[#DE2027]" : feature.active ? "text-[#DE2027]" : "text-gray-300"}`} strokeWidth={3} />
                    <span className={`text-xs font-bold tracking-wider ${plan.special ? "text-white" : feature.active ? "text-[#435263]" : "text-gray-400"}`}>{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4">
                <Button 
                  asChild
                  className={`cursor-pointer w-full rounded-2xl py-6 text-xs font-extrabold tracking-widest uppercase transition-all ${
                    plan.highlight 
                      ? "bg-[#DE2027] text-white hover:bg-[#c81920] shadow-[0_4px_20px_rgba(222,32,39,0.3)]" 
                      : plan.special
                      ? "bg-white text-[#131A26] hover:bg-gray-100"
                      : "bg-[#F3F4F6] text-[#131A26] hover:bg-gray-200 shadow-none border-none"
                  }`}
                >
                  {plan.special ? (
                    <a href="#contato">{plan.buttonText}</a>
                  ) : (
                    <a href={`/checkout/${plan.id}`}>{plan.buttonText}</a>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé dos planos */}
        <div className="text-center mt-12">
          <p className="text-[#60739F] text-[9px] font-bold tracking-[0.2em] uppercase">
            * Valores referentes ao primeiro ciclo. Pagamentos via mercado pago.
          </p>
        </div>
      </div>
    </section>
  );
}
