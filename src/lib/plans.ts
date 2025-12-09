export type Plan = {
  id: string;
  name: string;
  price: number;
  artes_limit: number;
  has_ads: boolean;
  has_dashboard: boolean;
  features: string[];
};

export const PLANS: Record<string, Plan> = {
  START: {
    id: 'start',
    name: 'START',
    price: 100,
    artes_limit: 4,
    has_ads: false,
    has_dashboard: false,
    features: ['4 artes personalizáveis', 'Gestão de conteúdo básica'],
  },
  GROWTH: {
    id: 'growth',
    name: 'GROWTH',
    price: 180,
    artes_limit: 8,
    has_ads: false,
    has_dashboard: false,
    features: ['8 artes personalizáveis', 'Gestão de conteúdo avançada'],
  },
  PRO: {
    id: 'pro',
    name: 'PRO',
    price: 249,
    artes_limit: 12,
    has_ads: false,
    has_dashboard: false,
    features: ['12 artes personalizáveis', 'Gestão de conteúdo completa'],
  },
  BUSINESS: {
    id: 'business',
    name: 'BUSINESS',
    price: 250,
    artes_limit: 4,
    has_ads: true,
    has_dashboard: false,
    features: [
      '4 artes personalizáveis',
      'Gestão de anúncios',
      'Relatórios básicos',
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: 500,
    artes_limit: 12,
    has_ads: true,
    has_dashboard: true,
    features: [
      '12 artes personalizáveis',
      'Gestão de anúncios avançada',
      'Dashboard completo',
      'Suporte prioritário',
    ],
  },
};
