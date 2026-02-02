import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../src/config/api';
import { Purchase, User } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

interface PurchaseAccordionProps {
  purchase: Purchase;
  isOpen: boolean;
  onToggle: () => void;
}

const PurchaseAccordion: React.FC<PurchaseAccordionProps> = ({ purchase, isOpen, onToggle }) => (
  <div className="bg-gray-900/80 rounded-lg overflow-hidden border border-gray-700">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-800/50 transition-colors"
    >
      <div>
        <p className="text-white font-semibold">Compra de {purchase.quotas} cota{purchase.quotas > 1 ? 's' : ''}</p>
        <p className="text-sm text-gray-400">{purchase.date}</p>
      </div>
      <i className={`fa-solid fa-chevron-down text-emerald-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
    </button>
    {isOpen && (
      <div className="p-4 bg-gray-800 animate-fade-in">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {purchase.numbers.map((number) => (
            <div key={number} className="bg-emerald-600 text-white font-bold py-2 px-3 rounded-md text-sm tracking-wider shadow-md text-center">
              {number}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

interface MyNumbersPageProps {
  user: User;
  onNewPurchase: () => void;
  authToken: string | null;
}

const MyNumbersPage: React.FC<MyNumbersPageProps> = ({ user, onNewPurchase, authToken }) => {
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMyNumbers = async () => {
      if (!authToken) {
        setError("Autenticação necessária.");
        setIsLoading(false);
        return;
      }

      // FORÇADO: URL manual completa
      const manualUrl = 'https://ddevs-86w2.onrender.com/api/user/my-numbers';
      
      try {
        // DEBUG: Log da URL sendo chamada
        console.log('🚀 CHAMANDO API MY-NUMBERS EM:', manualUrl);
        
        const response = await fetch(manualUrl, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        // DEBUG: Mostrar resposta completa
        console.log('📡 RESPOSTA SERVIDOR:', response.status, response.statusText);
        console.log('🔗 URL CHAMADA:', manualUrl);
        
        if (!response.ok) {
           throw new Error("Falha ao buscar seus números. Tente novamente mais tarde.");
        }
        
        const data: Purchase[] = await response.json();
        setPurchaseHistory(data);

        if (data.length > 0) {
           // Abre o último (mais recente) acordeão por padrão
           setOpenAccordionId(data[data.length - 1].id); 
        }
      } catch (error: any) {
        // DEBUG: Erro completo
        console.error('❌ ERRO COMPLETO:', error);
        console.error('🔗 URL FALHOU:', manualUrl);
        console.error('📋 STATUS:', error.response?.status);
        console.error('📡 RESPOSTA:', error.response?.data);
        
        setError(error.message || "Falha ao buscar seus números. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyNumbers();
  }, [authToken]);

  const handleToggle = (id: string) => {
    setOpenAccordionId(openAccordionId === id ? null : id);
  };
  
  const totalQuotas = purchaseHistory.reduce((acc, p) => acc + p.quotas, 0);

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center p-10"><SpinnerIcon /></div>;
    }

    if (error) {
      return <p className="text-center text-red-400">{error}</p>;
    }

    if (purchaseHistory.length === 0) {
       return (
          <div className="text-center">
             <p className="text-gray-300 text-lg mb-8">Você ainda não possui números.</p>
             <button
                onClick={onNewPurchase}
                className="w-full max-w-xs mx-auto btn-primary text-white py-3 px-6 rounded-lg text-lg"
             >
                Participar da Rifa
             </button>
          </div>
       )
    }

    return (
      <>
        <div className="space-y-4 my-8">
          {purchaseHistory.map((purchase) => (
            <PurchaseAccordion 
              key={purchase.id} 
              purchase={purchase} 
              isOpen={openAccordionId === purchase.id}
              onToggle={() => handleToggle(purchase.id)}
            />
          ))}
        </div>
        
        <button
          onClick={onNewPurchase}
          className="w-full max-w-xs mx-auto btn-primary text-white py-3 px-6 rounded-lg text-lg transition-all duration-300 shadow-lg uppercase"
        >
          Comprar Mais Números
        </button>
      </>
    );
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-2xl mx-auto animate-fade-in mt-10">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Meus Números, {user.name.split(' ')[0]}!
        </h1>
        {!isLoading && purchaseHistory.length > 0 && (
          <p className="text-gray-300 text-lg mb-8">
            Você tem um total de <span className="font-bold text-emerald-400">{totalQuotas} números da sorte</span>.
          </p>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default MyNumbersPage;
