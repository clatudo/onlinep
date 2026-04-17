"use client";

import { Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    const newErrors = { name: "", email: "", message: "" };

    if (!formData.name.trim()) {
      newErrors.name = "O nome é obrigatório";
      valid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "O e-mail é obrigatório";
      valid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Digite um e-mail válido";
      valid = false;
    }
    if (!formData.message.trim()) {
      newErrors.message = "A mensagem é obrigatória";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        
        const { error } = await supabase
          .from('leads')
          .insert([
            { 
              name: formData.name, 
              email: formData.email, 
              message: formData.message 
            }
          ]);

        if (error) throw error;

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setFormData({ name: "", email: "", message: "" });
      } catch (err) {
        console.error("Erro ao enviar lead:", err);
        alert("Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.");
      }
    }
  };

  return (
    <section id="contato" className="w-full bg-[#FAFBFA] dark:bg-accent/5 py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Side: Texts & Info */}
          <div className="flex flex-col items-start space-y-6">
            <span className="text-[#DE2027] font-bold text-xs tracking-widest uppercase font-heading">
              Fale Conosco
            </span>
            <h2 className="text-[#131A26] dark:text-gray-100 text-4xl sm:text-5xl md:text-[4rem] leading-[1.0] font-black uppercase italic tracking-tighter font-heading text-balance">
              Tire Sua Ideia <br /> Do Papel Agora.
            </h2>
            <p className="text-muted-foreground text-sm lg:text-base leading-relaxed max-w-md pt-2">
              Precisa de um novo domínio? Quer migrar sua hospedagem? Nossa equipa está pronta para atendê-lo.
            </p>

            <div className="flex flex-col space-y-6 pt-6 w-full">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10 shrink-0">
                  <Phone className="text-[#DE2027] w-5 h-5" />
                </div>
                <span className="text-[#131A26] dark:text-gray-100 font-extrabold text-lg lg:text-xl font-heading tracking-tight">
                  +55 17 98127-6065
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10 shrink-0">
                  <Mail className="text-[#DE2027] w-5 h-5" />
                </div>
                <span className="text-[#131A26] dark:text-gray-100 font-extrabold text-lg lg:text-xl font-heading tracking-tight">
                  contato@onlineproducoes.com.br
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="bg-white dark:bg-card p-8 lg:p-10 rounded-[2.5rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] dark:shadow-none border border-black/5 w-full relative">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
              
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold tracking-widest text-[#7C8899] uppercase ml-2">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Seu nome" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full bg-[#FAFBFA] dark:bg-accent/10 focus:bg-white text-sm font-medium border ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:border-[#DE2027] rounded-3xl px-6 py-4 outline-none transition-all`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{errors.name}</p>}
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold tracking-widest text-[#7C8899] uppercase ml-2">E-mail Profissional</label>
                <input 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full bg-[#FAFBFA] dark:bg-accent/10 focus:bg-white text-sm font-medium border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:border-[#DE2027] rounded-3xl px-6 py-4 outline-none transition-all`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{errors.email}</p>}
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold tracking-widest text-[#7C8899] uppercase ml-2">Como podemos ajudar?</label>
                <textarea 
                  placeholder="Descreva sua necessidade..." 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className={`w-full bg-[#FAFBFA] dark:bg-accent/10 focus:bg-white text-sm font-medium border ${errors.message ? 'border-red-500' : 'border-gray-200'} focus:border-[#DE2027] rounded-3xl px-6 py-4 h-32 resize-none outline-none transition-all`}
                ></textarea>
                {errors.message && <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{errors.message}</p>}
              </div>

              <div className="pt-2">
                <Button 
                  type="submit"
                  className="w-full bg-[#DE2027] hover:bg-[#c81920] text-white rounded-full py-7 text-xs sm:text-sm font-black tracking-widest uppercase italic font-heading shadow-[0_8px_30px_rgba(222,32,39,0.4)] hover:translate-y-[-2px] transition-all cursor-pointer"
                >
                  {success ? "Enviado com Sucesso! ✓" : "ENVIAR AGORA"}
                </Button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
