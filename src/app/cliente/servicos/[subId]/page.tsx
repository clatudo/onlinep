import { createClient } from "@/lib/supabase/server";
import { Server, ArrowLeft, Globe, ShieldCheck, Mail, Database, Cpu, Activity, Settings } from "lucide-react";
import Link from "next/link";
import { PLANS, PlanId } from "@/features/billing/constants";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({ params }: { params: Promise<{ subId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { subId } = await params;

  if (!user) redirect('/auth/login');

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", subId)
    .eq("user_id", user.id)
    .single();

  if (!sub) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">Serviço não encontrado.</p>
        <Link href="/cliente/servicos" className="text-[#DE2027] font-bold mt-4 inline-block">Voltar</Link>
      </div>
    );
  }

  const planData = PLANS[sub.plan_id as PlanId] || { title: sub.plan_id };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/cliente/servicos" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-[#131A26] dark:text-gray-100">
              {planData.title}
            </h1>
            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-3 h-3 text-[#DE2027]" />
              {sub.domain || "Domínio não configurado"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
             Status: {sub.status === 'active' ? 'Ativo' : 'Pendente'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna de Informações Técnicas */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-[#0B111A] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#131A26] dark:text-gray-100 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#DE2027]" />
              Status do Servidor Windows
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Conectividade</p>
                 <p className="text-lg font-black text-green-500">99.9%</p>
               </div>
               <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CPU Load</p>
                 <p className="text-lg font-black text-blue-500 italic">BAIXO</p>
               </div>
               <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Disco</p>
                 <p className="text-lg font-black text-[#131A26] dark:text-gray-100">0.0 GB</p>
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B111A] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#131A26] dark:text-gray-100 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#DE2027]" />
              Instruções de DNS
            </h3>
            
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              {sub.domain_type === 'new' 
                ? "Seu domínio está em processo de registro. Aguarde de 2 a 24 horas para a propagação inicial."
                : "Como você já possui o domínio, aponte os NAMESERVERS para os servidores da On-line Produções abaixo:"}
            </p>

            <div className="space-y-3">
               <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Master</span>
                  <code className="text-xs font-mono text-[#DE2027] font-bold">ns1.onlineproducoes.com.br</code>
               </div>
               <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Slave 1</span>
                  <code className="text-xs font-mono text-[#DE2027] font-bold">ns2.onlineproducoes.com.br</code>
               </div>
            </div>
          </div>

        </div>

        {/* Coluna de Atalhos Rápidos */}
        <div className="space-y-6">
          <div className="bg-[#131A26] text-white rounded-2xl p-6 shadow-xl border-b-4 border-[#DE2027]">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 opacity-60 italic">Gestão Rápida</h3>
            
            <div className="space-y-2">
               <button disabled className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm font-bold opacity-50 cursor-not-allowed">
                 <Mail className="w-4 h-4 text-[#DE2027]" />
                 Criar Contas de E-mail
               </button>
               <button disabled className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm font-bold opacity-50 cursor-not-allowed">
                 <Database className="w-4 h-4 text-[#DE2027]" />
                 Gerenciar Banco Access
               </button>
               <button disabled className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm font-bold opacity-50 cursor-not-allowed">
                 <Globe className="w-4 h-4 text-[#DE2027]" />
                 Acessar via FTP
               </button>
               <button disabled className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm font-bold mt-4 opacity-50">
                 <Settings className="w-4 h-4 text-gray-400" />
                 Configurações Avançadas
               </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10">
               <p className="text-[9px] text-gray-400 uppercase font-black leading-tight italic">
                 Recursos do Servidor Windows: ASP, PHP, SSL e Bancos de Dados estão inclusos no seu plano.
               </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
