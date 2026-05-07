"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signUpAction } from "../actions/auth";
import { registerSchema } from "../schemas";
import { Button } from "@/components/ui/button";

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [clientIp, setClientIp] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Data/Hora local na montagem
    const now = new Date();
    setCurrentTime(now.toLocaleString('pt-BR'));

    // Buscar IP
    let isMounted = true;
    fetch('https://api64.ipify.org?format=json')
      .then(res => res.json())
      .then(data => { if (isMounted) setClientIp(data.ip); })
      .catch(() => { if (isMounted) setClientIp("Não detectado"); });
    
    return () => { isMounted = false; };
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      account_type: "pf",
    }
  });

  const accountType = watch("account_type");

  const applyCnpjMask = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const applyBirthDateMask = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3")
      .replace(/(\d{2})\/(\d{2})\/(\d{4}).*/, "$1/$2/$3");
  };

  // Idealmente se usa react-imask para o CPF/CELULAR, mas aqui faremos no schema
  const applyCpfMask = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const applyPhoneMask = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d{4})/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  async function onSubmit(data: RegisterFormValues) {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("fullName", data.fullName);
      formData.append("account_type", data.account_type);
      
      // Limpeza robusta para garantir que os dados cheguem
      const cleanCpf = data.cpf?.replace(/\D/g, "") || "";
      const cleanCnpj = data.cnpj?.replace(/\D/g, "") || "";
      const cleanPhone = data.phone?.replace(/\D/g, "") || "";
      const cleanCellphone = data.cellphone?.replace(/\D/g, "") || "";

      formData.append("cpf", cleanCpf);
      formData.append("cnpj", cleanCnpj);
      formData.append("phone", cleanPhone);
      formData.append("cellphone", cleanCellphone);
      formData.append("birth_date", data.birth_date || "");

      const result = await signUpAction(formData);

      if (result?.error) {
        setErrorMsg(result.error);
        return;
      } 
      
      if(result?.success) {
        setSuccessMsg(result.success);
        const verifyUrl = next ? `/auth/verify?next=${encodeURIComponent(next)}` : "/auth/verify";
        setTimeout(() => router.push(verifyUrl), 2000);
      }
    } catch (err: any) {
      console.error("Erro crítico no onSubmit:", err);
      setErrorMsg("Erro inesperado ao processar cadastro. Tente novamente.");
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

      {/* Seletor PF/PJ */}
      <div className="flex gap-2 p-1.5 bg-muted rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setValue("account_type", "pf")}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${accountType === "pf" ? "bg-background shadow-sm text-[#DE2027] border border-red-500/10" : "text-muted-foreground hover:bg-background/20"}`}
          >
            Pessoa Física
          </button>
          <button
            type="button"
            onClick={() => setValue("account_type", "pj")}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${accountType === "pj" ? "bg-background shadow-sm text-[#DE2027] border border-red-500/10" : "text-muted-foreground hover:bg-background/20"}`}
          >
            Pessoa Jurídica
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground">
            {accountType === "pf" ? "Nome Completo" : "Razão Social / Nome da Empresa"}
          </label>
          <input
            {...register("fullName")}
            className="mt-1 w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027]"
            placeholder={accountType === "pf" ? "Seu nome completo" : "Nome da Empresa"}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
        </div>

        <div className="md:col-span-2">
           <label className="block text-sm font-medium text-foreground">E-mail</label>
            <input
              {...register("email")}
              className="mt-1 w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027]"
              placeholder="seu@email.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {accountType === "pf" ? (
          <>
            <div>
               <label className="block text-sm font-medium text-foreground">CPF</label>
                <input
                  {...register("cpf")}
                  onChange={(e) => { 
                    e.target.value = applyCpfMask(e.target.value); 
                    register("cpf").onChange(e);
                  }}
                  maxLength={14}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027]"
                  placeholder="000.000.000-00"
                />
                {errors.cpf && <p className="mt-1 text-xs text-red-500">{errors.cpf.message}</p>}
            </div>
            <div>
               <label className="block text-sm font-medium text-foreground">Data de Nascimento</label>
                <input
                  {...register("birth_date")}
                  onChange={(e) => { 
                    e.target.value = applyBirthDateMask(e.target.value); 
                    register("birth_date").onChange(e);
                  }}
                  maxLength={10}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027]"
                  placeholder="DD/MM/AAAA"
                />
                {errors.birth_date && <p className="mt-1 text-xs text-red-500">{errors.birth_date.message}</p>}
            </div>
          </>
        ) : (
          <>
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-foreground">CNPJ</label>
                <input
                  {...register("cnpj")}
                  onChange={(e) => { 
                    e.target.value = applyCnpjMask(e.target.value); 
                    register("cnpj").onChange(e);
                  }}
                  maxLength={18}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027]"
                  placeholder="00.000.000/0000-00"
                />
                {errors.cnpj && <p className="mt-1 text-xs text-red-500">{errors.cnpj.message}</p>}
            </div>
          </>
        )}

        <div>
           <label className="block text-sm font-medium text-foreground">Celular (WhatsApp)</label>
            <input
              {...register("cellphone")}
              onChange={(e) => { 
                e.target.value = applyPhoneMask(e.target.value); 
                register("cellphone").onChange(e);
              }}
              maxLength={15}
              className="mt-1 w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027]"
              placeholder="(00) 00000-0000"
            />
            {errors.cellphone && <p className="mt-1 text-xs text-red-500">{errors.cellphone.message}</p>}
        </div>

        <div>
           <label className="block text-sm font-medium text-foreground">Telefone Fixo (Opcional)</label>
            <input
              {...register("phone")}
               onChange={(e) => { 
                 e.target.value = applyPhoneMask(e.target.value); 
                 register("phone").onChange(e);
               }}
               maxLength={14}
              className="mt-1 w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027]"
              placeholder="(00) 0000-0000"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        <div>
           <label className="block text-sm font-medium text-foreground">Senha</label>
            <input
              type="password"
              {...register("password")}
              autoComplete="new-password"
              className="mt-1 w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027]"
              placeholder="Sua senha segura"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
           <label className="block text-sm font-medium text-foreground">Repetir Senha</label>
            <input
              type="password"
              {...register("confirmPassword")}
              autoComplete="new-password"
              className="mt-1 w-full px-3 py-2 border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#DE2027]"
              placeholder="Confirme sua senha"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div className="text-xs text-muted-foreground pb-2">
        A senha deve conter de 8 a 20 caracteres, incluir uma maiúscula, uma minúscula, um número e um dos caracteres: @ # $ % ! & ?
      </div>

      <Button
        type="submit"
        className="w-full flex justify-center py-2.5 shadow-md hover:scale-[1.01] transition-transform"
        disabled={isSubmitting || !!successMsg}
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar minha Conta"}
      </Button>

      <div className="mt-4 pt-4 border-t border-border/50 text-center">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Por razões de segurança fica registrado o endereço IP do seu computador: <strong className="text-foreground">{clientIp || '...'}</strong> dia <strong className="text-foreground">{currentTime.split(',')[0]}</strong> às <strong className="text-foreground">{currentTime.split(',')[1]?.trim() || '...'}</strong>
        </p>
      </div>
    </form>
  );
}
