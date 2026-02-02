// CONFIGURAÇÃO CENTRAL DA API - URL MANUAL FIXA - SEM VARIÁVEIS
export const API_URL = 'https://ddevs-86w2.onrender.com/api';

// Constantes para endpoints - URL COMPLETA E FIXA
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'https://ddevs-86w2.onrender.com/api/auth/login',
    REGISTER: 'https://ddevs-86w2.onrender.com/api/auth/register'
  },
  ADMIN: {
    CREATE_RAFFLE: 'https://ddevs-86w2.onrender.com/api/admin/create-raffle',
    SWAP_QUOTA: 'https://ddevs-86w2.onrender.com/api/admin/swap-quota'
  },
  PAYMENT: {
    CREATE_ORDER: 'https://ddevs-86w2.onrender.com/api/payment/create-order',
    MY_NUMBERS: 'https://ddevs-86w2.onrender.com/api/user/my-numbers'
  }
};
