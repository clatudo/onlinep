import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Rocket, Headset, Phone } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-2 md:pb-6">
      {/* Background Gradients Modernos */}
      <div className="absolute top-0 inset-x-0 h-[40rem] bg-gradient-to-b from-primary/10 via-accent/5 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-6 lg:px-12 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Headset className="w-4 h-4 mr-2" />
          Suporte Humanizado e Exclusivo para Você
        </div>
        
        <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance mb-6 sm:mb-8 uppercase">
          HOSPEDAGEM DE SITES <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SOB MEDIDA</span>
        </h1>
        
        <p className="max-w-2xl text-xl text-muted-foreground mb-10 text-balance leading-relaxed">
          Descubra o diferencial da nossa hospedagem com suporte totalmente personalizado, feito para atender às necessidades da sua empresa com rapidez e dedicação.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button asChild size="lg" className="rounded-xl text-lg h-14 px-8 shadow-xl bg-primary hover:bg-primary/90 hover:scale-105 transition-all w-full sm:w-auto">
            <a href="#hospedagem">
              Conhecer Planos
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl text-lg h-14 px-8 border-2 hover:bg-muted w-full sm:w-auto">
            <a 
              href="https://wa.me/5517981276065?text=Ol%C3%A1!%20Gostaria%20de%20uma%20consultoria%20sobre%20os%20planos%20de%20hospedagem%20da%20On-line%20Produ%C3%A7%C3%B5es." 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Phone className="mr-2 w-5 h-5" />
              Falar com Especialista
            </a>
          </Button>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 justify-center items-center w-full max-w-4xl mx-auto text-center">
          <div className="glass rounded-2xl p-6 hover:translate-y-[-5px] transition-transform duration-300 flex flex-col items-center">
             <Rocket className="text-primary w-8 h-8 mb-4" />
             <h3 className="font-bold text-lg mb-2">SSD NVMe + CDN</h3>
             <p className="text-sm text-muted-foreground">Velocidade extrema para melhor ranqueamento no Google.</p>
          </div>
          <div className="glass rounded-2xl p-6 hover:translate-y-[-5px] transition-transform duration-300 flex flex-col items-center">
             <Shield className="text-primary w-8 h-8 mb-4" />
             <h3 className="font-bold text-lg mb-2">Segurança Ativa</h3>
             <p className="text-sm text-muted-foreground">Proteção DDoS e Certificados SSL gratuitos já inclusos.</p>
          </div>
          <div className="glass rounded-2xl p-6 hover:translate-y-[-5px] transition-transform duration-300 flex flex-col items-center">
             <Headset className="text-primary w-8 h-8 mb-4" />
             <h3 className="font-bold text-lg mb-2">Suporte Humano</h3>
             <p className="text-sm text-muted-foreground">Apoio técnico especializado via WhatsApp.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
