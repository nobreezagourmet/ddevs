import React, { useState, useCallback, FormEvent } from 'react';
import API_URL from '../src/services/api';
import { AuthMode, User } from '../types';
import InputField from './InputField';
import { formatPhoneNumber } from '../utils/formatters';
import SpinnerIcon from './icons/SpinnerIcon';

// 🎯 SOLUÇÃO FINAL - BACKEND FUNCIONANDO!
console.log('🎯 API_URL:', API_URL);

interface AuthPageProps {
  selectedQuotas: number;
  onBack: () => void;
  onAuthSuccess: (user: User, token: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ selectedQuotas, onBack, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.REGISTER);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = useCallback(() => {
    if (mode === AuthMode.REGISTER && !name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    if (!email.includes('@')) {
      setError('Email inválido');
      return false;
    }
    if (mode === AuthMode.REGISTER && !phone.trim()) {
      setError('Telefone é obrigatório');
      return false;
    }
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    setError('');
    return true;
  }, [email, phone, password, mode, name]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    // 🎯 SOLUÇÃO FINAL - URL DIRETA
    const registerUrl = `${API_URL}/auth/register`;
    const loginUrl = `${API_URL}/auth/login`;
    
    const endpoint = mode === AuthMode.LOGIN ? loginUrl : registerUrl;
    const payload = mode === AuthMode.LOGIN ? { email, password } : { name, email, phone, password };

    console.log('🎯 ENVIANDO PARA:', endpoint);
    console.log('🎯 DADOS:', payload);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('🎯 RESPOSTA:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Ocorreu um erro. Tente novamente.');
      }

      if (mode === AuthMode.REGISTER) {
        // Login após registro
        const loginResponse = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ email, password }),
         });
         
         const loginData = await loginResponse.json();
         
         if (!loginResponse.ok) {
             throw new Error(loginData.message || 'Falha ao fazer login após o registro.');
         }
         onAuthSuccess(loginData.data, loginData.data.token);
         
         console.log('🎯 CADASTRO SUCESSO!');
         window.location.href = 'https://ddevss.vercel.app';

      } else {
        onAuthSuccess(data.data, data.data.token);
        
        console.log('🎯 LOGIN SUCESSO!');
        window.location.href = 'https://ddevss.vercel.app';
      }

    } catch (error) {
      console.error('🎯 ERRO:', error);
      setError(error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 11) {
      setPhone(formatPhoneNumber(e.target.value));
    }
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md mx-auto animate-fade-in mt-10">
      <button onClick={onBack} className="text-emerald-400 hover:text-emerald-300 mb-4">&larr; Voltar para a rifa</button>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Quase lá!</h1>
        <p className="text-gray-300">Para comprar suas <span className="font-bold text-white">{selectedQuotas} cotas</span>, por favor, acesse ou crie sua conta.</p>
      </div>

      <div className="flex bg-gray-700 rounded-lg p-1 mb-6">
        <button
          onClick={() => setMode(AuthMode.REGISTER)}
          className={`w-1/2 py-2.5 rounded-md text-sm font-medium transition-colors uppercase ${mode === AuthMode.REGISTER ? 'bg-emerald-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'}`}
        >
          Criar Conta
        </button>
        <button
          onClick={() => setMode(AuthMode.LOGIN)}
          className={`w-1/2 py-2.5 rounded-md text-sm font-medium transition-colors uppercase ${mode === AuthMode.LOGIN ? 'bg-emerald-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'}`}
        >
          Entrar
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === AuthMode.REGISTER && (
            <InputField
              id="name"
              label="Nome Completo"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
        )}
        <InputField
          id="email"
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        {mode === AuthMode.REGISTER && (
          <InputField
            id="phone"
            label="Telefone com DDD"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            required
            maxLength={15}
            disabled={isLoading}
          />
        )}
        <InputField
          id="password"
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
          className="w-full btn-primary text-white py-3 px-4 rounded-lg text-lg disabled:bg-gray-600 disabled:cursor-not-allowed uppercase tracking-wider flex items-center justify-center"
        >
          {isLoading ? <SpinnerIcon /> : (mode === AuthMode.REGISTER ? 'Criar Conta e Continuar' : 'Entrar e Continuar')}
        </button>
      </form>
    </div>
  );
};

export default AuthPage;
