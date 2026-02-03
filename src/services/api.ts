// 🛡️ AUDITORIA ATIVA: Conectando exclusivamente ao Render
console.log('🛡️ AUDITORIA ATIVA: Conectando exclusivamente ao Render');

// HARDCODE AUDITORIA - SEM VARIÁVEIS, SEM PROCESS.ENV, SEM IMPORT.META.ENV
const API_URL = 'https://ddevs-86w2.onrender.com';

console.log('🔗 URL ALVO:', API_URL);

export { API_URL };

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken');
    const url = `${this.baseURL}${endpoint}`;
    
    // AUDITORIA: Log completo da requisição
    console.log('�️ AUDITORIA REQUEST:', {
      url: url,
      method: options.method || 'GET',
      hasToken: !!token,
      timestamp: new Date().toISOString()
    });
    
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
    
    // AUDITORIA: Log da resposta
    console.log('🛡️ AUDITORIA RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      url: url,
      timestamp: new Date().toISOString()
    });
    
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
