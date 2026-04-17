import Link from "next/link";
import { Shield, Mail, Phone, MapPin, Calendar, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | On-line Produções",
  description:
    "Saiba como a On-line Produções coleta, usa e protege seus dados pessoais em conformidade com a LGPD (Lei Geral de Proteção de Dados — Lei 13.709/2018).",
};

const sections = [
  {
    id: "controlador",
    title: "1. Identificação do Controlador",
    content: (
      <div className="space-y-4">
        <p>
          A <strong className="text-white">On-line Produções</strong> é a empresa responsável pelo
          tratamento dos seus dados pessoais, atuando como Controladora nos termos da Lei Geral de
          Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-[#0B111A] border border-gray-800 rounded-xl p-4 flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#DE2027] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Endereço</p>
              <p className="text-sm text-white">R. Soraia, 636 - Jardim Soraia<br />São José do Rio Preto — SP, Brasil</p>
            </div>
          </div>
          <div className="bg-[#0B111A] border border-gray-800 rounded-xl p-4 flex items-start gap-3">
            <Mail className="w-4 h-4 text-[#DE2027] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">E-mail do DPO</p>
              <p className="text-sm text-white">privacidade@onlineproducoes.com.br</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "dados",
    title: "2. Quais Dados Coletamos",
    content: (
      <div className="space-y-4">
        <p>Coletamos diferentes categorias de dados dependendo da forma como você interage conosco:</p>
        <div className="space-y-3">
          {[
            {
              label: "Dados de Identificação",
              items: "Nome completo, CPF (pessoa física) ou CNPJ (pessoa jurídica), razão social.",
            },
            {
              label: "Dados de Contato",
              items: "Endereço de e-mail, número de telefone/WhatsApp, endereço postal.",
            },
            {
              label: "Dados Financeiros",
              items:
                "Informações de pagamento processadas com segurança via Mercado Pago. Não armazenamos dados de cartão de crédito em nossos servidores.",
            },
            {
              label: "Dados de Navegação",
              items:
                "Endereço IP, navegador, sistema operacional, páginas visitadas, tempo de permanência e dados de cookies.",
            },
            {
              label: "Dados de Uso do Serviço",
              items:
                "Informações sobre os planos contratados, faturas, logs de acesso e interações com nossa plataforma.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex gap-3 bg-[#0B111A] border border-gray-800/60 rounded-lg p-4"
            >
              <ChevronRight className="w-4 h-4 text-[#DE2027] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white mb-1">{item.label}</p>
                <p className="text-sm text-gray-400">{item.items}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "finalidade",
    title: "3. Para Quê Usamos Seus Dados",
    content: (
      <div className="space-y-3">
        <p>Seus dados são utilizados exclusivamente para as seguintes finalidades:</p>
        <ul className="space-y-2">
          {[
            "Prestação dos serviços contratados (hospedagem, desenvolvimento, suporte técnico)",
            "Processamento de pagamentos e emissão de documentos fiscais",
            "Comunicação sobre sua conta, renovações, faturas e notificações do sistema",
            "Envio de informações sobre novos produtos ou serviços (apenas mediante consentimento explícito)",
            "Cumprimento de obrigações legais e regulatórias",
            "Prevenção de fraudes e garantia da segurança da plataforma",
            "Melhoria contínua de nossos serviços por meio de análise de uso (dados anonimizados)",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE2027] shrink-0 mt-2" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "base-legal",
    title: "4. Base Legal do Tratamento",
    content: (
      <div className="space-y-3">
        <p>
          Todo o tratamento de dados pessoais realizado pela On-line Produções possui base legal
          prevista na LGPD (Art. 7º):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { base: "Execução de Contrato", desc: "Tratamento necessário para prestar os serviços contratados." },
            { base: "Consentimento", desc: "Quando você aceita os termos de uso e cookies ao acessar o site." },
            { base: "Obrigação Legal", desc: "Cumprimento de exigências fiscais, tributárias e regulatórias." },
            { base: "Interesse Legítimo", desc: "Prevenção a fraudes e melhoria da segurança da plataforma." },
          ].map((item) => (
            <div key={item.base} className="bg-[#0B111A] border border-gray-800 rounded-xl p-4">
              <p className="text-sm font-bold text-[#DE2027] mb-1">{item.base}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "compartilhamento",
    title: "5. Compartilhamento de Dados",
    content: (
      <div className="space-y-4">
        <p>
          Não vendemos, alugamos ou cedemos seus dados pessoais a terceiros para fins comerciais. O
          compartilhamento ocorre apenas nas seguintes situações:
        </p>
        <ul className="space-y-2">
          {[
            "Processadores de pagamento (Mercado Pago), para viabilizar transações financeiras",
            "Provedores de infraestrutura de nuvem (ex.: servidores e banco de dados), sob acordos de confidencialidade",
            "Autoridades públicas, quando exigido por lei ou decisão judicial",
            "Prestadores de serviços essenciais (e-mail transacional, monitoramento), sempre sob cláusulas contratuais de proteção de dados",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE2027] shrink-0 mt-2" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "cookies",
    title: "6. Cookies e Tecnologias de Rastreamento",
    content: (
      <div className="space-y-4">
        <p>
          Utilizamos cookies e tecnologias similares para melhorar sua experiência. Você pode
          gerenciar suas preferências a qualquer momento.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              tipo: "🔒 Essenciais",
              desc: "Indispensáveis para o funcionamento do site. Não podem ser desativados.",
              always: true,
            },
            {
              tipo: "📊 Analíticos",
              desc: "Nos ajudam a entender como você navega, para melhorar o desempenho.",
              always: false,
            },
            {
              tipo: "🎯 Marketing",
              desc: "Permitem exibir conteúdo e anúncios relevantes ao seu perfil.",
              always: false,
            },
          ].map((c) => (
            <div key={c.tipo} className="bg-[#0B111A] border border-gray-800 rounded-xl p-4">
              <p className="text-sm font-bold text-white mb-2">{c.tipo}</p>
              <p className="text-xs text-gray-400 mb-2">{c.desc}</p>
              {c.always && (
                <span className="text-[9px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2 py-0.5 uppercase tracking-wider">
                  Sempre ativo
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "retencao",
    title: "7. Retenção de Dados",
    content: (
      <p>
        Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta
        política. Em geral, dados de clientes são retidos por <strong className="text-white">5 anos</strong> após
        o encerramento do contrato, em conformidade com o Código Civil Brasileiro e obrigações
        fiscais. Dados de navegação anonimizados podem ser mantidos por prazo indeterminado para
        fins estatísticos.
      </p>
    ),
  },
  {
    id: "direitos",
    title: "8. Seus Direitos como Titular",
    content: (
      <div className="space-y-4">
        <p>
          A LGPD garante a você os seguintes direitos, que podem ser exercidos a qualquer momento
          mediante solicitação ao nosso DPO:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { dir: "Acesso", desc: "Saber quais dados temos sobre você." },
            { dir: "Correção", desc: "Atualizar dados incompletos, inexatos ou desatualizados." },
            { dir: "Anonimização / Bloqueio", desc: "Para dados desnecessários ou tratados em desconformidade." },
            { dir: "Portabilidade", desc: "Receber seus dados em formato estruturado." },
            { dir: "Eliminação", desc: "Solicitar a exclusão de dados tratados com base em consentimento." },
            { dir: "Revogação do Consentimento", desc: "Retirar sua autorização a qualquer momento." },
          ].map((d) => (
            <div key={d.dir} className="flex gap-3 bg-[#0B111A] border border-gray-800/60 rounded-lg p-3">
              <ChevronRight className="w-4 h-4 text-[#DE2027] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">{d.dir}</p>
                <p className="text-xs text-gray-400">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "seguranca",
    title: "9. Segurança dos Dados",
    content: (
      <p>
        Adotamos medidas técnicas e administrativas adequadas para proteger seus dados pessoais
        contra acessos não autorizados, perdas, vazamentos ou destruição. Isso inclui criptografia
        em trânsito (TLS/HTTPS), controle de acesso por perfil, autenticação segura e monitoramento
        contínuo da plataforma. Em caso de incidente de segurança, notificaremos os titulares e a
        ANPD nos prazos legais.
      </p>
    ),
  },
  {
    id: "atualizacoes",
    title: "10. Atualizações desta Política",
    content: (
      <p>
        Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças em
        nossas práticas ou na legislação. Notificaremos sobre alterações relevantes por e-mail ou
        aviso em destaque no site. A data da última revisão está indicada abaixo. Recomendamos que
        você consulte esta página regularmente.
      </p>
    ),
  },
];

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#070A0F] text-gray-300 font-sans">

      {/* Header simples */}
      <header className="border-b border-gray-800/80 bg-[#0B111A]">
        <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Shield className="w-6 h-6 text-[#DE2027]" />
            <span className="text-white font-black tracking-tighter text-lg">On-line Produções</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          >
            ← Voltar ao site
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0B111A] to-[#070A0F] border-b border-gray-800/40">
        <div className="max-w-[1000px] mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-[#DE2027]/10 border border-[#DE2027]/30 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-3.5 h-3.5 text-[#DE2027]" />
            <span className="text-[#DE2027] text-[10px] font-bold uppercase tracking-widest">
              LGPD — Lei 13.709/2018
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Política de Privacidade
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
            Sua privacidade é fundamental para nós. Esta política descreve como coletamos, utilizamos
            e protegemos seus dados pessoais.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600 font-mono">
              Última atualização: Abril de 2025
            </span>
          </div>
        </div>
      </section>

      {/* Índice de navegação */}
      <section className="bg-[#0B111A]/50 border-b border-gray-800/40 hidden md:block sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-[1000px] mx-auto px-6 py-3 flex flex-wrap gap-4">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[10px] font-bold text-gray-500 hover:text-[#DE2027] uppercase tracking-widest transition-colors whitespace-nowrap"
            >
              {s.title.split(". ")[1]}
            </a>
          ))}
        </div>
      </section>

      {/* Conteúdo */}
      <main className="max-w-[1000px] mx-auto px-6 py-16 space-y-14">
        {sections.map((section) => (
          <article key={section.id} id={section.id} className="scroll-mt-20">
            <h2 className="text-xl font-black text-white tracking-tight mb-5 flex items-center gap-3">
              <span className="w-1 h-5 bg-[#DE2027] rounded-full shrink-0" />
              {section.title}
            </h2>
            <div className="text-sm text-gray-400 leading-relaxed pl-4">
              {section.content}
            </div>
          </article>
        ))}

        {/* Contato DPO */}
        <div className="bg-[#0B111A] border border-gray-800 rounded-2xl p-8 text-center">
          <Shield className="w-8 h-8 text-[#DE2027] mx-auto mb-4" />
          <h3 className="text-lg font-black text-white mb-2">Fale com nosso Encarregado (DPO)</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            Dúvidas sobre esta política ou sobre o tratamento dos seus dados? Entre em contato com
            nosso Encarregado de Dados (DPO).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:privacidade@onlineproducoes.com.br"
              className="flex items-center gap-2 px-6 py-3 bg-[#DE2027] text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              privacidade@onlineproducoes.com.br
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 bg-[#0B111A] py-6">
        <div className="max-w-[1000px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            On-line Produções © {new Date().getFullYear()} · São José do Rio Preto — SP
          </span>
          <Link href="/" className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
            ← Voltar ao site
          </Link>
        </div>
      </footer>

    </div>
  );
}
