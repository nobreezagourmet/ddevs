// Build Version: 2.0.2 - Reset via Vercel Env Vars
// 🚨 FORÇAR NOVO BUNDLE - VITE_API_URL

// CONFIGURAÇÃO VIA VARIÁVEL DE AMBIENTE VITE
const API_URL = import.meta.env.VITE_API_URL || 'https://ddevs-86w2.onrender.com';

// � LOG DE SUCESSO RESETADO
console.log('� SISTEMA RESETADO - API:', API_URL);

// EXPORTAR CONSTANTE PARA USO EM TODA APLICAÇÃO
export { API_URL };

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken');
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // FORÇAR JSON
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    return response;
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async get(endpoint: string) {
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

const api = new ApiClient(API_URL + '/api');
export default api;
