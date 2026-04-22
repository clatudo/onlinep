"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInAction } from "../actions/auth";
import { loginSchema } from "../schemas";
import { Button } from "@/components/ui/button";

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormValues) {
    setErrorMsg(null);
    const formData = new FormData();
    formData.append("identifier", data.identifier);
    formData.append("password", data.password);

    try {
      const result = await signInAction(formData);

      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        // Usamos window.location.href em vez de router.push para contornar
        // o cache agressivo de rotas do Next.js (RSC cache) que pode ter guardado o estado deslogado.
        window.location.href = "/cliente/dashboard";
      }
    } catch (err: any) {
      console.error("Erro ao chamar Server Action:", err);
      setErrorMsg(`Falha de conexão com o servidor: ${err.message}. Verifique as permissões de origem (Next.js CSRF) no next.config.ts.`);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} method="POST">
      {errorMsg && (
        <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/50 rounded-md">
          {errorMsg}
        </div>
      )}

      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-foreground">
          E-mail ou CPF
        </label>
        <div className="mt-1">
          <input
            id="identifier"
            type="text"
            {...register("identifier")}
            className="w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027] focus:border-[#DE2027] transition-colors"
            placeholder="Digite seu e-mail ou CPF"
          />
          {errors.identifier && <p className="mt-1 text-sm text-red-500">{errors.identifier.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Senha
        </label>
        <div className="mt-1">
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027] focus:border-[#DE2027] transition-colors"
            placeholder="Digite sua senha"
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end">
        <div className="text-sm">
          <Link href="/auth/forgot-password" className="font-medium text-[#DE2027] hover:text-[#DE2027]/80 transition-colors">
            Esqueceu a senha?
          </Link>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full flex justify-center py-2.5 shadow-md hover:scale-[1.02] transition-transform"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
        </Button>
      </div>
    </form>
  );
}
