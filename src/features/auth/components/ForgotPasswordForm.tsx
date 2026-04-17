"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { requestPasswordResetAction } from "../actions/reset-password";
import { requestResetSchema } from "../schemas";
import { Button } from "@/components/ui/button";

type RequestResetValues = z.infer<typeof requestResetSchema>;

export function ForgotPasswordForm() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestResetValues>({
    resolver: zodResolver(requestResetSchema),
  });

  async function onSubmit(data: RequestResetValues) {
    setErrorMsg(null);
    setSuccessMsg(null);
    const formData = new FormData();
    formData.append("identifier", data.identifier);

    try {
      const result = await requestPasswordResetAction(formData);

      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success) {
        setSuccessMsg(result.success);
      } else {
        setErrorMsg("Erro desconhecido ao processar sua solicitação.");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão com o servidor.");
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {errorMsg && (
        <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/50 rounded-md">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 text-sm text-green-600 bg-green-100/10 border border-green-500/50 rounded-md">
          {successMsg}
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
            placeholder="Digite o e-mail ou CPF vinculado a conta"
          />
          {errors.identifier && <p className="mt-1 text-sm text-red-500">{errors.identifier.message}</p>}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full flex justify-center py-2.5 shadow-md hover:scale-[1.02] transition-transform"
          disabled={isSubmitting || !!successMsg}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar Código"}
        </Button>
      </div>
      
      <div className="text-center mt-4">
        <Link href="/auth/login" className="text-sm font-medium text-[#DE2027] hover:text-[#DE2027]/80 transition-colors">
          &larr; Voltar para o Login
        </Link>
      </div>
    </form>
  );
}
