import { Suspense } from "react";
import { CheckCircle2, FileClock, ShieldAlert, FileText, Server, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function DashboardOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Buscar faturas pendentes/abertas
  const { data: openInvoices } = await supabase
    .from("invoices")
    .select("id, amount")
    .in("status", ["open", "pending", "failed"])
    .eq("user_id", user.id);

  // Buscar assinaturas ativas
  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("status", "active")
    .eq("user_id", user.id);

  const pendingAmount = openInvoices?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const pendingCount = openInvoices?.length || 0;
  const activeCount = activeSubs?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Resumo Faturas */}
      <div className="bg-white dark:bg-[#0B111A] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Faturas Pendentes</h3>
          <div className={`p-2 rounded-lg ${pendingCount > 0 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
            {pendingCount > 0 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
        </div>
        <p className="text-3xl font-black font-heading tracking-tight text-[#131A26] dark:text-gray-100">{pendingCount}</p>
        <p className="text-sm text-gray-400 mt-2 font-medium">Total: R$ {pendingAmount.toFixed(2).replace('.', ',')}</p>
      </div>

      {/* Resumo Serviços */}
      <div className="bg-white dark:bg-[#0B111A] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Serviços Ativos</h3>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-500/10">
            <Server className="w-5 h-5" />
          </div>
        </div>
        <p className="text-3xl font-black font-heading tracking-tight text-[#131A26] dark:text-gray-100">{activeCount}</p>
        <p className="text-sm text-gray-400 mt-2 font-medium">Hospedagens e Domínios</p>
      </div>
      
      {/* Atalho Contratos */}
      <div className="bg-gradient-to-br from-[#131A26] to-[#0B111A] rounded-2xl p-6 shadow-xl flex flex-col justify-between border border-gray-800">
        <div>
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-2">Contratos</h3>
          <p className="text-gray-400 text-xs">Visualize todos os termos assinados digitalmente.</p>
        </div>
        <div className="mt-4">
           <Link href="/cliente/servicos" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-white hover:text-[#DE2027] transition-colors cursor-pointer">
             <FileText className="w-4 h-4 mr-2" />
             Ver Meus Serviços
           </Link>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const paymentStatus = params.success as string | undefined;
  const isVerified = params.verified === "true";

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-[#131A26] dark:text-gray-100 font-heading">
          Visão Geral
        </h1>
        <p className="text-gray-500 text-sm mt-1">Acompanhe o status da sua conta e serviços.</p>
      </div>

      {/* Messages */}
      {paymentStatus === "true" && (
        <div className="mb-8 p-4 bg-green-50/80 border border-green-200 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-green-900 uppercase tracking-wider">Pagamento Aprovado</h3>
            <p className="text-green-800 text-xs font-medium mt-1">Sua transação no Mercado Pago foi processada com sucesso. Muito obrigado!</p>
          </div>
        </div>
      )}

      {paymentStatus === "pending" && (
        <div className="mb-8 p-4 bg-yellow-50/80 border border-yellow-200 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
          <FileClock className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-yellow-900 uppercase tracking-wider">Pagamento Pendente</h3>
            <p className="text-yellow-800 text-xs font-medium mt-1">Aguardando a compensação (Pix ou Boleto). Seu serviço será ativado automaticamente.</p>
          </div>
        </div>
      )}

      {paymentStatus === "false" && (
        <div className="mb-8 p-4 bg-red-50/80 border border-red-200 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
          <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider">Pagamento Não Aprovado</h3>
            <p className="text-red-800 text-xs font-medium mt-1">Houve um problema com seu pagamento ou ele foi cancelado. Você pode tentar novamente em Faturas.</p>
          </div>
        </div>
      )}
      
      {/* Mensagem de Ativação de Conta */}
      {isVerified && (
        <div className="mb-8 p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Conta Ativada com Sucesso!</h3>
            <p className="text-blue-800 text-xs font-medium mt-1">Bem-vindo(a) à nossa plataforma. Sua conta foi confirmada e você já pode utilizar todos os nossos serviços.</p>
          </div>
        </div>
      )}

      <Suspense fallback={<div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>}>
        <DashboardOverview />
      </Suspense>

      <div className="bg-white dark:bg-[#0B111A] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
         <h2 className="text-xl font-black uppercase italic tracking-tighter mb-4 text-[#131A26] dark:text-gray-100">Bem-vindo à On-line Produções</h2>
         <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
           Utilize o menu lateral para navegar entre suas faturas, acompanhar o status dos seus serviços ativos e gerenciar seus contratos de hospedagem e e-mail.
         </p>
      </div>
    </>
  );
}
