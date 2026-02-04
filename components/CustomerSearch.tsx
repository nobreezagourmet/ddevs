import React, { useState, useEffect } from 'react';
import LeadService, { Lead } from '../services/leadService';

interface CustomerSearchProps {
  token: string;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({ token }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('🔍 Pesquisando cliente:', searchTerm);
      
      const response = await LeadService.getLeads(token);
      
      if (response.success) {
        const filtered = response.data.filter(lead => 
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.formattedLeadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phone.includes(searchTerm)
        );
        
        setSearchResults(filtered);
        console.log(`📊 ${filtered.length} clientes encontrados`);
      } else {
        throw new Error('Falha ao pesquisar clientes');
      }
    } catch (err: any) {
      console.error('❌ Erro na pesquisa:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer: Lead) => {
    setSelectedCustomer(customer);
    console.log('👤 Cliente selecionado:', customer);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedCustomer(null);
    setError('');
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <i className="fas fa-search mr-3 text-blue-400"></i>
        Pesquisa de Clientes
      </h2>

      {/* Campo de Pesquisa */}
      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar por nome, email, telefone ou ID do cliente..."
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/20"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-search mr-2"></i>
            )}
            Pesquisar
          </button>
          <button
            onClick={handleClearSearch}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-times mr-2"></i>
            Limpar
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}

      {/* Resultados da Pesquisa */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            <i className="fas fa-users mr-2 text-green-400"></i>
            {searchResults.length} cliente(s) encontrado(s)
          </h3>
          <div className="space-y-3">
            {searchResults.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className="bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{customer.name}</h4>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        {customer.formattedLeadId}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Email:</span>
                        <p className="text-white">{customer.email}</p>
                      </div>
                      <div>
                        <span className="text-white/60">Telefone:</span>
                        <p className="text-white">{customer.phone}</p>
                      </div>
                      <div>
                        <span className="text-white/60">Cotas Compradas:</span>
                        <p className="text-white">{customer.totalQuotasPurchased}</p>
                      </div>
                      <div>
                        <span className="text-white/60">Total Gasto:</span>
                        <p className="text-white">R$ {customer.totalSpent.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-white/40">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalhes do Cliente Selecionado */}
      {selectedCustomer && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <i className="fas fa-user-circle mr-3 text-blue-400"></i>
            Detalhes do Cliente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Pessoais */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Informações Pessoais</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Nome:</span>
                  <span className="text-white">{selectedCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Email:</span>
                  <span className="text-white">{selectedCustomer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Telefone:</span>
                  <span className="text-white">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">ID Formatado:</span>
                  <span className="text-blue-400">{selectedCustomer.formattedLeadId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Data de Cadastro:</span>
                  <span className="text-white">{selectedCustomer.registrationDate}</span>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Estatísticas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Cotas Compradas:</span>
                  <span className="text-white">{selectedCustomer.totalQuotasPurchased}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Total Gasto:</span>
                  <span className="text-green-400">R$ {selectedCustomer.totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Status:</span>
                  <span className="text-green-400">{selectedCustomer.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Administrador:</span>
                  <span className={selectedCustomer.isAdmin ? "text-red-400" : "text-gray-400"}>
                    {selectedCustomer.isAdmin ? "Sim" : "Não"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Última Atividade:</span>
                  <span className="text-white">{selectedCustomer.lastActivityDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rifas Participadas */}
          {selectedCustomer.participatedRaffles && selectedCustomer.participatedRaffles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-3">Rifas Participadas</h4>
              <div className="space-y-2">
                {selectedCustomer.participatedRaffles.map((raffle, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white font-medium">{raffle.title}</span>
                        <span className="text-white/60 ml-2">({raffle.formattedId})</span>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-white">{raffle.quotasPurchased} cotas</div>
                        <div className="text-green-400">R$ {raffle.totalSpent.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;
