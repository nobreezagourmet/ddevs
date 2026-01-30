import React from 'react';

interface RulesPageProps {
  onBack: () => void;
}

const RulesPage: React.FC<RulesPageProps> = ({ onBack }) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-2xl mx-auto animate-fade-in mt-10">
      <button onClick={onBack} className="text-emerald-400 hover:text-emerald-300 mb-6">&larr; Voltar para a rifa</button>
      <div className="text-left text-gray-300 space-y-4">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Regulamento da Rifa</h1>
        
        <h2 className="text-xl font-semibold text-emerald-400">1. O Sorteio</h2>
        <p>O sorteio será realizado com base no resultado do primeiro prêmio da Loteria Federal, na data estipulada no título da rifa. Utilizaremos os 5 últimos dígitos do bilhete sorteado. Por exemplo, se o bilhete sorteado for "54321", o ganhador será o participante que possuir o número correspondente.</p>
        
        <h2 className="text-xl font-semibold text-emerald-400">2. Participação e Pagamento</h2>
        <p>A participação é confirmada apenas após o pagamento via Pix. O não pagamento até a data limite resultará no cancelamento automático da reserva, e o número voltará a ficar disponível para outros participantes. É de responsabilidade do participante verificar a confirmação do pagamento.</p>

        <h2 className="text-xl font-semibold text-emerald-400">3. Entrega do Prêmio</h2>
        <p>O prêmio será entregue ao ganhador sem custos de frete para todo o território nacional. Entraremos em contato através do e-mail e telefone cadastrados para combinar os detalhes da entrega. O prêmio é intransferível e não pode ser convertido em dinheiro.</p>

        <h2 className="text-xl font-semibold text-emerald-400">4. Política de Privacidade</h2>
        <p>Seus dados cadastrais (nome, e-mail, telefone) são utilizados exclusivamente para a gestão desta rifa e para contato com o ganhador. Não compartilhamos suas informações com terceiros.</p>
        
        <p className="pt-4 text-center text-gray-400">Ao participar, você declara que leu e concorda com todos os termos deste regulamento. Boa sorte!</p>
      </div>
    </div>
  );
};

export default RulesPage;