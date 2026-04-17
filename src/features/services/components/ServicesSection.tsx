import { Server, AppWindow, Zap, Globe, Mail, Shield } from "lucide-react";

const services = [
  {
    icon: Server,
    title: "Manutenção de Site",
    description: "Cuidamos da saúde do seu site, atualizações e correções para que ele nunca pare."
  },
  {
    icon: AppWindow,
    title: "Criação de Site",
    description: "Desenvolvemos sites institucionais modernos, responsivos e focados em conversão."
  },
  {
    icon: Zap,
    title: "Loja Virtual / E-commerce",
    description: "Plataformas de venda robustas com gestão simplificada para o seu negócio crescer."
  },
  {
    icon: Globe,
    title: "Domínio Nacional/Inter.",
    description: "Registramos o nome da sua marca com as melhores extensões do mercado."
  },
  {
    icon: Mail,
    title: "Hospedagem de E-mail",
    description: "E-mails personalizados (contato@suaempresa.com) para passar credibilidade total."
  },
  {
    icon: Shield,
    title: "Segurança Avançada",
    description: "Firewalls e certificados SSL para garantir que os dados dos seus clientes estejam protegidos."
  }
];

export function ServicesSection() {
  return (
    <section id="servicos" className="w-full bg-[#FAFBFA] dark:bg-accent/5 pt-6 md:pt-10 pb-6 md:pb-10 flex flex-col items-center relative overflow-hidden scroll-mt-24">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col items-center text-center mb-6 md:mb-8 space-y-3 z-10 px-4">
        <span className="text-[#DE2027] font-bold text-xs sm:text-sm tracking-[0.2em] uppercase font-heading">
          Soluções
        </span>
        <h2 className="text-[#131A26] dark:text-gray-100 text-4xl sm:text-5xl md:text-[3.5rem] leading-[1.1] font-black uppercase italic tracking-tighter font-heading">
          O Que Fazemos
        </h2>
      </div>

      {/* CARDS GRID */}
      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index} 
                className="bg-white dark:bg-card p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-black/5 hover:translate-y-[-5px] transition-transform duration-300 flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10 mb-6">
                  <Icon className="text-[#DE2027] w-6 h-6" strokeWidth={2} />
                </div>
                <h3 className="text-[#131A26] dark:text-gray-100 font-bold text-xl mb-3 tracking-tight">
                  {service.title}
                </h3>
                <p className="text-sm text-[#666] dark:text-gray-400 leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
