"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { CopySlash, Users, ShieldAlert, LogOut, LayoutDashboard } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Se estiver na tela de login admin, não exibe sidebar nem header.
  if (pathname === '/admsdc/login') {
    return <>{children}</>;
  }

  const navigation = [
    { name: "Resumo Geral", href: "/admsdc", icon: LayoutDashboard },
    { name: "Gestão de Clientes", href: "/admsdc/clientes", icon: Users },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admsdc/login');
      router.refresh();
    } catch {
      alert("Erro ao sair.");
    }
  }

  return (
    <div className="min-h-screen bg-[#070A0F] font-sans text-gray-200 flex overflow-hidden">
      
      {/* Sidebar Admin (Escura) */}
      <div className="w-64 bg-[#0B111A] border-r border-gray-800/80 flex flex-col pt-6 hidden md:flex shrink-0 shadow-2xl">
        
        <div className="px-6 mb-10">
          <Link href="/admsdc" className="flex items-center gap-2 group cursor-pointer">
            <ShieldAlert className="text-[#DE2027] w-8 h-8 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-white text-xl font-black tracking-tighter leading-none">SYS.ADMIN</span>
              <span className="text-[#DE2027] text-[10px] font-bold tracking-widest uppercase">Acesso Restrito</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-4 px-2">Menu Principal</div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-xs font-bold tracking-wider cursor-pointer ${
                  isActive
                    ? "bg-[#DE2027]/10 text-[#DE2027] border border-[#DE2027]/30"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-[#DE2027]" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800/80 mt-auto bg-[#070A0F]/50">
          <div className="flex flex-col px-2 mb-4">
             <span className="text-xs font-bold text-gray-300">ADMINISTRADOR</span>
             <span className="text-[10px] text-green-400 font-mono tracking-tighter flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> ONLINE
             </span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 text-xs font-bold text-red-400 border border-red-900/50 hover:bg-red-950/30 rounded-xl transition-all cursor-pointer"
          >
            Encerrar Sessão
          </button>
        </div>
      </div>

      {/* Main Area Admin */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Mobile Opcional ou Header Topo Discreto */}
        <header className="h-16 border-b border-gray-800/80 bg-[#0B111A] flex items-center px-6 justify-between shrink-0">
          <div className="md:hidden flex items-center gap-2">
            <ShieldAlert className="text-[#DE2027] w-6 h-6" />
            <span className="text-white text-lg font-black tracking-tighter">SYS.ADMIN</span>
          </div>
          <div className="hidden md:flex ml-auto text-xs font-mono text-gray-500 tracking-widest">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
