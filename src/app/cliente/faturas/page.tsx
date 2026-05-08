import { createClient } from "@/lib/supabase/server";
import { Receipt, AlertCircle, CheckCircle2, FileClock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PLANS, PlanId } from "@/features/billing/constants";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FaturasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Buscar faturas com a respectiva assinatura
  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      id,
      amount,
      status,
      due_date,
      mp_payment_url,
      created_at,
      subscriptions (
        plan_id
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  function getStatusBadge(status: string) {
    switch (status) {
      case "paid":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-200"><CheckCircle2 className="w-3 h-3" /> Pago</span>;
      case "open":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200"><AlertCircle className="w-3 h-3" /> Em Aberto</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-600 border border-yellow-200"><FileClock className="w-3 h-3" /> Processando</span>;
      case "failed":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200"><AlertCircle className="w-3 h-3" /> Falhou</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">{status}</span>;
    }
  }

  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-white dark:bg-[#0B111A] p-3 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
          <Receipt className="w-8 h-8 text-[#DE2027]" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-[#131A26] dark:text-gray-100 font-heading">
            Minhas Faturas
          </h1>
          <p className="text-gray-500 text-sm mt-1">Histórico de cobranças e pagamentos abertos.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0B111A] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {(!invoices || invoices.length === 0) ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#131A26] dark:text-gray-100">Nenhuma fatura encontrada</h3>
            <p className="text-gray-500 text-sm mt-2">Você ainda não possui histórico financeiro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-widest text-gray-500">
                  <th className="p-6 font-bold"># ID Fatura</th>
                  <th className="p-6 font-bold">Serviço</th>
                  <th className="p-6 font-bold">Vencimento</th>
                  <th className="p-6 font-bold">Valor</th>
                  <th className="p-6 font-bold">Status</th>
                  <th className="p-6 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {invoices.map((inv: any) => {
                  // Lida com o fato de que joins no Supabase podem retornar objeto ou array
                  const subData = Array.isArray(inv.subscriptions) ? inv.subscriptions[0] : inv.subscriptions;
                  const planData = PLANS[(subData?.plan_id as PlanId) || "custom"];
                  const dueDate = inv.due_date ? new Date(inv.due_date).toLocaleDateString("pt-BR") : "N/A";
                  
                  return (
                    <tr key={inv.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="p-6 font-mono text-xs text-gray-400">{inv.id.split('-')[0]}</td>
                      <td className="p-6 font-bold text-[#131A26] dark:text-gray-100">
                        {planData?.title || inv.subscriptions?.plan_id || "Plano"}
                      </td>
                      <td className="p-6 text-gray-500">{dueDate}</td>
                      <td className="p-6 font-black font-heading text-[#DE2027]">R$ {Number(inv.amount).toFixed(2).replace('.', ',')}</td>
                      <td className="p-6">{getStatusBadge(inv.status)}</td>
                      <td className="p-6 text-right">
                        {inv.status === "paid" ? (
                          <span className="text-gray-400 text-xs italic">Finalizado</span>
                        ) : (
                          <Link 
                            href={`/checkout/invoice/${inv.id}`} 
                            className="inline-flex items-center gap-2 bg-[#131A26] hover:bg-[#DE2027] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                          >
                            {inv.status === "pending" ? (
                              inv.mp_payment_url ? "Ver Boleto/Pix" : "Finalizar Pagamento"
                            ) : "Pagar Agora"} <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
