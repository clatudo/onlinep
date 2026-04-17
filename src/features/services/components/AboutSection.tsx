"use client";

import { CheckCircle2, Rocket, Shield, Users } from "lucide-react";

const stats = [
  { label: "Clientes Ativos", value: "+500", icon: Users },
  { label: "Anos de Experiência", value: "12", icon: Rocket },
  { label: "Uptime Garantido", value: "99.9%", icon: Shield },
];

export function AboutSection() {
  return (
    <section id="empresa" className="w-full bg-white py-20 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side - Content */}
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-3">
              <span className="text-[#DE2027] font-bold text-xs tracking-widest uppercase font-heading">
                A Empresa
              </span>
              <h2 className="text-[#131A26] text-4xl sm:text-5xl font-black uppercase italic tracking-tighter font-heading leading-none">
                Líder em Performance <br /> Digital desde 2012.
              </h2>
            </div>
            
            <p className="text-[#60739F] text-lg leading-relaxed font-medium">
              Na On-line Produções, não apenas hospedamos sites; construímos a fundação para o sucesso do seu negócio na web. Nossa missão é fornecer tecnologia de ponta com um toque humano que você não encontra em grandes corporações.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Infraestrutura de alta performance",
                "Suporte técnico especializado",
                "Segurança avançada de dados",
                "Soluções personalizadas",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#DE2027] w-5 h-5 flex-shrink-0" />
                  <span className="text-[#131A26] font-bold text-sm tracking-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`p-10 rounded-[2.5rem] flex flex-col space-y-4 transition-all duration-300 hover:translate-y-[-5px] ${
                  index === 0 ? "bg-[#131A26] text-white sm:col-span-2" : "bg-[#FAFBFA] border border-gray-100"
                }`}
              >
                <stat.icon className={`${index === 0 ? "text-[#DE2027]" : "text-[#131A26]"} w-10 h-10`} />
                <div className="flex flex-col">
                  <span className={`text-4xl font-black italic tracking-tighter font-heading ${index === 0 ? "text-white" : "text-[#131A26]"}`}>
                    {stat.value}
                  </span>
                  <span className={`text-xs font-bold tracking-widest uppercase ${index === 0 ? "text-gray-400" : "text-[#60739F]"}`}>
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
