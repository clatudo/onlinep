
const portfolioItems = [
  {
    id: 1,
    title: "Cloud Performance Hosting",
    category: "INFRAESTRUTURA & DESIGN",
    image: "/portfolio/hosting.png",
    description: "Plataforma escalável com foco em baixa latência e alta disponibilidade.",
  },
  {
    id: 2,
    title: "Creative Digital Agency",
    category: "WEB DESIGN & EXPERIÊNCIA",
    image: "/portfolio/agency.png",
    description: "Landing page minimalista desenvolvida para uma das maiores agências do Brasil.",
  },
  {
    id: 3,
    title: "Digital Assets Store",
    category: "E-COMMERCE & DASHBOARD",
    image: "/portfolio/store.png",
    description: "Ecossistema completo de vendas com integração de pagamentos e painel administrativo.",
  },
];

export function BentoGrid() {
  return (
    <section id="portfolio" className="py-20 bg-white scroll-mt-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
          <div className="flex flex-col">
            <span className="text-[#DE2027] font-bold text-xs tracking-widest uppercase font-heading mb-2">
              Destaques
            </span>
            <h2 className="text-[#131A26] text-4xl sm:text-5xl font-black uppercase italic tracking-tighter font-heading">
              Nosso Portfólio
            </h2>
          </div>

          <div className="md:max-w-xl text-left md:text-right">
            <p className="text-[#60739F] text-sm md:text-base font-medium leading-relaxed">
              Ajudamos centenas de empresas a conquistarem seu espaço na web e descobrirem o poder de uma infraestrutura robusta com um design impecável.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item) => (
            <div key={item.id} className="flex flex-col group cursor-pointer">

              {/* Thumbnail Placeholder */}
              <div className="w-full aspect-[4/3] bg-[#F5E6E8] dark:bg-red-500/5 rounded-[2rem] flex flex-col items-center justify-center mb-6 transition-transform duration-500 overflow-hidden relative">

                <img 
                  src={item.image} 
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-300"></div>

                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 dark:bg-black/80 backdrop-blur-sm p-4 rounded-2xl">
                  <p className="text-[#131A26] dark:text-gray-100 text-[10px] font-medium leading-tight">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Text Info */}
              <div className="flex flex-col">
                <h3 className="text-[#131A26] text-xl font-bold font-heading mb-1 group-hover:text-[#DE2027] transition-colors">
                  {item.title}
                </h3>
                <span className="text-[#9BA5B7] text-[10px] font-bold tracking-[0.15em] uppercase italic">
                  {item.category}
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
