// 👥 SERVIÇO DE LEADS - CONEXÃO COM O BACKEND

const API_BASE_URL = 'https://ddevs-86w2.onrender.com/api';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  isAdmin: boolean;
  registrationDate: string;
  registrationTime: string;
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
  recentUsers: number;
  monthlyUsers: number;
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
  static getUserStatus(isAdmin: boolean): string {
    return isAdmin ? 'Administrador' : 'Cliente';
  }

  // 👥 Cor do status
  static getStatusColor(isAdmin: boolean): string {
    return isAdmin ? 'text-purple-600 bg-purple-100' : 'text-green-600 bg-green-100';
  }

  // 👥 Exportar dados para CSV
  static exportToCSV(leads: Lead[]): string {
    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Data de Cadastro', 'Hora de Cadastro', 'Tipo'];
    const rows = leads.map(lead => [
      lead.id,
      lead.name,
      lead.email,
      lead.phone,
      lead.registrationDate,
      lead.registrationTime,
      this.getUserStatus(lead.isAdmin)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
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
}

export default LeadService;
