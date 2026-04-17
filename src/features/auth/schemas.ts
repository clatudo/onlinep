import * as z from "zod";
import { isValidCPF, isValidCNPJ } from "@/lib/utils";

const passwordSchema = z.string()
  .min(8, "A senha deve ter no mínimo 8 caracteres.")
  .max(20, "A senha deve ter no máximo 20 caracteres.")
  .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula.")
  .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula.")
  .regex(/[0-9]/, "Deve conter pelo menos um número.")
  .regex(/[@#$%!&?]/, "Deve conter pelo menos um caractere especial pertencente a: @#$%!&?")
  .regex(/^[^a-zA-Z0-9@#$%!&?]*([a-zA-Z0-9@#$%!&?]+[^a-zA-Z0-9@#$%!&?]*)*$/, "Apenas os caracteres especiais @#$%!&? são permitidos.");
// O regex acima garante os testes ou a gente pode fazer um refine

export const registerSchema = z.object({
  account_type: z.enum(["pf", "pj"]),
  fullName: z.string().min(3, "Nome completo ou razão social obrigatória."),
  email: z.string().email("Endereço de e-mail inválido."),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  birth_date: z.string().optional(),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  cellphone: z.string().min(10, "Celular obrigatório."),
  password: passwordSchema,
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  // Validação CPF
  if (data.account_type === 'pf') {
    if (!data.cpf || !isValidCPF(data.cpf)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF inválido ou inexistente.",
        path: ["cpf"],
      });
    }
    if (!data.birth_date || data.birth_date.length !== 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data de nascimento obrigatória.",
        path: ["birth_date"],
      });
    }
  }
  
  // Validação CNPJ
  if (data.account_type === 'pj') {
    if (!data.cnpj || !isValidCNPJ(data.cnpj)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CNPJ inválido ou inexistente.",
        path: ["cnpj"],
      });
    }
  }

  // Confirmação Senha
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "As senhas não coincidem.",
      path: ["confirmPassword"],
    });
  }
});

export const loginSchema = z.object({
  identifier: z.string().min(4, "Informe e-mail ou CPF."),
  password: z.string().min(1, "A senha é obrigatória."),
});

export const requestResetSchema = z.object({
  identifier: z.string().min(4, "Informe e-mail ou CPF."),
});

export const newPasswordSchema = z.object({
  password: passwordSchema,
  repeatPassword: z.string()
}).refine(data => data.password === data.repeatPassword, {
  message: "As senhas não coincidem.",
  path: ["repeatPassword"],
});
