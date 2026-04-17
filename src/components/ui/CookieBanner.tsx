"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { X, Cookie, ChevronDown, ChevronUp } from "lucide-react";

type ConsentState = "accepted" | "rejected" | "pending";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("lgpd_consent");
    if (!consent) {
      // Pequeno delay para não aparecer antes da página carregar
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss(state: ConsentState) {
    setLeaving(true);
    setTimeout(() => {
      localStorage.setItem("lgpd_consent", state);
      localStorage.setItem("lgpd_consent_date", new Date().toISOString());
      setVisible(false);
      setLeaving(false);
    }, 400);
  }

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-500 ease-in-out ${
        leaving ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      {/* Overlay escuro suave no fundo */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      <div className="bg-[#0B111A] border-t border-gray-800/80 shadow-2xl">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

          {/* Linha principal */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 py-4">

            {/* Ícone + Texto */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Cookie className="w-5 h-5 text-[#DE2027] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, personalizar conteúdo e analisar o tráfego do site, em conformidade com a{" "}
                  <span className="font-bold text-white">LGPD (Lei 13.709/2018)</span>.{" "}
                  <Link
                    href="/privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#DE2027] hover:text-red-400 underline underline-offset-2 transition-colors whitespace-nowrap"
                  >
                    Política de Privacidade
                  </Link>
                </p>

                {/* Detalhes expansíveis */}
                {showDetails && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-400">
                    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                      <p className="font-bold text-white mb-1">🔒 Essenciais</p>
                      <p>Necessários para o funcionamento do site. Sempre ativos.</p>
                    </div>
                    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                      <p className="font-bold text-white mb-1">📊 Analíticos</p>
                      <p>Nos ajudam a entender como você usa o site para melhorias.</p>
                    </div>
                    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                      <p className="font-bold text-white mb-1">🎯 Marketing</p>
                      <p>Utilizados para exibir anúncios relevantes ao seu perfil.</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowDetails((p) => !p)}
                  className="flex items-center gap-1 mt-2 text-[10px] font-bold text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest"
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="w-3 h-3" /> Ocultar detalhes
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" /> Ver detalhes
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => dismiss("rejected")}
                className="px-4 py-2.5 text-xs font-bold text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-white rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                Rejeitar opcionais
              </button>
              <button
                onClick={() => dismiss("accepted")}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#DE2027] hover:bg-red-700 rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-red-900/30"
              >
                Aceitar todos os cookies
              </button>
              <button
                onClick={() => dismiss("rejected")}
                className="p-2 text-gray-600 hover:text-gray-300 transition-colors cursor-pointer hidden sm:flex"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Barra de rodapé minimalista */}
          <div className="border-t border-gray-800/60 py-2 flex flex-wrap gap-4">
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
              Online Produções © {new Date().getFullYear()} · Todos os direitos reservados
            </span>
            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">
              CNPJ: conforme cadastro · São José do Rio Preto - SP
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
