// 👥 SERVIÇO DE LEADS - CONEXÃO COM O BACKEND

const API_BASE_URL = 'https://ddevs-86w2.onrender.com/api';

export interface Lead {
  // IDs cruciais para operações de troca
  id: string;
  leadId: string;
  sequentialId: number;
  formattedLeadId: string;
  completeLeadId: string;
  
  // Dados do lead
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  isAdmin: boolean;
  status: string;
  
  // Estatísticas do lead
  totalQuotasPurchased: number;
  totalSpent: number;
  lastActivityAt: string;
  
  // Relacionamento com rifas
  firstRaffleAccessed: {
    id: string;
    creationId: string;
    sequentialId: number;
    formattedId: string;
    title: string;
  } | null;
  
  // Rifas que participou
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
  
  // Formatação para exibição
  registrationDate: string;
  registrationTime: string;
  lastActivityDate: string;
  lastActivityTime: string;
}

export interface LeadResponse {
  success: boolean;
  count: number;
  data: Lead[];
}

export interface LeadStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  activeUsers: number;
  recentUsers: number;
  monthlyUsers: number;
  usersWithQuotas: number;
  totalQuotas: number;
  totalRevenue: number;
  avgQuotasPerUser: number;
  avgSpentPerUser: number;
}

export interface LeadStatsResponse {
  success: boolean;
  data: LeadStats;
}

class LeadService {
  // 👥 Buscar todos os leads (apenas admin)
  static async getLeads(token: string): Promise<LeadResponse> {
    try {
      console.log('👥 Buscando leads no backend...');
      
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      console.log('📊 Resposta dos leads:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar leads');
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar leads:', error);
      throw error;
    }
  }

  // 👥 Buscar lead por ID (apenas admin)
  static async getLeadById(id: string, token: string): Promise<{ success: boolean; data: Lead }> {
    try {
      console.log(`👥 Buscando lead ID: ${id}`);
      
      const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      console.log('📊 Resposta do lead:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar lead');
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar lead:', error);
      throw error;
    }
  }

  // 👥 Buscar estatísticas dos leads (apenas admin)
  static async getLeadStats(token: string): Promise<LeadStatsResponse> {
    try {
      console.log('📊 Buscando estatísticas dos leads...');
      
      const response = await fetch(`${API_BASE_URL}/leads/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      console.log('📊 Resposta das estatísticas:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar estatísticas');
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // 👥 Formatar telefone
  static formatPhone(phone: string): string {
    if (!phone || phone === 'Não informado') return phone;
    
    // Remove tudo que não é dígito
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Formata para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (cleanPhone.length === 11) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
    } else if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
    }
    
    return phone;
  }

  // 👥 Status do usuário
  static getUserStatus(isAdmin: boolean, status: string): string {
    if (isAdmin) return 'Administrador';
    if (status === 'active') return 'Cliente Ativo';
    if (status === 'inactive') return 'Cliente Inativo';
    if (status === 'suspended') return 'Suspenso';
    return 'Desconhecido';
  }

  // 👥 Cor do status
  static getStatusColor(isAdmin: boolean, status: string): string {
    if (isAdmin) return 'text-purple-600 bg-purple-100';
    if (status === 'active') return 'text-green-600 bg-green-100';
    if (status === 'inactive') return 'text-gray-600 bg-gray-100';
    if (status === 'suspended') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  }

  // 👥 Exportar dados para CSV
  static exportToCSV(leads: Lead[]): string {
    const headers = [
      'ID do Lead',
      'ID Formatado', 
      'Nome', 
      'Email', 
      'Telefone', 
      'Data de Cadastro', 
      'Hora de Cadastro',
      'Status',
      'Total em Cotas',
      'Total Gasto',
      'Primeira Rifa',
      'Rifas Participadas'
    ];
    
    const rows = leads.map(lead => [
      lead.leadId,
      lead.formattedLeadId,
      lead.name,
      lead.email,
      lead.phone,
      lead.registrationDate,
      lead.registrationTime,
      this.getUserStatus(lead.isAdmin, lead.status),
      lead.totalQuotasPurchased.toString(),
      lead.totalSpent.toFixed(2),
      lead.firstRaffleAccessed?.formattedId || 'Nenhuma',
      lead.participatedRaffles.map(pr => pr.formattedId).join('; ') || 'Nenhuma'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  // 👥 Baixar CSV
  static downloadCSV(leads: Lead[], filename: string = 'leads.csv'): void {
    const csvContent = this.exportToCSV(leads);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // 👥 Copiar ID para clipboard
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

export default LeadService;
