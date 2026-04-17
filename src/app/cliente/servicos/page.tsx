import { createClient } from "@/lib/supabase/server";
import { Server, CheckCircle2, ShieldAlert, Cpu, HardDrive, FileText, ArrowRight, Globe } from "lucide-react";
import Link from "next/link";
import { PLANS, PlanId } from "@/features/billing/constants";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ServicosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Buscar assinaturas do cliente
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select(`*, contracts(id)`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  function getStatusStyle(status: string) {
    switch (status) {
      case "active":
        return { 
          bg: "bg-green-50 dark:bg-green-500/10", 
          border: "border-green-200 dark:border-green-500/20",
          text: "text-green-600 dark:text-green-400",
          icon: <CheckCircle2 className="w-4 h-4" />
        };
      case "pending":
        return { 
          bg: "bg-yellow-50 dark:bg-yellow-500/10", 
          border: "border-yellow-200 dark:border-yellow-500/20",
          text: "text-yellow-600 dark:text-yellow-400",
          icon: <ShieldAlert className="w-4 h-4" />
        };
      case "canceled":
      case "failed":
        return { 
          bg: "bg-red-50 dark:bg-red-500/10", 
          border: "border-red-200 dark:border-red-500/20",
          text: "text-red-600 dark:text-red-400",
          icon: <ShieldAlert className="w-4 h-4" />
        };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500", icon: <Server className="w-4 h-4" /> };
    }
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-[#0B111A] p-3 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
            <Server className="w-8 h-8 text-[#DE2027]" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-[#131A26] dark:text-gray-100 font-heading">
              Meus Serviços
            </h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie seus planos de hospedagem e contratos ativos.</p>
          </div>
        </div>
        <Link 
          href="/#hospedagem" 
          className="hidden md:inline-flex bg-[#131A26] hover:bg-[#DE2027] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
        >
          Contratar Novo Plano
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(!subscriptions || subscriptions.length === 0) ? (
          <div className="col-span-1 lg:col-span-2 bg-white dark:bg-[#0B111A] p-12 text-center rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <Server className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#131A26] dark:text-gray-100">Nenhum serviço ativo</h3>
            <p className="text-gray-500 text-sm mt-2 mb-6">Você ainda não possui planos de hospedagem conosco.</p>
            <Link 
              href="/#hospedagem" 
              className="inline-flex bg-[#DE2027] hover:bg-[#c81920] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
            >
              Conhecer Planos
            </Link>
          </div>
        ) : (
          subscriptions.map((sub: any) => {
            const planData = PLANS[(sub.plan_id as PlanId) || "custom"];
            const style = getStatusStyle(sub.status);
            
            return (
              <div key={sub.id} className={`bg-white dark:bg-[#0B111A] border-2 ${style.border} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative p-6`}>
                
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${style.bg} ${style.text}`}>
                       <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#131A26] dark:text-gray-100 font-heading">
                        {planData?.title || sub.plan_id}
                      </h2>
                      <div className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest ${style.text} mt-1`}>
                        {style.icon}
                        {sub.status === 'active' ? 'Ativo' : sub.status === 'pending' ? 'Aguardando Pagamento' : sub.status}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono mt-1">
                        <Globe className="w-3 h-3 text-[#DE2027]" />
                        {sub.domain || "Domínio não informado"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black font-heading tracking-tight text-[#131A26] dark:text-gray-100">
                      R$ {planData?.price?.toFixed(2).replace('.', ',') || "0,00"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">por mês</p>
                  </div>
                </div>

                {/* Detalhes do Servico */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Início</p>
                    <p className="text-sm font-medium text-[#131A26] dark:text-gray-100">
                      {new Date(sub.start_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Próxima Renovação</p>
                    <p className="text-sm font-medium text-[#131A26] dark:text-gray-100">
                      {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString("pt-BR") : "--"}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400 hover:text-[#DE2027] cursor-pointer transition-colors">
                    <FileText className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {sub.contracts && (Array.isArray(sub.contracts) ? sub.contracts.length > 0 : !!sub.contracts) 
                        ? "Contrato Assinado" 
                        : "Sem Contrato"}
                    </span>
                  </div>

                  {sub.status === "pending" ? (
                     <Link href="/cliente/faturas" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-[#DE2027] hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-full transition-colors cursor-pointer">
                       Pagar Fatura <ArrowRight className="ml-2 w-4 h-4" />
                     </Link>
                  ) : (
                     <Link href={`/cliente/servicos/${sub.id}`} className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#DE2027] border border-gray-200 dark:border-gray-800 hover:border-[#DE2027] px-4 py-2 rounded-full transition-colors cursor-pointer group">
                       Painel de Controle <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                     </Link>
                  )}
                </div>

              </div>
            )
          })
        )}
      </div>
    </>
  );
}
