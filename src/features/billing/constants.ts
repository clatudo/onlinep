export type PlanId = 'starter' | 'pro' | 'enterprise' | 'custom';

export const PLANS: Record<PlanId, { title: string; price: number; description: string }> = {
  starter: { title: 'Plano Começando', price: 5.00, description: '1 GB de Espaço / Tráfego Ilimitado' },
  pro: { title: 'Hospedagem I', price: 1.00, description: '10 GB de Espaço / Tráfego Ilimitado' },
  enterprise: { title: 'Hospedagem II', price: 2.00, description: '20 GB de Espaço / Tráfego Ilimitado' },
  custom: { title: 'Plano Personalizado', price: 0, description: 'Sob consulta' },
};
