"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenciais inválidas");
      }

      router.push("/admsdc");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080C] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#DE2027] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-[#131A26] rounded-2xl border border-gray-800 flex items-center justify-center shadow-[0_0_30px_rgba(222,32,39,0.2)]">
             <ShieldCheck className="w-8 h-8 text-[#DE2027]" />
           </div>
        </div>
        <h2 className="text-center text-3xl font-black text-white tracking-tighter uppercase italic">
          Portão de Acesso <span className="text-[#DE2027]">Admin</span>
        </h2>
        <p className="mt-2 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">
          Autenticação restrita ao sistema
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B111A]/80 backdrop-blur-xl py-10 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-800/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold text-center tracking-wide uppercase">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Identificação
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-800 bg-[#131A26] rounded-xl shadow-inner placeholder-gray-600 text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#DE2027] focus:border-[#DE2027] text-sm transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Código de Acesso
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-800 bg-[#131A26] rounded-xl shadow-inner placeholder-gray-600 text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#DE2027] focus:border-[#DE2027] text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#DE2027] hover:bg-[#c81920] text-white py-6 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(222,32,39,0.3)] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Autorizar Acesso"}
              </Button>
            </div>
            
            <div className="text-center mt-4 pt-4 border-t border-gray-800/50">
               {/* Isso enviaria email via Supabase usando as funções que vc já criou na auth */}
               <a href="/auth/forgot-password" target="_blank" className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-widest font-bold">
                 Falha na autenticação? Recuperar via Email Matriz
               </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
