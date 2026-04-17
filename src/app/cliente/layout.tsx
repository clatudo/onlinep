"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Cpu, LayoutDashboard, Server, Receipt, LogOut } from "lucide-react";
import { signOutAction } from "@/features/auth/actions/auth";

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: "Visão Geral", href: "/cliente/dashboard", icon: LayoutDashboard },
    { name: "Meus Serviços", href: "/cliente/servicos", icon: Server },
    { name: "Faturas", href: "/cliente/faturas", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFA] dark:bg-[#050B14] flex flex-col md:flex-row font-sans text-[#131A26] dark:text-gray-100">
      
      {/* Sidebar Móvel (Topo) / Desktop (Esquerda) */}
      <div className="md:w-64 bg-white dark:bg-[#0B111A] border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col pt-4 md:h-screen sticky top-0 z-10 transition-colors">
        
        <div className="px-6 mb-8 flex items-center justify-between md:justify-start">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer inline-flex">
            <Cpu className="text-[#DE2027] w-6 h-6 md:w-8 md:h-8 group-hover:rotate-90 transition-transform duration-500 flex-shrink-0" />
            <div className="flex items-center text-lg md:text-xl font-black tracking-tighter font-heading leading-none">
              <span className="text-[#131A26] dark:text-gray-100">ONLINE</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 pb-4 md:pb-0 overflow-x-auto md:overflow-x-visible md:overflow-y-auto flex md:flex-col gap-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-sm font-bold tracking-wide cursor-pointer ${
                  isActive
                    ? "bg-red-50 text-[#DE2027] dark:bg-red-500/10"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#131A26] dark:hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-[#DE2027]" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block p-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
          <button 
            onClick={() => signOutAction()}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            Sair da Conta
          </button>
        </div>
      </div>

      {/* Área Principal */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
