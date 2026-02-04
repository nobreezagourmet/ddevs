import React, { useState, useEffect } from 'react';
import LeadService, { Lead, LeadStats } from '../services/leadService';

interface LeadTableProps {
  token: string;
}

const LeadTable: React.FC<LeadTableProps> = ({ token }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(true);
  const [copiedId, setCopiedId] = useState<string>('');

  useEffect(() => {
    loadLeads();
    loadStats();
  }, [token]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('👥 Carregando leads...');
      console.log('🔗 API URL:', import.meta.env.VITE_API_URL);
      console.log('🕐 Build Time:', import.meta.env.VITE_BUILD_TIME);
      console.log('🔑 Token presente:', token ? 'Sim' : 'Não');
      
      const response = await LeadService.getLeads(token);
      
      console.log('📊 Resposta de leads:', response);
      console.log('📊 Success:', response.success);
      console.log('📊 Count:', response.count);
      console.log('📊 Data length:', response.data?.length);
      
      if (response.success && response.data && response.data.length > 0) {
        setLeads(response.data);
        console.log(`✅ ${response.count} leads carregados`);
        console.log('📋 Primeiros 3 leads:', response.data.slice(0, 3).map(l => ({
          name: l.name,
          email: l.email,
          formattedLeadId: l.formattedLeadId,
          totalQuotasPurchased: l.totalQuotasPurchased
        })));
      } else {
        console.warn('⚠️ Nenhum lead encontrado ou resposta inválida');
        setLeads([]);
        setError('Nenhum lead encontrado');
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar leads:', err);
      console.error('❌ Stack:', err.stack);
      setError(err.message || 'Erro ao carregar leads. Verifique suas permissões de administrador.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 Carregando estatísticas...');
      
      const response = await LeadService.getLeadStats(token);
      
      if (response.success) {
        setStats(response.data);
        console.log('✅ Estatísticas carregadas');
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar estatísticas:', err);
      // Não mostrar erro de stats, apenas não exibir
    }
  };

  const handleExportCSV = () => {
    LeadService.downloadCSV(leads, `leads_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleCopyId = async (id: string, formattedId: string) => {
    const success = await LeadService.copyToClipboard(formattedId);
    if (success) {
      setCopiedId(formattedId);
      setTimeout(() => setCopiedId(''), 2000);
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.formattedLeadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.leadId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadLeads}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Estatísticas */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">👥 Leads Cadastrados</h2>
            <p className="text-gray-400">
              Total de {leads.length} usuários cadastrados com IDs únicos
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {showStats ? 'Ocultar' : 'Mostrar'} Estatísticas
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        {showStats && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalUsers}</div>
              <div className="text-gray-400 text-sm">Total Usuários</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.activeUsers}</div>
              <div className="text-gray-400 text-sm">Usuários Ativos</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.adminUsers}</div>
              <div className="text-gray-400 text-sm">Administradores</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.usersWithQuotas}</div>
              <div className="text-gray-400 text-sm">Com Cotas</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.totalRevenue.toFixed(2)}</div>
              <div className="text-gray-400 text-sm">Receita Total</div>
            </div>
          </div>
        )}

        {/* Busca */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabela de Leads */}
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID do Lead
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Primeira Rifa
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estatísticas
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Data Cadastro
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="relative group">
                        <span className="text-xs text-gray-400 font-mono cursor-pointer hover:text-blue-400 transition-colors"
                              onClick={() => handleCopyId(lead.leadId, lead.formattedLeadId)}>
                          {lead.formattedLeadId}
                        </span>
                        <div className="absolute -top-8 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {copiedId === lead.formattedLeadId ? '✓ Copiado!' : 'Clique para copiar'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 font-mono truncate max-w-[120px]" title={lead.leadId}>
                        {lead.leadId.slice(0, 20)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {lead.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {lead.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {LeadService.formatPhone(lead.phone)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.firstRaffleAccessed ? (
                      <div className="space-y-1">
                        <div className="text-sm text-blue-400 font-medium">
                          {lead.firstRaffleAccessed.formattedId}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-[150px]" title={lead.firstRaffleAccessed.title}>
                          {lead.firstRaffleAccessed.title}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Nenhuma</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-300">
                        <span className="text-green-400">{lead.totalQuotasPurchased}</span> cotas
                      </div>
                      <div className="text-xs text-gray-400">
                        R$ {lead.totalSpent.toFixed(2)}
                      </div>
                      <div className="text-xs text-blue-400">
                        {lead.participatedRaffles.length} rifas
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {lead.registrationDate}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lead.registrationTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${LeadService.getStatusColor(lead.isAdmin, lead.status)}`}>
                      {LeadService.getUserStatus(lead.isAdmin, lead.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-400">
              {searchTerm ? 'Nenhum lead encontrado para esta busca.' : 'Nenhum lead cadastrado.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadTable;
