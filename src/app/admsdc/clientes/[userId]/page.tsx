"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, Mail, Phone, Calendar, RefreshCcw, Power, PowerOff, ShieldCheck, FileText, Receipt, CheckCircle2, Trash2, AlertCircle, X, Server, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, PlanId } from "@/features/billing/constants";
import { motion, AnimatePresence } from "framer-motion";
import { AdminToast, ToastType } from "@/components/ui/admin-toast";

export default function ClientDetail() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingSub, setDeletingSub] = useState<string | null>(null);
  const [deletingContract, setDeletingContract] = useState<string | null>(null);
  const [settlingInvoice, setSettlingInvoice] = useState<string | null>(null);
  
  const [toast, setToast] = useState<{ show: boolean, message: string, type: ToastType }>({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
  };
  const [verifyInput, setVerifyInput] = useState("");
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

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/clients/${userId}`);
      if (!res.ok) throw new Error("Cliente não encontrado.");
      const json = await res.json();
      setData(json);
    } catch (error) {
      showToast("Erro ao buscar dados do cliente.", "error");
      router.push('/admsdc/clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/admin/clients/${userId}/sync-payment`, { method: 'POST' });
      const json = await res.json();
      showToast(json.message || json.error, json.success ? "success" : "error");
      if (json.success) fetchData();
    } catch (e) {
      showToast("Erro na sincronização.", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleStatus = async (currentStatus: string) => {
    const action = currentStatus === 'active' ? 'deactivate' : 'activate';
    
    setConfirmModal({
      isOpen: true,
      title: `${action === 'activate' ? 'Ativar' : 'Desativar'} Usuário`,
      message: `Tem certeza que deseja ${action === 'activate' ? 'ATIVAR' : 'DESATIVAR'} este cliente?`,
      confirmLabel: action === 'activate' ? 'Ativar Agora' : 'Desativar Agora',
      isDanger: action === 'deactivate',
      onConfirm: async () => {
        setToggling(true);
        try {
          const res = await fetch(`/api/admin/clients/${userId}/toggle-status`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
          });
          const json = await res.json();
          showToast(json.message || json.error, json.success ? "success" : "error");
          if (json.success) fetchData();
        } catch (e) {
          showToast("Erro ao alterar status.", "error");
        } finally {
          setToggling(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };
  const handleDeleteSubscription = async (subId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Excluir Plano",
      message: "⚠️ ATENÇÃO: Esta ação excluirá este plano e TODAS as faturas/contratos ligados a ele DEFINITIVAMENTE. Deseja continuar?",
      confirmLabel: "Sim, Excluir Tudo",
      isDanger: true,
      onConfirm: async () => {
        setDeletingSub(subId);
        try {
          const res = await fetch(`/api/admin/clients/${userId}/subscriptions/${subId}`, { method: 'DELETE' });
          const json = await res.json();
          if (json.success) {
            showToast("Plano removido com sucesso.");
            fetchData();
          } else {
            showToast(json.error, "error");
          }
        } catch (e) {
          showToast("Erro ao excluir plano.", "error");
        } finally {
          setDeletingSub(null);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeleteContract = async (contractId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Excluir Registro de Contrato",
      message: "⚠️ Esta ação removerá o registro de aceite deste contrato permanentemente. Deseja continuar?",
      confirmLabel: "Sim, Excluir Registro",
      isDanger: true,
      onConfirm: async () => {
        setDeletingContract(contractId);
        try {
          const res = await fetch(`/api/admin/clients/${userId}/contracts/${contractId}`, { method: 'DELETE' });
          const json = await res.json();
          if (json.success) {
            showToast("Registro de contrato removido.");
            fetchData();
          } else {
            showToast(json.error, "error");
          }
        } catch (e) {
          showToast("Erro ao excluir contrato.", "error");
        } finally {
          setDeletingContract(null);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleSettleInvoice = async (invoiceId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Dar Baixa Manual",
      message: "Confirma o recebimento manual deste pagamento? Isso ativará imediatamente o serviço do cliente caso esteja pendente.",
      confirmLabel: "Sim, Confirmar Pagamento",
      onConfirm: async () => {
        setSettlingInvoice(invoiceId);
        try {
          const res = await fetch(`/api/admin/clients/${userId}/invoices/${invoiceId}/settle`, { method: 'POST' });
          const json = await res.json();
          if (json.success) {
            showToast(json.message);
            fetchData();
          } else {
            showToast(json.error, "error");
          }
        } catch (e) {
          showToast("Erro ao processar baixa manual.", "error");
        } finally {
          setSettlingInvoice(null);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeleteClient = async () => {
    setConfirmModal({
      isOpen: true,
      title: "EXTERMINAR CONTA",
      message: "⚠️ PERIGO RESTRITO: Esta ação excluirá este cliente e TODOS os seus dados definitivamente de todo o sistema. Esta ação NÃO pode ser desfeita.",
      confirmLabel: "EXCLUIR DEFINITIVAMENTE",
      verifyText: "EXCLUIR",
      isDanger: true,
      onConfirm: async () => {
        setDeleting(true);
        try {
          const res = await fetch(`/api/admin/clients/${userId}`, { method: 'DELETE' });
          const json = await res.json();
          if (json.success) {
            showToast("Cliente excluído com sucesso.");
            router.push('/admsdc/clientes');
          } else {
            showToast(json.error, "error");
            setDeleting(false);
          }
        } catch (e) {
          showToast("Erro ao excluir cliente.", "error");
          setDeleting(false);
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#DE2027] mb-4" />
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Carregando Dossiê...</p>
      </div>
    );
  }

  if (!data) return null;

  const profile = data.profile;
  const subscriptions = data.subscriptions || [];
  const contracts = data.contracts || [];
  
  // Pega a assinatura mais recente para ações principais
  const latestSub = subscriptions[0];
  const isActive = latestSub?.status === 'active';

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Top Bar */}
      <div className="flex items-center gap-4 border-b border-gray-800/80 pb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-[#131A26] rounded-xl transition-colors text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Dossiê do Cliente</h1>
          <p className="text-gray-500 text-xs font-mono mt-1">ID: {profile.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Perfil e Ações Rápidas */}
        <div className="space-y-6">
          
          {/* Card Principal de Info */}
          <div className="bg-[#0B111A] border border-gray-800/80 p-6 rounded-2xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            
            <div className="flex items-start justify-between mb-6">
               <div className="w-16 h-16 bg-[#131A26] rounded-2xl flex items-center justify-center border border-gray-800">
                 <User className="w-8 h-8 text-gray-400" />
               </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {latestSub?.status === 'active' ? 'Ativo' : (latestSub?.status === 'pending' ? 'Pendente' : (latestSub?.status || 'Sem Plano'))}
                  </span>
                </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-4">{profile.full_name}</h2>
            
            <div className="space-y-3 text-sm">
               <div className="flex items-center gap-3 text-gray-400">
                 <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                 <span className="truncate">{profile.email}</span>
               </div>
               <div className="flex items-center gap-3 text-gray-400">
                 <ShieldCheck className="w-4 h-4 text-gray-500 shrink-0" />
                 <span>{profile.cpf || profile.cnpj || 'Documento Não Informado'}</span>
               </div>
               <div className="space-y-1">
                 {profile.cellphone && (
                   <div className="flex items-center gap-3 text-gray-400">
                     <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                     <span>Celular: {profile.cellphone}</span>
                   </div>
                 )}
                 {profile.phone && (
                   <div className="flex items-center gap-3 text-gray-400">
                     <Phone className="w-4 h-4 text-[#DE2027] shrink-0" />
                     <span className="text-white font-bold uppercase text-[10px]">FIXO: {profile.phone}</span>
                   </div>
                 )}
                 {!profile.cellphone && !profile.phone && (
                   <div className="flex items-center gap-3 text-gray-400">
                     <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                     <span>Sem telefone</span>
                   </div>
                 )}
               </div>
               <div className="flex items-center gap-3 text-gray-400">
                 <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                 <span>Cadastrado em {new Date(profile.created_at).toLocaleDateString('pt-BR')}</span>
               </div>
            </div>
          </div>

          {/* Card de Ações Admin */}
          <div className="bg-[#131A26] border border-gray-800/80 p-6 rounded-2xl space-y-3">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Controles do Sistema</h3>
             
             <Button 
               onClick={handleSync}
               disabled={syncing}
               className="w-full bg-[#0B111A] border border-gray-700 hover:bg-gray-800 text-white flex gap-3 justify-start h-auto py-4 px-4 whitespace-normal text-left leading-tight"
             >
               {syncing ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <RefreshCcw className="w-4 h-4 text-blue-400 shrink-0" />}
               <span className="text-xs font-bold uppercase tracking-tight">Forçar Sincronização de Pagamentos</span>
             </Button>

             {latestSub && (
               <Button 
                 onClick={() => handleToggleStatus(latestSub.status)}
                 disabled={toggling}
                 className={`w-full flex gap-3 justify-start border h-auto py-4 px-4 whitespace-normal text-left leading-tight ${isActive ? 'bg-[#0B111A] border-red-900/50 hover:bg-red-950/30 text-red-400' : 'bg-[#0B111A] border-green-900/50 hover:bg-green-950/30 text-green-400'}`}
               >
                 {toggling ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : isActive ? <PowerOff className="w-4 h-4 shrink-0" /> : <Power className="w-4 h-4 shrink-0" />}
                 <span className="text-xs font-bold uppercase tracking-tight">{isActive ? 'Suspender Serviço' : 'Reativar Serviço'}</span>
               </Button>
             )}

             <Button 
               onClick={handleDeleteClient}
               disabled={deleting}
               className="w-full bg-[#DE2027] hover:bg-red-700 text-white flex gap-3 justify-start mt-6 h-auto py-5 px-4 whitespace-normal text-left leading-tight"
             >
               {deleting ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Trash2 className="w-4 h-4 shrink-0" />}
               <span className="text-sm font-black uppercase italic tracking-tighter">EXCLUIR CONTA COMPLETA</span>
             </Button>
          </div>
        </div>

        {/* Coluna Direita: Assinaturas e Faturas */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Assinaturas */}
          <div className="bg-[#0B111A] border border-gray-800/80 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <Server className="w-5 h-5 text-[#DE2027]" />
              Assinaturas
            </h3>

            {subscriptions.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Nenhuma assinatura vinculada.</p>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((sub: any) => {
                  const planText = PLANS[sub.plan_id as PlanId]?.title || sub.plan_id;
                  return (
                    <div key={sub.id} className="border border-gray-800 bg-[#131A26] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">{planText}</span>
                          <span className="text-[10px] text-gray-500 font-mono">#{sub.id.split('-')[0]}</span>
                        </div>
                        <p className="text-xs text-gray-400">Início: {new Date(sub.start_date).toLocaleDateString()}</p>
                        <p className="text-xs font-bold text-[#DE2027] font-mono mt-1 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {sub.domain || "Sem domínio"}
                        </p>
                        <p className="text-[10px] text-gray-500 italic">Vencimento: {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                         <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                           {sub.status === 'active' ? 'Ativo' : sub.status === 'pending' ? 'Pendente' : sub.status}
                         </span>
                         <button 
                           onClick={() => handleDeleteSubscription(sub.id)}
                           disabled={deletingSub === sub.id}
                           className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                           title="Excluir Plano Definitivamente"
                         >
                           {deletingSub === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                         </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Faturas Histórico */}
          <div className="bg-[#0B111A] border border-gray-800/80 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <Receipt className="w-5 h-5 text-[#DE2027]" />
              Extrato de Faturas
            </h3>

            {subscriptions.length === 0 || subscriptions.every((s:any) => !s.invoices || s.invoices.length === 0) ? (
              <p className="text-gray-500 text-sm italic">Nenhuma fatura gerada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-widest">
                      <th className="pb-3 pl-2">ID MP</th>
                      <th className="pb-3">Valor</th>
                      <th className="pb-3">Data</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub: any) => (
                      (sub.invoices || []).map((inv: any) => (
                        <tr key={inv.id} className="border-b border-gray-800/50 hover:bg-[#131A26] transition-colors">
                          <td className="p-3 pl-2 font-mono text-[10px] text-gray-400">{inv.mp_preference_id || 'N/A'}</td>
                          <td className="p-3 font-bold text-white">R$ {Number(inv.amount).toFixed(2).replace('.', ',')}</td>
                          <td className="p-3 text-gray-400 text-xs">{new Date(inv.created_at).toLocaleDateString()}</td>
                          <td className="p-3">
                             {inv.status === 'paid' && <span className="text-green-400 text-xs font-bold uppercase"><CheckCircle2 className="w-3 h-3 inline mr-1" />Pago</span>}
                             {inv.status === 'pending' && <span className="text-yellow-500 text-xs font-bold uppercase">Pendente</span>}
                             {(inv.status === 'open' || inv.status === 'failed') && <span className="text-red-400 text-xs font-bold uppercase tracking-tighter">Aberto/Falha</span>}
                          </td>
                          <td className="p-3 text-right">
                             {inv.status !== 'paid' && (
                               <button 
                                 onClick={() => handleSettleInvoice(inv.id)}
                                 disabled={settlingInvoice === inv.id}
                                 className="text-[10px] font-black uppercase tracking-tighter text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded transition-all flex items-center gap-1 ml-auto"
                               >
                                 {settlingInvoice === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                 Dar Baixa
                               </button>
                             )}
                          </td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Contratos */}
          <div className="bg-[#0B111A] border border-gray-800/80 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-[#DE2027]" />
              Contratos Digitais
            </h3>

            {contracts.length === 0 ? (
               <p className="text-gray-500 text-sm italic">Nenhum contrato assinado.</p>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract: any) => (
                  <div key={contract.id} className="border border-gray-800 bg-[#131A26] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-white text-sm mb-1">Aceite de Termos de Hospedagem</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Data: {new Date(contract.agreed_at).toLocaleString()}</span>
                        <span>IP: {contract.ip_address || 'Não registrado'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteContract(contract.id)}
                      disabled={deletingContract === contract.id}
                      className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Excluir Registro de Contrato"
                    >
                      {deletingContract === contract.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                  id="confirm-action-btn"
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

// Para corrigir erro de importação do ícone `Server` que faltou em lucide-react nesta página
// mas agora já incluído no import principal acima.
