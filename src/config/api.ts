// CONFIGURAÇÃO CENTRAL DA API - SEM VARIÁVEIS DINÂMICAS
export const API_URL = 'https://ddevs-86w2.onrender.com/api';

// Constantes para endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`
  },
  ADMIN: {
    CREATE_RAFFLE: `${API_URL}/admin/create-raffle`,
    SWAP_QUOTA: `${API_URL}/admin/swap-quota`
  },
  PAYMENT: {
    CREATE_ORDER: `${API_URL}/payment/create-order`,
    MY_NUMBERS: `${API_URL}/user/my-numbers`
  }
};
