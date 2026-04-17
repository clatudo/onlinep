import Link from "next/link";
import { CreditCard } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#050B14] text-white pt-20 pb-8 border-t border-gray-900">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
        
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">
          
          {/* Left Summary */}
          <div className="lg:col-span-5 flex items-center">
            <p className="text-[#60739F] font-medium text-sm md:text-base md:leading-relaxed max-w-sm">
              Expertise em soluções de hospedagem premium e desenvolvimento de alta performance. Sua empresa sempre conectada.
            </p>
          </div>

          {/* Right Links */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:ml-auto w-full lg:w-3/4">
            
            {/* Column 1 */}
            <div className="flex flex-col space-y-6">
              <Link href="#" className="text-[#60739F] hover:text-white transition-colors text-[10px] font-bold tracking-[0.15em] uppercase">INÍCIO</Link>
              <Link href="#servicos" className="text-[#60739F] hover:text-white transition-colors text-[10px] font-bold tracking-[0.15em] uppercase">SERVIÇOS</Link>
              <Link href="#portfolio" className="text-[#60739F] hover:text-white transition-colors text-[10px] font-bold tracking-[0.15em] uppercase">PORTFÓLIO</Link>
              <Link href="#hospedagem" className="text-[#60739F] hover:text-white transition-colors text-[10px] font-bold tracking-[0.15em] uppercase">HOSPEDAGEM</Link>
              <Link href="#contato" className="text-[#DE2027] hover:text-white transition-colors text-[10px] font-bold tracking-[0.15em] uppercase">CONTATO</Link>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col space-y-6">
              <Link href="#empresa" className="text-[#60739F] hover:text-white transition-colors text-[10px] font-bold tracking-[0.15em] uppercase">A EMPRESA</Link>
              <Link href="#" className="text-[#60739F] hover:text-white transition-colors text-[10px] font-bold tracking-[0.15em] uppercase">ÁREA DO CLIENTE</Link>
              <Link href="#" className="text-[#60739F] hover:text-white transition-colors text-[10px] font-bold tracking-[0.15em] uppercase">TERMOS DE USO</Link>
              <Link href="#" className="text-[#60739F] hover:text-white transition-colors text-[10px] font-bold tracking-[0.15em] uppercase">PRIVACIDADE</Link>
              <Link href="#hospedagem" className="text-[#DE2027] hover:text-white transition-colors text-[10px] font-bold tracking-[0.15em] uppercase">ASSINAR AGORA</Link>
            </div>

          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-900 border-opacity-50">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto text-center sm:text-left">
            <div className="flex items-center gap-2 border border-gray-800 bg-[#0B111A] rounded-full px-5 py-2.5">
              <CreditCard className="w-4 h-4 text-[#60739F]" strokeWidth={2} />
              <span className="text-[#60739F] text-[9px] font-bold tracking-[0.2em] uppercase">
                Pagamentos Seguros
              </span>
            </div>
            <span className="text-[#3A455E] text-[9px] font-bold tracking-[0.2em] uppercase">
              Online Produções. São José do Rio Preto - SP
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#3A455E] text-[9px] font-bold tracking-[0.2em] uppercase">
              Redefining Performance
            </span>
            <span className="text-[#DE2027] text-[9px] font-bold tracking-[0.2em] uppercase">
              #ALWAYSON
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}
