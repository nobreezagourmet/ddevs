export interface Raffle {
  // IDs do backend
  id: string;
  creationId: string;
  sequentialId: number;
  formattedId: string;
  completeId: string;
  
  // Dados principais
  title: string;
  description: string;
  imageUrl: string;
  pricePerQuota: number;
  totalQuotas: number;
  availableQuotas: number;
  soldQuotas: number;
  status: string;
  progressPercentage: number;
  
  // Estatísticas
  totalParticipants: number;
  totalRevenue: number;
  
  // Metadados
  createdAt: string;
  
  // Compatibilidade com frontend
  packages?: number[];
}

export enum AppView {
  RAFFLE,
  AUTH,
  PAYMENT,
  MY_NUMBERS,
  RESULTS,
  RULES,
  LEADS,
  CUSTOMERS,
}

export enum AuthMode {
  LOGIN = 'login',
  REGISTER = 'register',
}

export interface User {
  name: string;
  email: string;
  isAdmin?: boolean;
}

export interface Purchase {
  id: string;
  quotas: number;
  numbers: string[];
  date: string;
  raffleTitle?: string;
}