export interface Raffle {
  id: string;
  title: string;
  imageUrl: string;
  pricePerQuota: number;
  totalQuotas: number;
  packages: number[];
}

export enum AppView {
  RAFFLE,
  AUTH,
  PAYMENT,
  MY_NUMBERS,
  RESULTS,
  RULES,
  LEADS,
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