import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { ReactQueryProvider } from "@/lib/react-query";
import { WhatsAppFab } from "@/components/ui/WhatsAppFab";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"; // Importação correta para Next.js

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "On-line Produções - Hospedagem e Presença Digital Escalonável",
  description: "Transformamos ideias em presenças digitais de alto impacto. Hospedagem de sites com suporte humanizado e infraestrutura de ponta.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col tracking-tight selection:bg-primary/30 selection:text-primary">
        <ReactQueryProvider>
          {children}
          <Analytics />
          <WhatsAppFab />
        </ReactQueryProvider>
        <Script
          src="https://sdk.mercadopago.com/js/v2"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
