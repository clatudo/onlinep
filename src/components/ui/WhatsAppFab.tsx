"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function WhatsAppFab() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Atraso intencional para exibir o FAB e chamar a atenção após carregamento
    const timer = setTimeout(() => setIsVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Não mostrar o botão de WhatsApp dentro da área administrativa
  if (pathname?.startsWith('/admsdc')) return null;

  const whatsappNumber = "5517981276065"; 
  const defaultMessage = encodeURIComponent("Olá! Gostaria de uma consultoria sobre os planos de hospedagem da On-line Produções.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  if (!isVisible) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 hover:bg-[#1ebd57] transition-all duration-300 group"
      aria-label="Falar conosco no WhatsApp"
    >
      <div className="absolute inset-0 rounded-full border border-white/40 animate-ping opacity-50 pointer-events-none" />
      <MessageCircle className="w-7 h-7" />
      
      {/* Tooltip Hover Intentional */}
      <span className="absolute right-16 px-4 py-2 bg-foreground text-background text-sm font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
        Atendimento Humano
      </span>
    </a>
  );
}
