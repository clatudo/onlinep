export interface DomainStatus {
  available: boolean;
  price: number;
  currency: string;
  domain: string;
  type: 'national' | 'international';
}

const PRICING = {
  national: { cost: 40, markup: 50 }, // .com.br
  international: { cost: 80, markup: 50 }, // .com, .net, etc
};

export async function checkDomainAvailability(domain: string): Promise<DomainStatus> {
  // Lógica de URLs RDAP por TLD
  let rdapUrl = "";
  const domainLower = domain.toLowerCase();
  const isNational = domainLower.endsWith('.br');
  const type = isNational ? 'national' : 'international';

  if (domainLower.endsWith('.br')) {
    rdapUrl = `https://rdap.registro.br/domain/${domain}`;
  } else if (domainLower.endsWith('.com')) {
    rdapUrl = `https://rdap.verisign.com/com/v1/domain/${domain}`;
  } else if (domainLower.endsWith('.net')) {
    rdapUrl = `https://rdap.verisign.com/net/v1/domain/${domain}`;
  } else {
    // Fallback genérico para outros TLDs
    rdapUrl = `https://rdap.verisign.com/com/v1/domain/${domain}`; 
  }

  try {
    const response = await fetch(rdapUrl, {
      headers: {
        'Accept': 'application/rdap+json',
        'User-Agent': 'On-Line-Producoes-Checkout/1.0'
      },
      next: { revalidate: 3600 } // Cache por 1 hora para evitar excesso de requisições
    });
    
    // Status 429: Muitos pedidos (Rate Limit)
    if (response.status === 429) {
      throw new Error("Limite de consultas atingido. Tente novamente em alguns minutos.");
    }

    // Status 404 no RDAP significa que o domínio está disponível para registro
    // Status 200 significa que ele já foi registrado
    const available = response.status === 404;
    
    // Calcular preço final com markup de R$ 50,00
    const pricing = PRICING[type];
    const finalPrice = pricing.cost + pricing.markup;

    return {
      available,
      price: finalPrice,
      currency: 'BRL',
      domain,
      type
    };
  } catch (error: any) {
    console.error("Erro ao consultar RDAP:", error);
    throw new Error(error.message || "Falha na consulta de disponibilidade.");
  }
}
