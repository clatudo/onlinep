import { LoginForm } from "@/features/auth/components/LoginForm";
import Link from "next/link";
import { Cpu } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-muted/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 group mb-6">
          <Cpu className="text-[#DE2027] w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
          <div className="flex items-center text-2xl font-black tracking-tighter">
            <span className="text-[#131A26] dark:text-gray-100">ONLINE</span>
            <span className="text-[#DE2027]">PRODUÇÕES</span>
          </div>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-foreground">
          Acesse sua Área de Cliente
        </h2>
        <p className="mt-2 text-center text-sm text-foreground/70">
          Ou{" "}
          <Link href="/auth/register" className="font-medium text-[#DE2027] hover:text-[#DE2027]/80">
            crie uma nova conta gratuita
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background py-8 px-4 shadow neo-shadow sm:rounded-xl sm:px-10 border border-border">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
