import { MailCheck } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFA] p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-10 text-center animate-in fade-in zoom-in duration-500">
        
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8">
           <MailCheck className="text-[#DE2027] w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-[#131A26] font-heading mb-4 leading-none">
          Quase lá! <br /> Verifique seu E-mail
        </h1>
        
        <p className="text-[#60739F] font-medium leading-relaxed mb-10 text-sm">
          Acabamos de enviar um link de ativação para a sua caixa de entrada. 
          Por favor, clique nele para ativar sua conta na <strong>Online Produções</strong>.
        </p>

        <Link 
          href="/auth/login" 
          className="block w-full bg-[#131A26] hover:bg-[#252f3d] text-white rounded-full py-5 text-xs font-bold tracking-widest uppercase italic transition-all hover:scale-[1.02] shadow-lg"
        >
          Ir para o Login
        </Link>
        
        <p className="mt-8 text-[10px] text-[#9BA5B7] font-bold uppercase tracking-[0.2em] italic">
          Não recebeu nada? <span className="text-[#DE2027] cursor-pointer hover:underline">Reenviar E-mail</span>
        </p>
      </div>
    </div>
  );
}
