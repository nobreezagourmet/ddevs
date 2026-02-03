import React, { useState, useCallback } from 'react';
import RafflePage from './components/RafflePage';
import AuthPage from './components/AuthPage';
import MyNumbersPage from './components/MyNumbersPage';
import PaymentPage from './components/PaymentPage';
import ResultsPage from './components/ResultsPage';
import RulesPage from './components/RulesPage';
import Header from './components/Header';
import { AppView, Raffle, User, Purchase } from './types';

// Mock data for the raffle
const mockRaffle: Raffle = {
  id: 'rifa-carro-2024',
  title: '10.000 NO PIX OU IPHONE 17 PRO MAX',
  imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop',
  pricePerQuota: 25.50,
  totalQuotas: 100000,
  packages: [10, 50, 100, 500],
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.RAFFLE);
  const [selectedQuotas, setSelectedQuotas] = useState<number>(0);
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

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
      date: new Date().toLocaleString('pt-BR'),
    };

    setPurchaseHistory(prev => [...prev, newPurchase]);
    setCurrentView(AppView.MY_NUMBERS);
  }, [selectedQuotas]);

  const handleNavigate = useCallback((view: AppView) => {
    if (view === AppView.MY_NUMBERS && !authToken) {
      // alert("Você precisa estar logado para ver seus números.");
      setCurrentView(AppView.AUTH);
      return;
    }
    setCurrentView(view);
  }, [authToken]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setAuthToken(null);
    setPurchaseHistory([]);
    setSelectedQuotas(0);
    setCurrentView(AppView.RAFFLE);
  }, []);

  const renderContent = () => {
    const totalPrice = (selectedQuotas * mockRaffle.pricePerQuota);

    switch (currentView) {
      case AppView.RAFFLE:
        return <RafflePage raffle={mockRaffle} onPurchase={handlePurchaseClick} onNavigate={handleNavigate} />;
      case AppView.AUTH:
        return <AuthPage selectedQuotas={selectedQuotas} onBack={() => handleNavigate(AppView.RAFFLE)} onAuthSuccess={handleAuthSuccess} />;
      case AppView.PAYMENT:
        return <PaymentPage totalPrice={totalPrice} onBack={() => handleNavigate(AppView.RAFFLE)} onPaymentSuccess={handlePaymentSuccess} authToken={authToken} raffleId={mockRaffle.id} quantity={selectedQuotas} />;
      case AppView.MY_NUMBERS:
        return <MyNumbersPage user={currentUser!} onNewPurchase={() => handleNavigate(AppView.RAFFLE)} authToken={authToken} />;
      case AppView.RESULTS:
        return <ResultsPage onBack={() => handleNavigate(AppView.RAFFLE)} />;
      case AppView.RULES:
        return <RulesPage onBack={() => handleNavigate(AppView.RAFFLE)} />;
      default:
        return <RafflePage raffle={mockRaffle} onPurchase={handlePurchaseClick} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-inter p-4 flex flex-col items-center">
      {(currentUser) && <Header user={currentUser} onLogout={handleLogout} />}
      <main className="w-full max-w-4xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
