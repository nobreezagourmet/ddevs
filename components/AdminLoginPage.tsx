import React, { useState, FormEvent } from 'react';
import InputField from './InputField';
import { User } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

interface AdminLoginPageProps {
  onAuthSuccess: (user: User, token: string) => void;
  onBack: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAuthSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Credenciais inválidas.');
      }

      if (data.user && data.user.isAdmin) {
        onAuthSuccess(data.user, data.token);
      } else {
        throw new Error('Acesso negado. Esta conta não é de administrador.');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md mx-auto animate-fade-in mt-10">
       <button onClick={onBack} className="text-emerald-400 hover:text-emerald-300 mb-4">&larr; Voltar para a rifa</button>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Acesso Administrativo</h1>
        <p className="text-gray-300">Faça login para gerenciar a plataforma.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="admin-email"
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <InputField
          id="admin-password"
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary text-white py-3 px-4 rounded-lg text-lg uppercase tracking-wider flex items-center justify-center"
        >
          {isLoading ? <SpinnerIcon /> : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPage;
