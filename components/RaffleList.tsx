import React, { useState, useEffect } from 'react';
import RaffleService, { Raffle } from '../services/raffleService';

interface RaffleListProps {
  onRaffleSelect?: (raffle: Raffle) => void;
}

const RaffleList: React.FC<RaffleListProps> = ({ onRaffleSelect }) => {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadRaffles();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Atualizando rifas automaticamente...');
      loadRaffles();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRaffles = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🎯 Carregando rifas...');
      console.log('🕐 Última atualização:', lastUpdate.toLocaleTimeString());
      console.log('🔗 API URL:', import.meta.env.VITE_API_URL);
      console.log('🕐 Build Time:', import.meta.env.VITE_BUILD_TIME);
      
      const response = await RaffleService.getRaffles();
      
      console.log('📊 Resposta recebida:', response);
      console.log('📊 Success:', response.success);
      console.log('📊 Count:', response.count);
      console.log('📊 Data length:', response.data?.length);
      
      if (response.success && response.data && response.data.length > 0) {
        setRaffles(response.data);
        setLastUpdate(new Date());
        console.log(`✅ ${response.count} rifas carregadas`);
        console.log('📋 IDs das rifas:', response.data.map(r => ({
          id: r.id,
          title: r.title,
          status: r.status,
          formattedId: r.formattedId
        })));
      } else {
        console.warn('⚠️ Nenhuma rifa encontrada ou resposta inválida');
        setRaffles([]);
        setError('Nenhuma rifa disponível no momento');
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar rifas:', err);
      console.error('❌ Stack:', err.stack);
      setError(err.message || 'Erro ao carregar rifas');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Usuário solicitou atualização manual...');
    loadRaffles();
  };

  const handleRaffleClick = (raffle: Raffle) => {
    console.log('🎯 Rifa selecionada:', raffle.title);
    if (onRaffleSelect) {
      onRaffleSelect(raffle);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando rifas...</p>
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

  if (raffles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-400">Nenhuma rifa disponível no momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {raffles.map((raffle) => (
        <div
          key={raffle.id}
          onClick={() => handleRaffleClick(raffle)}
          className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-700"
        >
          {/* Imagem da Rifa */}
          <div className="relative h-48 bg-gradient-to-br from-green-600 to-blue-600">
            <img
              src={raffle.imageUrl}
              alt={raffle.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/400x300/10b981/ffffff?text=RIFA';
              }}
            />
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                raffle.status === 'active' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}>
                {RaffleService.getRaffleStatus(raffle.progressPercentage)}
              </span>
            </div>
          </div>

          {/* Conteúdo da Rifa */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
              {raffle.title}
            </h3>
            
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {raffle.description}
            </p>

            {/* Preço */}
            <div className="mb-4">
              <span className="text-2xl font-bold text-green-400">
                {RaffleService.formatPrice(raffle.pricePerQuota)}
              </span>
              <span className="text-gray-400 text-sm ml-2">por cota</span>
            </div>

            {/* Progresso */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{raffle.soldQuotas} vendidas</span>
                <span>{raffle.totalQuotas} totais</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${RaffleService.getProgressColor(raffle.progressPercentage)}`}
                  style={{ width: `${raffle.progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm text-gray-400">
                  {raffle.progressPercentage}% vendido
                </span>
              </div>
            </div>

            {/* Data de Criação */}
            <div className="text-xs text-gray-500 text-center">
              Criada em {RaffleService.formatDate(raffle.createdAt)}
            </div>

            {/* Botão */}
            <button className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              Escolher Cotas
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RaffleList;
