import React, { useState, useMemo } from 'react';
import { AppView, Raffle } from '../types';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import Footer from './Footer';

interface RafflePageProps {
  raffle: Raffle;
  onPurchase: (quotas: number) => void;
  onNavigate: (view: AppView) => void;
}

const RafflePage: React.FC<RafflePageProps> = ({ raffle, onPurchase, onNavigate }) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [soldQuotas] = useState(67543); // Mock data for progress bar

  const totalPrice = useMemo(() => {
    return (quantity * raffle.pricePerQuota).toFixed(2).replace('.', ',');
  }, [quantity, raffle.pricePerQuota]);

  const progressPercentage = useMemo(() => {
    return (soldQuotas / raffle.totalQuotas) * 100;
  }, [soldQuotas, raffle.totalQuotas]);

  const handleIncrement = () => {
    setQuantity((prev) => prev + 10);
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(0, prev - 10));
  };
  
  const handlePackageSelect = (pkgQuantity: number) => {
    setQuantity(pkgQuantity);
  }

  return (
    <>
      <div className="rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Hero Section */}
        <div 
          className="relative bg-cover bg-center h-64 md:h-80 flex flex-col justify-center items-center text-center p-4" 
          style={{backgroundImage: `url(${raffle.imageUrl})`}}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight shadow-text">
              {raffle.title}
            </h1>
            <p className="mt-2 text-lg text-emerald-300 font-medium">
              Participe e concorra a prêmios incríveis!
            </p>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-gray-800/80 backdrop-blur-sm p-6 md:p-8 -mt-16 relative z-20 mx-4 md:mx-auto md:max-w-2xl rounded-2xl border border-gray-700">
          
          {/* Progress Bar */}
          <div className="mb-6">
            <h3 className="text-center font-semibold text-gray-300 mb-2">
              {soldQuotas.toLocaleString('pt-BR')} de {raffle.totalQuotas.toLocaleString('pt-BR')} cotas vendidas!
            </h3>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500" 
                style={{width: `${progressPercentage}%`}}
              ></div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-center text-gray-300 mb-4">Selecione um pacote:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {raffle.packages.map((pkg) => (
              <div key={pkg} className="relative">
                <button
                  onClick={() => handlePackageSelect(pkg)}
                  className={`w-full h-full bg-gray-700 hover:bg-emerald-600 text-white py-3 px-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${quantity === pkg ? 'ring-2 ring-emerald-500' : ''}`}
                >
                  {pkg} cotas
                </button>
                {pkg === 100 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    Mais Popular
                  </span>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <p className="text-emerald-400 font-semibold text-lg">
              R$ {raffle.pricePerQuota.toFixed(2).replace('.', ',')} por cota
            </p>
            <div className="flex items-center justify-center bg-gray-700 rounded-lg p-2">
              <button
                onClick={handleDecrement}
                disabled={quantity === 0}
                className="p-3 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                aria-label="Diminuir 10 cotas"
              >
                <MinusIcon />
              </button>
              <span className="w-24 text-center bg-transparent text-white text-2xl font-bold mx-2" aria-live="polite">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="p-3 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
                aria-label="Aumentar 10 cotas"
              >
                <PlusIcon />
              </button>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 text-center mb-6">
            <p className="text-gray-400">Total a pagar</p>
            <p className="text-4xl font-extrabold text-white">R$ {totalPrice}</p>
          </div>
          
          <button
            onClick={() => onPurchase(quantity)}
            disabled={quantity === 0}
            className="w-full btn-primary text-white py-4 px-4 rounded-lg text-lg hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none uppercase tracking-wider"
          >
            Comprar Agora
          </button>
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </>
  );
};

export default RafflePage;