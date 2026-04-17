"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cpu, Menu, X } from "lucide-react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all">
      <div className="w-full px-2 md:px-4 xl:px-8 flex h-16 sm:h-20 items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 group">
            <Cpu className="text-[#DE2027] w-5 h-5 md:w-6 md:h-6 xl:w-8 xl:h-8 group-hover:rotate-90 transition-transform duration-500 flex-shrink-0" />
            <div className="flex items-center text-[15px] base:text-lg md:text-base lg:text-xl xl:text-[1.7rem] font-black tracking-tighter font-heading leading-none whitespace-nowrap">
              <span className="text-[#131A26] dark:text-gray-100">ONLINE</span>
              <span className="text-[#DE2027]">PRODUÇÕES</span>
            </div>
          </Link>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex flex-row md:gap-2 lg:gap-5 xl:gap-8 w-full justify-center px-1 lg:px-2">
          <Link href="#empresa" className="text-[9px] min-[900px]:text-[10px] lg:text-xs xl:text-sm font-bold tracking-widest text-[#435263] hover:text-[#29323d] transition-colors uppercase font-heading whitespace-nowrap">A EMPRESA</Link>
          <Link href="#hospedagem" className="text-[9px] min-[900px]:text-[10px] lg:text-xs xl:text-sm font-bold tracking-widest text-[#435263] hover:text-[#29323d] transition-colors uppercase font-heading whitespace-nowrap">HOSPEDAGEM</Link>
          <Link href="#servicos" className="text-[9px] min-[900px]:text-[10px] lg:text-xs xl:text-sm font-bold tracking-widest text-[#435263] hover:text-[#29323d] transition-colors uppercase font-heading whitespace-nowrap">SERVIÇOS</Link>
          <Link href="#portfolio" className="text-[9px] min-[900px]:text-[10px] lg:text-xs xl:text-sm font-bold tracking-widest text-[#435263] hover:text-[#29323d] transition-colors uppercase font-heading whitespace-nowrap">PORTFÓLIO</Link>
          <Link href="#contato" className="text-[9px] min-[900px]:text-[10px] lg:text-xs xl:text-sm font-bold tracking-widest text-[#435263] hover:text-[#29323d] transition-colors uppercase font-heading whitespace-nowrap">CONTATO</Link>
        </nav>

        {/* BUTTONS */}
        <div className="flex flex-shrink-0 items-center gap-1 min-[900px]:gap-2 lg:gap-4">
          <Button asChild variant="ghost" className="hidden md:inline-flex whitespace-nowrap text-[10px] min-[900px]:text-xs xl:text-sm px-1 min-[900px]:px-2 xl:px-4">
            <Link href="/auth/login">Área do Cliente</Link>
          </Button>
          <Button asChild className="hidden md:inline-flex rounded-full shadow-lg neo-shadow hover:scale-105 transition-transform whitespace-nowrap text-[10px] min-[900px]:text-xs xl:text-sm h-7 min-[900px]:h-8 xl:h-10 px-2 min-[900px]:px-4 xl:px-8">
            <Link href="#hospedagem">Assinar Agora</Link>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* MOBILE MENU (Visible below 768px when opened) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-background border-b border-border shadow-xl py-6 px-4 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-4">
            <Link href="#empresa" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-[0.1em] text-[#435263] uppercase p-2 hover:bg-muted rounded-md">A EMPRESA</Link>
            <Link href="#hospedagem" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-[0.1em] text-[#435263] uppercase p-2 hover:bg-muted rounded-md">HOSPEDAGEM</Link>
            <Link href="#servicos" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-[0.1em] text-[#435263] uppercase p-2 hover:bg-muted rounded-md">SERVIÇOS</Link>
            <Link href="#portfolio" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-[0.1em] text-[#435263] uppercase p-2 hover:bg-muted rounded-md">PORTFÓLIO</Link>
            <Link href="#contato" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-[0.1em] text-[#435263] uppercase p-2 hover:bg-muted rounded-md">CONTATO</Link>
          </nav>
          <div className="flex flex-col gap-4 mt-4 border-t pt-6">
            <Button asChild variant="outline" className="w-full justify-center">
              <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>Área do Cliente</Link>
            </Button>
            <Button className="w-full justify-center rounded-full shadow-lg neo-shadow">Assinar Agora</Button>
          </div>
        </div>
      )}
    </header>
  );
}
