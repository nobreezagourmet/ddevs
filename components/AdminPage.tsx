import React, { useState, FormEvent } from 'react';
import InputField from './InputField';
import SpinnerIcon from './icons/SpinnerIcon';

interface AdminPageProps {
  onLogout: () => void;
  authToken: string | null;
}

const AdminPage: React.FC<AdminPageProps> = ({ onLogout, authToken }) => {
  const [idOrigem, setIdOrigem] = useState('');
  const [idDestino, setIdDestino] = useState('');
  const [numeroCota, setNumeroCota] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrocaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (!idOrigem || !idDestino || !numeroCota) {
      setMessage({ type: 'error', text: 'Todos os campos são obrigatórios.'});
      setIsLoading(false);
      return;
    }

    if (!authToken) {
      setMessage({ type: 'error', text: 'Erro de autenticação. Faça login novamente.'});
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/admin/swap-quota', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          originUserId: idOrigem, 
          destinationUserId: idDestino,
          quotaNumber: numeroCota,
          raffleId: 'rifa-carro-2024' // Em um app real, isso seria dinâmico
        })
      });

      const result = await response.json();

      if (!response.ok) {
         throw new Error(result.message || 'Falha na troca. Verifique os dados.');
      }

      setMessage({ type: 'success', text: result.message });
      setIdOrigem('');
      setIdDestino('');
      setNumeroCota('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-2xl mx-auto animate-fade-in mt-10">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Painel de Ferramentas
        </h1>
      </div>

      {/* Motor de Troca Mútua */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-emerald-400 mb-6 text-center">Motor de Troca Mútua</h2>
        <form onSubmit={handleTrocaSubmit} className="space-y-6">
          <InputField
            id="id_origem"
            label="ID do Dono Atual (Origem)"
            type="text"
            value={idOrigem}
            onChange={(e) => setIdOrigem(e.target.value)}
            required
            disabled={isLoading}
          />
          <InputField
            id="id_destino"
            label="ID do Novo Dono (Destino)"
            type="text"
            value={idDestino}
            onChange={(e) => setIdDestino(e.target.value)}
            required
            disabled={isLoading}
          />
          <InputField
            id="numero_cota"
            label="Número da Cota Específica"
            type="text"
            value={numeroCota}
            onChange={(e) => setNumeroCota(e.target.value)}
            required
            disabled={isLoading}
          />

          {message && (
            <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-4 rounded-lg text-lg uppercase tracking-wider flex justify-center items-center"
          >
            {isLoading ? <SpinnerIcon /> : 'Executar Troca'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default AdminPage;
