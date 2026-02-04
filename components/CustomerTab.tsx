import React, { useState, useEffect } from 'react';

// 🎯 VARIÁVEL DE AMBIENTE DA VERCEL
const API_URL = 'https://ddevs-86w2.onrender.com/api';

interface Customer {
  leadId: string;
  sequentialId: number;
  formattedLeadId: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  registrationDate: string;
  registrationTime: string;
  isAdmin: boolean;
  status: string;
}

interface CustomerListProps {
  token: string;
}

const CustomerList: React.FC<CustomerListProps> = ({ token }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string>('');

  useEffect(() => {
    if (token) {
      loadCustomers();
    }
  }, [token]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('� AUDITORIA: Carregando clientes...');
      console.log('🕐 Timestamp:', new Date().toISOString());
      console.log('🔗 URL:', `${API_URL}/customers`);
      console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'NENHUM TOKEN');
      
      const response = await fetch(`${API_URL}/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Status da resposta:', response.status);
      console.log('📊 Status Text:', response.statusText);
      console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
      console.log('📊 URL final:', response.url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro HTTP:', response.status, response.statusText);
        console.error('❌ Resposta de erro:', errorData);
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 Resposta completa dos clientes:', JSON.stringify(data, null, 2));
      console.log('📊 Número de clientes recebidos:', data.data?.length || 0);
      console.log('📊 Success:', data.success);
      console.log('📊 Message:', data.message);
      console.log('📊 Note:', data.note);

      if (data.success) {
        setCustomers(data.data);
        console.log(`✅ ${data.count} clientes carregados`);
        
        // Verificar clientes recebidos
        if (data.data && data.data.length > 0) {
          console.log('🔍 AUDITORIA: Verificando clientes recebidos...');
          data.data.forEach((customer: any, index: number) => {
            console.log(`👤 Cliente ${index + 1}:`, {
              leadId: customer.leadId,
              formattedLeadId: customer.formattedLeadId,
              name: customer.name,
              email: customer.email,
              isAdmin: customer.isAdmin
            });
          });
        }
      } else {
        throw new Error(data.message || 'Falha ao carregar clientes');
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar clientes:', err);
      console.error('❌ Stack trace:', err.stack);
      setError(err.message || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Atualizando clientes...');
    loadCustomers();
  };

  const handleCopyId = async (leadId: string, formattedLeadId: string) => {
    try {
      await navigator.clipboard.writeText(formattedLeadId);
      setCopiedId(formattedLeadId);
      setTimeout(() => setCopiedId(''), 2000);
    } catch (error) {
      console.error('❌ Erro ao copiar:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.formattedLeadId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (isAdmin: boolean, status: string) => {
    if (isAdmin) return 'text-purple-600 bg-purple-100';
    if (status === 'active') return 'text-green-600 bg-green-100';
    if (status === 'inactive') return 'text-gray-600 bg-gray-100';
    if (status === 'suspended') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (isAdmin: boolean, status: string) => {
    if (isAdmin) return 'Administrador';
    if (status === 'active') return 'Cliente Ativo';
    if (status === 'inactive') return 'Cliente Inativo';
    if (status === 'suspended') return 'Suspenso';
    return 'Desconhecido';
  };

  const formatPhone = (phone: string) => {
    if (!phone || phone === 'Não informado') return phone;
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 11) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
    } else if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
    }
    
    return phone;
  };

  const exportToCSV = () => {
    const headers = ['ID do Cliente', 'ID Formatado', 'Nome', 'Email', 'Telefone', 'Data Cadastro', 'Hora Cadastro', 'Status'];
    
    const rows = customers.map(customer => [
      customer.leadId,
      customer.formattedLeadId,
      customer.name,
      customer.email,
      customer.phone,
      customer.registrationDate,
      customer.registrationTime,
      getStatusText(customer.isAdmin, customer.status)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando clientes...</p>
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
            onClick={handleRefresh}
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
      {/* Cabeçalho */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">👥 Clientes Cadastrados</h2>
            <p className="text-gray-400">
              Total de {customers.length} clientes cadastrados no sistema
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>
        
        {/* Campo de busca */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID do Cliente
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
                  Data Cadastro
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCustomers.map((customer) => (
                <tr key={customer.leadId} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="relative group">
                        <span className="text-xs text-gray-400 font-mono cursor-pointer hover:text-blue-400 transition-colors"
                              onClick={() => handleCopyId(customer.leadId, customer.formattedLeadId)}>
                          {customer.formattedLeadId}
                        </span>
                        <div className="absolute -top-8 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {copiedId === customer.formattedLeadId ? '✓ Copiado!' : 'Clique para copiar'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 font-mono truncate max-w-[120px]" title={customer.leadId}>
                        {customer.leadId.slice(0, 20)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {customer.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatPhone(customer.phone)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {customer.registrationDate}
                    </div>
                    <div className="text-xs text-gray-500">
                      {customer.registrationTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.isAdmin, customer.status)}`}>
                      {getStatusText(customer.isAdmin, customer.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopyId(customer.leadId, customer.formattedLeadId)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Copiar ID"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-400">
              {searchTerm ? 'Nenhum cliente encontrado para esta busca.' : 'Nenhum cliente cadastrado.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
