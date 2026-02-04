// 🎯 SERVIÇO DE RIFAS - CONEXÃO COM O BACKEND

const API_BASE_URL = 'https://ddevs-86w2.onrender.com/api';

export interface Raffle {
  // IDs cruciais para operações
  id: string;
  creationId: string;
  sequentialId: number;
  formattedId: string;
  completeId: string;
  
  // Dados da rifa
  title: string;
  description: string;
  pricePerQuota: number;
  totalQuotas: number;
  availableQuotas: number;
  soldQuotas: number;
  imageUrl: string;
  createdAt: string;
  status: string;
  progressPercentage: number;
  
  // Estatísticas
  totalParticipants: number;
  totalRevenue: number;
}

export interface RaffleResponse {
  success: boolean;
  count: number;
  data: Raffle[];
}

export interface SingleRaffleResponse {
  success: boolean;
  data: Raffle;
}

class RaffleService {
  // 🎯 Buscar todas as rifas ativas
  static async getRaffles(): Promise<RaffleResponse> {
    try {
      console.log('🎯 Buscando rifas no backend...');
      
      const response = await fetch(`${API_BASE_URL}/raffles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      console.log('📊 Resposta das rifas:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar rifas');
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar rifas:', error);
      throw error;
    }
  }

  // 🎯 Buscar rifa por ID
  static async getRaffleById(id: string): Promise<SingleRaffleResponse> {
    try {
      console.log(`🎯 Buscando rifa ID: ${id}`);
      
      const response = await fetch(`${API_BASE_URL}/raffles/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      console.log('📊 Resposta da rifa:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar rifa');
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar rifa:', error);
      throw error;
    }
  }

  // 🎯 Criar nova rifa (admin only)
  static async createRaffle(raffleData: {
    title: string;
    description?: string;
    pricePerQuota: number;
    totalQuotas: number;
    imageUrl?: string;
    quickSelectPackages?: number[];
  }, token: string): Promise<SingleRaffleResponse> {
    try {
      console.log('🎯 Criando nova rifa...');
      
      const response = await fetch(`${API_BASE_URL}/raffles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(raffleData),
      });

      const data = await response.json();
      
      console.log('📊 Resposta da criação:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar rifa');
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao criar rifa:', error);
      throw error;
    }
  }

  // 🎯 Formatar preço para BRL
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  }

  // 🎯 Formatar data
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // 🎯 Calcular progresso
  static calculateProgress(soldQuotas: number, totalQuotas: number): number {
    return Math.round((soldQuotas / totalQuotas) * 100);
  }

  // 🎯 Status da rifa
  static getRaffleStatus(progressPercentage: number): string {
    if (progressPercentage === 100) return 'Finalizada';
    if (progressPercentage >= 75) return 'Quase esgotada';
    if (progressPercentage >= 50) return 'Metade vendida';
    if (progressPercentage >= 25) return 'Boa venda';
    return 'Disponível';
  }

  // 🎯 Cor do progresso
  static getProgressColor(progressPercentage: number): string {
    if (progressPercentage === 100) return 'bg-gray-500';
    if (progressPercentage >= 75) return 'bg-orange-500';
    if (progressPercentage >= 50) return 'bg-yellow-500';
    if (progressPercentage >= 25) return 'bg-blue-500';
    return 'bg-green-500';
  }

  // 🎯 Copiar ID para clipboard
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('❌ Erro ao copiar para clipboard:', error);
      return false;
    }
  }
}

export default RaffleService;
