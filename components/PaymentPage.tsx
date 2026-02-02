import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../src/config/api';
import CopyIcon from './icons/CopyIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import CheckIcon from './icons/CheckIcon';

type PaymentStatus = 'IDLE' | 'PENDING' | 'LISTENING' | 'APPROVED' | 'ERROR';

interface PaymentPageProps {
  totalPrice: number;
  onBack: () => void;
  onPaymentSuccess: () => void;
  authToken: string | null;
  raffleId: string;
  quantity: number;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ totalPrice, onBack, onPaymentSuccess, authToken, raffleId, quantity }) => {
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('IDLE');
  const [pixKey, setPixKey] = useState("...aguardando geração do código Pix...");
  const [error, setError] = useState('');

  useEffect(() => {
    const createOrder = async () => {
      if (!authToken) {
        setError("Erro de autenticação. Por favor, faça login novamente.");
        setPaymentStatus('ERROR');
        return;
      }

      setPaymentStatus('PENDING');
      // FORÇADO: URL manual completa
      const manualUrl = 'https://ddevs-86w2.onrender.com/api/payment/create-order';
      
      try {
        // DEBUG: Log da URL sendo chamada
        console.log('🚀 CHAMANDO API PAYMENT EM:', manualUrl);
        console.log('💾 BODY:', { raffleId, quantity });
        
        const response = await fetch(manualUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ raffleId, quantity })
        });
        
        const data = await response.json();

        // DEBUG: Mostrar resposta completa
        console.log('📡 RESPOSTA SERVIDOR:', response.status, response.statusText);
        console.log('🔗 URL CHAMADA:', manualUrl);

        if (!response.ok) {
          throw new Error(data.message || 'Falha ao criar ordem de pagamento.');
        }

        setPixKey(data.pixCopyPaste);
        setPaymentStatus('LISTENING');
      } catch (err: any) {
        // DEBUG: Erro completo
        console.error('❌ ERRO COMPLETO:', err);
        console.error('🔗 URL FALHOU:', manualUrl);
        console.error('📋 STATUS:', err.response?.status);
        console.error('📡 RESPOSTA:', err.response?.data);
        
        setError(err.message);
        setPaymentStatus('ERROR');
      }
    };

    createOrder();
  }, [authToken, raffleId, quantity]);

  useEffect(() => {
    if (paymentStatus === 'LISTENING') {
      // Em um app real, isso seria um WebSocket ou long-polling
      // que aguarda uma notificação do backend (que por sua vez recebe um webhook).
      // Aqui, simulamos essa confirmação.
      const confirmationTimer = setTimeout(() => {
        setPaymentStatus('APPROVED');
      }, 5000); 
      return () => clearTimeout(confirmationTimer);
    }
  }, [paymentStatus]);

  const handleCopy = () => {
    if (pixKey.startsWith('...')) return;
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const renderContent = () => {
    if (paymentStatus === 'ERROR') {
       return (
         <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Ocorreu um Erro</h1>
            <p className="text-gray-300">{error}</p>
         </div>
       )
    }
    
    if (paymentStatus === 'APPROVED') {
       return (
          <div className="animate-fade-in text-center">
            <div className="flex justify-center mb-6">
                <CheckIcon />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Pagamento Aprovado!</h1>
            <p className="text-gray-300 mb-8">Seus números da sorte já foram gerados.</p>
            <button
              onClick={onPaymentSuccess}
              className="w-full btn-primary text-white py-3 px-4 rounded-lg text-lg uppercase tracking-wider"
            >
              Meus Números
            </button>
          </div>
       )
    }

    return (
       <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Efetue o pagamento via Pix</h1>
          <p className="text-4xl font-extrabold text-emerald-400 mb-6">
            Total: R$ {totalPrice.toFixed(2).replace('.', ',')}
          </p>

          <div className="flex justify-center my-6 h-[216px] w-[216px] mx-auto">
            {paymentStatus === 'PENDING' || paymentStatus === 'IDLE' ? (
              <div className="flex items-center justify-center bg-gray-700/50 rounded-lg w-full h-full">
                <SpinnerIcon />
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixKey)}`} 
                  alt="QR Code Pix" 
                  width="200" 
                  height="200" 
                />
              </div>
            )}
          </div>
          
          <p className="text-gray-300 mb-4">Ou copie o código Pix:</p>
          
          <div className="relative mb-6">
            <input
              type="text"
              readOnly
              value={pixKey}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg text-gray-400 text-sm p-3 pr-12 truncate"
            />
            <button
              onClick={handleCopy}
              disabled={paymentStatus !== 'LISTENING'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white disabled:cursor-not-allowed"
              aria-label="Copiar código Pix"
            >
              {copied ? <i className="fa-solid fa-check text-green-400"></i> : <CopyIcon />}
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center bg-gray-700/50 rounded-lg p-3 mb-4">
            <SpinnerIcon />
            <span className="text-green-400 font-semibold animate-pulse">Aguardando pagamento...</span>
          </div>
          <div className="flex items-center justify-center text-xs text-gray-400">
            <i className="fa-solid fa-lock mr-2"></i>
            <span>Pagamento 100% seguro.</span>
          </div>
       </div>
    );
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md mx-auto animate-fade-in mt-10">
      {paymentStatus !== 'APPROVED' && (
        <button onClick={onBack} className="text-emerald-400 hover:text-emerald-300 mb-6">&larr; Alterar pedido</button>
      )}
      {renderContent()}
    </div>
  );
};

export default PaymentPage;
