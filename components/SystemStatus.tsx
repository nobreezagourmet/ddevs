import React, { useState, useEffect } from 'react';

const SystemStatus: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<string>('');

  useEffect(() => {
    const checkSystem = async () => {
      try {
        console.log('🔍 Verificando status do sistema...');
        
        // Verificar API de rifas
        const rafflesResponse = await fetch(`${import.meta.env.VITE_API_URL}/raffles`);
        const rafflesData = await rafflesResponse.json();
        
        // Verificar API de leads
        const leadsResponse = await fetch(`${import.meta.env.VITE_API_URL}/customers`, {
          headers: { 'Authorization': 'Bearer test' }
        });
        const leadsData = await leadsResponse.json();
        
        if (rafflesResponse.ok && leadsResponse.ok) {
          setApiStatus('online');
          console.log('✅ Sistema online:', {
            rifas: rafflesData.count,
            leads: leadsData.count,
            api: import.meta.env.VITE_API_URL,
            buildTime: import.meta.env.VITE_BUILD_TIME,
            version: import.meta.env.VITE_APP_VERSION || '4.0.0-FORCE-REBUILD'
          });
        } else {
          setApiStatus('offline');
        }
      } catch (error) {
        setApiStatus('offline');
        console.error('❌ Sistema offline:', error);
      }
      
      setLastCheck(new Date().toLocaleTimeString());
    };

    checkSystem();
    const interval = setInterval(checkSystem, 30000); // Verificar a cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'checking': return 'text-yellow-400';
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'checking': return 'fa-spinner fa-spin';
      case 'online': return 'fa-check-circle';
      case 'offline': return 'fa-exclamation-triangle';
      default: return 'fa-question-circle';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'checking': return 'Verificando...';
      case 'online': return 'Sistema Online';
      case 'offline': return 'Sistema Offline';
      default: return 'Status Desconhecido';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-800/95 backdrop-blur-md rounded-lg p-4 border border-gray-600 shadow-xl max-w-sm">
      <div className="flex items-center space-x-3">
        <i className={`fas ${getStatusIcon()} ${getStatusColor()}`}></i>
        <div>
          <div className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
          <div className="text-xs text-gray-400">
            Última verificação: {lastCheck}
          </div>
          <div className="text-xs text-gray-500">
            Versão: {import.meta.env.VITE_APP_VERSION || '4.0.0-FORCE-REBUILD'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
