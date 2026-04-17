"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Filter, Loader2, ArrowRight, ShieldCheck, Mail, AlertCircle, RefreshCcw, Users, Trash2, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { AdminToast, ToastType } from "@/components/ui/admin-toast";

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30">Ativo</span>;
    case 'pending':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">Pendente</span>;
    case 'overdue':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">Inadimplente</span>;
    case 'inactive':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-500/20 text-gray-400 border border-gray-500/30">Desativado</span>;
    case 'new':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">Novo</span>;
    case 'inativo':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">Inativo</span>;
    default:
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-500/20 text-gray-400 border border-gray-500/30">{status === 'active' ? 'Ativo' : status}</span>;
  }
}

function ClientsListBody() {
  const searchParams = useSearchParams();
  const defaultStatus = searchParams.get('status') || 'all';

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(defaultStatus);
  const [syncingAll, setSyncingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [verifyInput, setVerifyInput] = useState("");
  
  const [toast, setToast] = useState<{ show: boolean, message: string, type: ToastType }>({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
  };
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    verifyText?: string;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients?limit=100&status=${statusFilter}&search=${searchTerm}`);
      const data = await res.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    
    // Trabalhador Agressivo: Tenta processar a fila de e-mails em segundo plano
    // a cada 5 segundos para garantir o reenvio rápido solicitado.
    const processEmails = () => fetch('/api/admin/emails/process', { method: 'POST' }).catch(() => {});
    processEmails();
    const emailInterval = setInterval(processEmails, 5000);
    
    return () => clearInterval(emailInterval);
  }, [statusFilter, searchTerm]);

  const syncPending = async () => {
    const pendings = clients.filter(c => c.pending_invoices > 0);
    if (pendings.length === 0) return showToast('Nenhum pagamento pendente nesta lista para sincronizar.', "info");
    
    setSyncingAll(true);
    let updated = 0;
    
    for (const client of pendings) {
      try {
        const res = await fetch(`/api/admin/clients/${client.id}/sync-payment`, { method: 'POST' });
        const data = await res.json();
        if (data.success && data.message.includes('sincronizada')) updated++;
      } catch (e) {}
    }
    
    setSyncingAll(false);
    if (updated > 0) {
      showToast(`Sincronização global concluída! ${updated} clientes tiveram status atualizado.`);
      fetchClients();
    } else {
      showToast('Sincronização concluída. Nenhuma alteração nova no gateway.', "info");
    }
  };

  const handleDeleteClient = async (client: any) => {
    setConfirmModal({
      isOpen: true,
      title: "EXTERMINAR CONTA",
      message: `⚠️ PERIGO: Esta ação excluirá "${client.full_name}" e TODOS os dados associados definitivamente de todo o sistema. Esta ação NÃO pode ser desfeita.`,
      confirmLabel: "EXCLUIR DEFINITIVAMENTE",
      verifyText: "EXCLUIR",
      isDanger: true,
      onConfirm: async () => {
        setDeletingId(client.id);
        try {
          const res = await fetch(`/api/admin/clients/${client.id}`, { method: 'DELETE' });
          const json = await res.json();
          if (json.success) {
            showToast("Cliente excluído com sucesso.");
            fetchClients();
          } else {
            showToast(json.error || "Erro ao excluir", "error");
          }
        } catch (e) {
          showToast("Erro ao excluir cliente.", "error");
        } finally {
          setDeletingId(null);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Gestão de Clientes</h1>
            <p className="text-gray-400 text-sm font-medium">Controle total sobre assinaturas, faturas e contas.</p>
          </div>
          
          <Button 
            onClick={syncPending}
            disabled={syncingAll || loading}
            className="bg-[#131A26] border border-gray-700 hover:bg-[#1a2333] text-white flex items-center gap-2 px-4 py-2"
          >
            {syncingAll ? <Loader2 className="w-4 h-4 animate-spin text-[#DE2027]" /> : <RefreshCcw className="w-4 h-4 text-[#DE2027]" />}
            <span className="text-xs uppercase tracking-widest font-bold">Autosync (Pendentes)</span>
          </Button>
        </div>

        <div className="bg-[#0B111A] p-4 rounded-xl border border-gray-800/80 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por nome, email ou CPF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131A26] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#DE2027] transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto scrollbar-hide overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-4 h-4 text-gray-500 shrink-0 hidden md:block" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#131A26] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#DE2027] transition-colors min-w-[150px]"
            >
              <option value="all">Ver Todos</option>
              <option value="active">🟢 Ativos</option>
              <option value="pending">🟡 Pendentes</option>
              <option value="overdue">🔴 Inadimplentes</option>
              <option value="inactive">⚫ Desativados</option>
              <option value="inativo">🟠 Inativos (Não Verif.)</option>
              <option value="new">🔵 Novos (Verificados)</option>
            </select>
          </div>
        </div>

        <div className="bg-[#0B111A] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#131A26]/50 border-b border-gray-800/80 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  <th className="p-4 pl-6">Cliente</th>
                  <th className="p-4">Contato</th>
                  <th className="p-4">Cadastro em</th>
                  <th className="p-4">Situação</th>
                  <th className="p-4">Faturas Abertas</th>
                  <th className="p-4 text-right pr-6">Gerenciar</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#DE2027]" />
                      <span className="text-xs uppercase tracking-widest">Carregando dados...</span>
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Nenhum cliente encontrado com os filtros atuais.</p>
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-800/50 hover:bg-[#131A26] transition-colors">
                      <td className="p-4 pl-6">
                        <Link 
                          href={`/admsdc/clientes/${client.id}`}
                          className="block group cursor-pointer"
                        >
                          <div className="font-bold text-white mb-0.5 group-hover:text-[#DE2027] transition-colors">{client.full_name || 'Sem nome'}</div>
                          <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                            {client.cnpj ? (
                              <span className="bg-purple-500/10 text-purple-400 px-1 rounded text-[8px] border border-purple-500/20">PJ</span>
                            ) : (
                              <span className="bg-blue-500/10 text-blue-400 px-1 rounded text-[8px] border border-blue-500/20">PF</span>
                            )}
                            {client.cpf || client.cnpj || 'Sem documento'}
                          </div>
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-gray-300 text-xs mb-1">
                          <Mail className="w-3 h-3 text-gray-500" />
                          {client.email}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-600" />
                          {client.cellphone || client.phone || 'Sem telefone'}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-gray-400">
                        {new Date(client.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={client.clientStatus} />
                      </td>
                      <td className="p-4">
                        {client.pending_invoices > 0 ? (
                          <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
                            <AlertCircle className="w-3 h-3" />
                            {client.pending_invoices} pendente(s)
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6 space-x-2 flex items-center justify-end">
                        <Link 
                          href={`/admsdc/clientes/${client.id}`}
                          className="inline-flex items-center justify-center bg-[#1e293b] hover:bg-[#DE2027] text-white p-2 rounded-lg transition-colors group"
                          title="Ver Detalhes"
                        >
                          <ArrowRight className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteClient(client)}
                          disabled={deletingId === client.id}
                          className="inline-flex items-center justify-center bg-transparent hover:bg-red-500/10 text-gray-600 hover:text-red-500 p-2 rounded-lg transition-colors"
                          title="Excluir Cliente"
                        >
                          {deletingId === client.id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Admin Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0B111A] border border-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${confirmModal.isDanger ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">{confirmModal.title}</h3>
                </div>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {confirmModal.message}
                </p>

                {confirmModal.verifyText && (
                  <div className="mb-6">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Digite "{confirmModal.verifyText}" para confirmar:</p>
                    <input 
                      type="text"
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                      autoFocus
                      className="w-full bg-[#131A26] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#DE2027] transition-colors"
                      placeholder="Sua confirmação..."
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    variant="outline"
                    className="flex-1 bg-transparent border-gray-800 hover:bg-gray-800 text-gray-400"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    id="confirm-action-btn-list-global"
                    onClick={() => {
                      confirmModal.onConfirm();
                      setVerifyInput("");
                    }}
                    disabled={!!confirmModal.verifyText && verifyInput !== confirmModal.verifyText}
                    className={`flex-1 ${confirmModal.isDanger ? 'bg-[#DE2027] hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold`}
                  >
                    {confirmModal.confirmLabel || 'Confirmar'}
                  </Button>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  setVerifyInput("");
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminToast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#DE2027] mb-4" />
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Carregando Clientes...</p>
      </div>
    }>
      <ClientsListBody />
    </Suspense>
  );
}
