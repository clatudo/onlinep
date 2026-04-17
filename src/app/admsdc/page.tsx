"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, Activity, AlertTriangle, RefreshCw, BarChart } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    actives: 0,
    pendings: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca os dados iniciais do dashboard aproveitando a API de clientes
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/clients?limit=1000"); // Pega um número grande pra resumir
        if (!res.ok) throw new Error("Erro ao buscar dados");
        const data = await res.json();
        
        const clients = data.clients || [];
        setStats({
          total: clients.length,
          actives: clients.filter((c: any) => c.clientStatus === 'active').length,
          pendings: clients.filter((c: any) => c.clientStatus === 'pending').length,
          overdue: clients.filter((c: any) => c.clientStatus === 'overdue').length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const metricCards = [
    { title: "Total de Clientes", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Assinaturas Ativas", value: stats.actives, icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Aguardando Pagamento", value: stats.pendings, icon: RefreshCw, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "Inadimplentes", value: stats.overdue, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Visão Geral do Sistema</h1>
        <p className="text-gray-400 text-sm font-medium">Métricas em tempo real da carteira de clientes On-line Produções.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[...Array(4)].map((_, i) => (
             <div key={i} className="bg-[#0B111A] border border-gray-800/80 p-6 rounded-2xl h-32 animate-pulse"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((card, i) => (
            <div key={i} className="bg-[#0B111A] border border-gray-800/80 p-6 rounded-2xl relative overflow-hidden group hover:border-gray-700 transition-colors">
              <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} rounded-bl-full -mr-4 -mt-4 opacity-50`}></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{card.title}</h3>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-4xl font-black text-white relative z-10">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0B111A] border border-gray-800/80 p-6 rounded-2xl lg:col-span-2">
           <div className="flex items-center gap-3 mb-6">
             <BarChart className="w-5 h-5 text-gray-400" />
             <h3 className="text-sm font-bold text-white uppercase tracking-widest">Resumo Operacional</h3>
           </div>
           
           <div className="flex flex-col items-center justify-center p-12 border border-dashed border-gray-800 rounded-xl">
             <p className="text-gray-500 text-sm italic">Gráficos detalhados serão renderizados aqui.</p>
             <p className="text-xs text-gray-600 mt-2">Dados suficientes coletados para exibição futura.</p>
           </div>
        </div>

        <div className="bg-[#0B111A] border border-gray-800/80 p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Ações Rápidas</h3>
          
          <div className="space-y-3">
             <a href="/admsdc/clientes?status=overdue" className="flex items-center justify-between p-4 rounded-xl bg-[#131A26] border border-red-900/30 hover:bg-red-950/20 hover:border-red-500/30 transition-colors group">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">Ver Inadimplentes</span>
                <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded">{stats.overdue}</span>
             </a>
             <a href="/admsdc/clientes?status=pending" className="flex items-center justify-between p-4 rounded-xl bg-[#131A26] border border-yellow-900/30 hover:bg-yellow-950/20 hover:border-yellow-500/30 transition-colors group">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">Aprovação Pendente</span>
                <span className="bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded">{stats.pendings}</span>
             </a>
             <a href="/admsdc/clientes" className="flex items-center justify-between p-4 rounded-xl bg-[#131A26] border border-blue-900/30 hover:bg-blue-950/20 hover:border-blue-500/30 transition-colors group">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">Gerenciar Todos</span>
                <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded">{stats.total}</span>
             </a>
          </div>
        </div>
      </div>

    </div>
  );
}
