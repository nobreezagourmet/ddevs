// ✅ CONEXÃO FORÇADA COM RENDER ESTABELECIDA EM 2026
console.log('✅ CONEXÃO FORÇADA COM RENDER ESTABELECIDA EM 2026');

// HARDCODE ABSOLUTO - SEM VITE_API_URL, SEM VARIÁVEIS
const BASE_URL = 'https://ddevs-86w2.onrender.com/api';

console.log('🔗 ALVO:', BASE_URL);

export { BASE_URL };

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
        'Accept': 'application/json',
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

const api = new ApiClient(BASE_URL);
export default api;
