export type MonthSelection = 'agosto' | 'julho' | 'comparativo';

export interface GA4Metrics {
  sessoes: number;
  usuariosAtivos: number;
  novosUsuarios: number;
  percentualNovos: number;
  pageviews: number;
  paginasPorSessao: number;
  taxaEngajamento: number;
  tempoMedioSegundos: number;
}

export interface SocialMetrics {
  total: number;
  novosNoMes: number;
  taxaCrescimento: string;
}

export interface SocialData {
  totalConsolidado: number;
  ganhoLiquidoMes: number;
  plataformas: {
    instagram: SocialMetrics;
    facebook: SocialMetrics;
    tiktok: SocialMetrics;
  };
}

export interface ContentItem {
  id: 'ig-stories' | 'ig-feed' | 'fb' | 'tiktok';
  channel: string;
  posts: number;
  postsLabel: string;
  reach: number;
  reachFormatted: string;
  impressions: number;
  impressionsFormatted: string;
  interactions: number;
  interactionsFormatted: string;
  interactionsType: string;
  engagement: number;
  engagementFormatted: string;
}

export interface MonthlyReportData {
  mesLabel: string;
  periodoLabel: string;
  badgeLabel: string;
  ga4: GA4Metrics;
  social: SocialData;
  semanal: {
    labels: string[];
    pageviews: number[];
    sessions: number[];
  };
  content: ContentItem[];
  insights: {
    trafego: string;
    aquisicao: string;
    conversao: string;
  };
}
