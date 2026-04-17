"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updatePasswordAction } from "../actions/reset-password";
import { newPasswordSchema } from "../schemas";
import { Button } from "@/components/ui/button";

type NewPasswordValues = z.infer<typeof newPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
  });

  async function onSubmit(data: NewPasswordValues) {
    setErrorMsg(null);
    setSuccessMsg(null);
    const formData = new FormData();
    formData.append("password", data.password);
    formData.append("repeatPassword", data.repeatPassword);

    const result = await updatePasswordAction(formData);

    if (result?.error) {
      setErrorMsg(result.error);
    } else if(result?.success) {
      setSuccessMsg(result.success);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
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
          {successMsg} Redirecionando para o login...
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Nova Senha
        </label>
        <div className="mt-1">
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027] focus:border-[#DE2027] transition-colors"
            placeholder="Sua senha complexa"
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>
      </div>

       <div>
        <label htmlFor="repeatPassword" className="block text-sm font-medium text-foreground">
          Repetir Nova Senha
        </label>
        <div className="mt-1">
          <input
            id="repeatPassword"
            type="password"
            {...register("repeatPassword")}
            className="w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027] focus:border-[#DE2027] transition-colors"
            placeholder="Confirme a senha"
          />
          {errors.repeatPassword && <p className="mt-1 text-sm text-red-500">{errors.repeatPassword.message}</p>}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        A senha deve conter de 8 a 20 caracteres, incluir ao menos uma maiúscula, uma minúscula, um número e um caractere especial (!@#$%&?).
      </div>

      <div>
        <Button
          type="submit"
          className="w-full flex justify-center py-2.5 shadow-md hover:scale-[1.02] transition-transform"
          disabled={isSubmitting || !!successMsg}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Redefinir Senha"}
        </Button>
      </div>
      
       <div className="text-center mt-4">
        <Link href="/auth/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
