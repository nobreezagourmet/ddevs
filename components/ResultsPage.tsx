import React from 'react';

interface ResultsPageProps {
  onBack: () => void;
}

const topBuyers = [
  { name: 'Maria S.', quotas: 500 },
  { name: 'João P.', quotas: 450 },
  { name: 'Carlos A.', quotas: 300 },
  { name: 'Ana B.', quotas: 250 },
  { name: 'Lucas F.', quotas: 200 },
];

const pastWinners = [
  { name: 'Fernanda L.', prize: 'Moto Esportiva', date: '15/05/2024' },
  { name: 'Ricardo M.', prize: 'Viagem Internacional', date: '20/03/2024' },
  { name: 'Juliana R.', prize: 'iPhone 15 Pro', date: '10/01/2024' },
];

const ResultsPage: React.FC<ResultsPageProps> = ({ onBack }) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-2xl mx-auto animate-fade-in mt-10">
      <button onClick={onBack} className="text-emerald-400 hover:text-emerald-300 mb-6">&larr; Voltar para a rifa</button>
      <h1 className="text-3xl font-bold text-white mb-8 text-center">Resultados e Destaques</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Buyers */}
        <div>
          <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center"><i className="fa-solid fa-star mr-2"></i>Maiores Compradores</h2>
          <div className="bg-gray-900/80 rounded-lg p-4 space-y-3">
            {topBuyers.map((buyer, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/80 p-3 rounded-md">
                <div>
                  <p className="font-semibold text-white">{buyer.name}</p>
                  <p className="text-sm text-gray-400">{buyer.quotas} cotas</p>
                </div>
                <span className="text-lg font-bold text-emerald-400">#{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Past Winners */}
        <div>
          <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center"><i className="fa-solid fa-trophy mr-2"></i>Ganhadores Anteriores</h2>
          <div className="bg-gray-900/80 rounded-lg p-4 space-y-3">
            {pastWinners.map((winner, index) => (
              <div key={index} className="bg-gray-700/80 p-3 rounded-md">
                <p className="font-semibold text-white">{winner.name}</p>
                <p className="text-sm text-gray-400">Prêmio: {winner.prize}</p>
                <p className="text-xs text-gray-500">Data: {winner.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;