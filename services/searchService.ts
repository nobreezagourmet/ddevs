// 🔍 SERVIÇO DE BUSCA AVANÇADA - PROTOCOLO DE CORREÇÃO

const API_BASE_URL = 'https://ddevs-86w2.onrender.com/api';

export interface SearchResult {
  id: string;
  name: string;
  email: string;
  phone: string;
  formattedLeadId: string;
  registrationDate: string;
  registrationTime: string;
  isAdmin: boolean;
  status: string;
  totalQuotasPurchased: number;
  totalSpent: number;
  lastActivityAt: string;
  foundTicket?: {
    ticketNumber: number;
    raffle: any;
    status: string;
    purchaseInfo: any;
  };
  participatedRaffles: Array<{
    raffleId: string;
    creationId: string;
    sequentialId: number;
    formattedId: string;
    title: string;
    quotasPurchased: number;
    totalSpent: number;
    participatedAt: string;
  }>;
}

export interface SearchResponse {
  success: boolean;
  count: number;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  data: SearchResult[];
}

export interface TicketSearchResult {
  ticketNumber: number;
  raffle: any;
  user: any;
  status: string;
  purchaseInfo: any;
  createdAt: string;
}

export interface TicketSearchResponse {
  success: boolean;
  count: number;
  data: TicketSearchResult[];
}

class SearchService {
  // 🔍 Busca avançada de clientes
  static async searchCustomers(token: string, query?: string, ticketNumber?: string, page: number = 1): Promise<SearchResponse> {
    try {
      console.log('🔍 Busca avançada de clientes (Protocolo de Correção)...');
      console.log('📝 Query:', query);
      console.log('🎫 Ticket Number:', ticketNumber);
      console.log('📄 Page:', page);
      
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (ticketNumber) params.append('ticketNumber', ticketNumber);
      params.append('page', page.toString());
      
      const response = await fetch(`${API_BASE_URL}/search/customers?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 Status da resposta:', response.status);
      console.log('📊 Status Text:', response.statusText);

      const data = await response.json();
      
      console.log('📊 Resposta da busca:', data);
      console.log('📊 Resultados encontrados:', data.count);

      if (!response.ok) {
        throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Busca falhou');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Erro na busca avançada:', error);
      throw error;
    }
  }

  // 🎫 Busca de tickets por rifa
  static async searchTicketsByRaffle(token: string, raffleId: string, ticketNumber?: string): Promise<TicketSearchResponse> {
    try {
      console.log('🎫 Buscando tickets da rifa (Protocolo de Correção)...');
      console.log('🎯 Raffle ID:', raffleId);
      console.log('🎫 Ticket Number:', ticketNumber);
      
      const params = new URLSearchParams();
      if (ticketNumber) params.append('ticketNumber', ticketNumber);
      
      const response = await fetch(`${API_BASE_URL}/search/tickets/${raffleId}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 Status da resposta:', response.status);

      const data = await response.json();
      
      console.log('📊 Resposta dos tickets:', data);
      console.log('📊 Tickets encontrados:', data.count);

      if (!response.ok) {
        throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Busca de tickets falhou');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Erro na busca de tickets:', error);
      throw error;
    }
  }

  // 🔍 Busca em tempo real (debounced)
  static debounceSearch = (callback: Function, delay: number = 300) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
  };

  // 📊 Formatar resultados para exibição
  static formatSearchResults(results: SearchResult[]): any[] {
    return results.map(result => ({
      id: result.id,
      name: result.name,
      email: result.email,
      phone: result.phone,
      formattedLeadId: result.formattedLeadId,
      registrationDate: result.registrationDate,
      registrationTime: result.registrationTime,
      isAdmin: result.isAdmin,
      status: result.status,
      totalQuotasPurchased: result.totalQuotasPurchased,
      totalSpent: result.totalSpent,
      lastActivityDate: new Date(result.lastActivityAt).toLocaleDateString('pt-BR'),
      lastActivityTime: new Date(result.lastActivityAt).toLocaleTimeString('pt-BR'),
      foundTicket: result.foundTicket,
      participatedRaffles: result.participatedRaffles
    }));
  }

  // 🎯 Validação de número de ticket
  static validateTicketNumber(ticketNumber: string): boolean {
    const num = parseInt(ticketNumber);
    return !isNaN(num) && num > 0 && num <= 999999;
  }

  // 📱 Validação de telefone (padrão brasileiro)
  static validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  // 📧 Validação de email
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default SearchService;
