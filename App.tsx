import React, { useState, useCallback } from 'react';
import RafflePage from './components/RafflePage';
import AuthPage from './components/AuthPage';
import MyNumbersPage from './components/MyNumbersPage';
import PaymentPage from './components/PaymentPage';
import ResultsPage from './components/ResultsPage';
import RulesPage from './components/RulesPage';
import Header from './components/Header';
import RaffleList from './components/RaffleList';
import LeadTable from './components/LeadTable';
import CustomerList from './components/CustomerList';
import CustomerTab from './components/CustomerTab';
import { AppView, Raffle, User, Purchase } from './types';
import RaffleService, { Raffle as RaffleServiceType } from './services/raffleService';

// REMOVIDO: Não usar mais rifa fictícia - apenas rifas do backend

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.RAFFLE);
  const [selectedQuotas, setSelectedQuotas] = useState<number>(0);
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [availableRaffles, setAvailableRaffles] = useState<RaffleServiceType[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<RaffleServiceType | null>(null);

  const handlePurchaseClick = useCallback((quotas: number) => {
    setSelectedQuotas(quotas);
    if (authToken) {
      setCurrentView(AppView.PAYMENT);
    } else {
      setCurrentView(AppView.AUTH);
    }
  }, [authToken]);
  
  const handleAuthSuccess = useCallback((user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    
    // Se veio de "Meus Números" (selectedQuotas = 0), volte para MY_NUMBERS
    // Se veio de "Comprar" (selectedQuotas > 0), vá para PAYMENT
    if (selectedQuotas === 0) {
      setCurrentView(AppView.MY_NUMBERS);
    } else {
      setCurrentView(AppView.PAYMENT);
    }
  }, [selectedQuotas]);

  const handlePaymentSuccess = useCallback(() => {
    // A geração de números agora deve ser feita pelo backend.
    // Esta lógica de front-end é apenas uma simulação para o fluxo.
    const numbers = new Set<string>();
    const limit = Math.min(selectedQuotas, 100000); 
    while (numbers.size < limit) {
      const randomNumber = Math.floor(Math.random() * 100000);
      const formattedNumber = randomNumber.toString().padStart(5, '0');
      numbers.add(formattedNumber);
    }
    
    const newPurchase: Purchase = {
      id: new Date().toISOString(),
      quotas: selectedQuotas,
      numbers: Array.from(numbers).sort(),
      date: new Date().toISOString(),
      raffleTitle: selectedRaffle?.title || 'Rifa não selecionada',
    };

    setPurchaseHistory(prev => [...prev, newPurchase]);
    setSelectedQuotas(0);
    setCurrentView(AppView.MY_NUMBERS);
  }, [selectedQuotas, selectedRaffle]);

  // 🎯 Handler para seleção de rifa
  const handleRaffleSelect = useCallback((raffle: RaffleServiceType) => {
    console.log('🎯 Rifa selecionada:', raffle.title);
    setSelectedRaffle(raffle);
    setCurrentView(AppView.RAFFLE);
  }, []);

  // 🎯 Verificar se usuário é admin para mostrar leads
  const isAdmin = currentUser?.isAdmin || false;

  const handleNavigate = useCallback((view: AppView) => {
    if (view === AppView.MY_NUMBERS && !authToken) {
      setCurrentView(AppView.AUTH);
    } else if (view === AppView.LEADS && !isAdmin) {
      setCurrentView(AppView.RAFFLE);
    } else {
      setCurrentView(view);
    }
  }, [authToken, isAdmin]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setAuthToken(null);
    setPurchaseHistory([]);
    setSelectedQuotas(0);
    setCurrentView(AppView.RAFFLE);
  }, []);

  const renderContent = () => {
    const totalPrice = (selectedQuotas * (selectedRaffle?.pricePerQuota || 0));

    switch (currentView) {
      case AppView.RAFFLE:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">🎯 Rifas Disponíveis</h1>
              <p className="text-gray-400">Escolha uma rifa para participar</p>
            </div>
            <RaffleList onRaffleSelect={handleRaffleSelect} />
            {selectedRaffle && (
              <div className="mt-8">
                <RafflePage 
                  raffle={{
                    id: selectedRaffle.id,
                    title: selectedRaffle.title,
                    imageUrl: selectedRaffle.imageUrl,
                    pricePerQuota: selectedRaffle.pricePerQuota,
                    totalQuotas: selectedRaffle.totalQuotas,
                    packages: [10, 50, 100, 500]
                  }} 
                  onPurchase={handlePurchaseClick} 
                  onNavigate={handleNavigate} 
                />
              </div>
            )}
          </div>
        );
      case AppView.AUTH:
        return <AuthPage selectedQuotas={selectedQuotas} onBack={() => handleNavigate(AppView.RAFFLE)} onAuthSuccess={handleAuthSuccess} />;
      case AppView.PAYMENT:
        return <PaymentPage totalPrice={totalPrice} onBack={() => handleNavigate(AppView.RAFFLE)} onPaymentSuccess={handlePaymentSuccess} authToken={authToken} raffleId={selectedRaffle?.id || ''} quantity={selectedQuotas} />;
      case AppView.MY_NUMBERS:
        return <MyNumbersPage user={currentUser!} onNewPurchase={() => handleNavigate(AppView.RAFFLE)} authToken={authToken} />;
      case AppView.RESULTS:
        return <ResultsPage onBack={() => handleNavigate(AppView.RAFFLE)} />;
      case AppView.RULES:
        return <RulesPage onBack={() => handleNavigate(AppView.RAFFLE)} />;
      case AppView.LEADS:
        return <LeadTable token={authToken!} />;
      case AppView.CUSTOMERS:
        return <CustomerTab token={authToken!} />;
      default:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">🎯 Rifas Disponíveis</h1>
              <p className="text-gray-400">Escolha uma rifa para participar</p>
            </div>
            <RaffleList onRaffleSelect={handleRaffleSelect} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-inter p-4 flex flex-col items-center">
      {(currentUser) && <Header user={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />}
      <main className="w-full max-w-4xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
