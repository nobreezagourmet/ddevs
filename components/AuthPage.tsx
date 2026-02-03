import React, { useState, useCallback, FormEvent } from 'react';
import api, { API_URL } from '../src/services/api';
import { AuthMode, User } from '../types';
import InputField from './InputField';
import { formatPhoneNumber } from '../utils/formatters';
import SpinnerIcon from './icons/SpinnerIcon';

// � LOG DE SUCESSO RESETADO
console.log('� SISTEMA RESETADO - API:', API_URL);

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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 11) {
      setPhone(formatPhoneNumber(e.target.value));
    }
  };

  const validateForm = useCallback(() => {
    if (mode === AuthMode.REGISTER) {
      if (!name.trim()) {
        setError('Por favor, insira seu nome completo.');
        return false;
      }
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      return false;
    }

    if (mode === AuthMode.REGISTER) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 11) {
        setError('O telefone deve ter 11 dígitos (DDD + número).');
        return false;
      }
    }
    
    if (!password || password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
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

    // ✅ CONEXÃO SEGURA COM RENDER ESTABELECIDA
    console.log('✅ CONEXÃO SEGURA COM RENDER ESTABELECIDA');

    // 🚨 CORREÇÃO DEFINITIVA - URL FIXA DO RENDER
    const registerUrl = 'https://ddevs-86w2.onrender.com/api/auth/register';
    const loginUrl = 'https://ddevs-86w2.onrender.com/api/auth/login';
    
    const endpoint = mode === AuthMode.LOGIN ? loginUrl : registerUrl;
    const payload = mode === AuthMode.LOGIN ? { email, password } : { name, email, phone, password };

    // --- LOG DE DEBUG PARA VERIFICAR URL ---
    console.log('🔥 URL FIXA DO RENDER:', endpoint);
    console.log('Dados enviados:', payload);
    console.log('Método:', 'POST');

    try {
      console.log('--- INICIANDO FETCH COM URL FIXA ---');
      
      // 🚨 FETCH COM URL FIXA - SEM RELATIVOS
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // DEBUG: Mostrar resposta completa
      console.log('📡 RESPOSTA SERVIDOR:', response.status);
      console.log('🔗 URL CHAMADA:', endpoint);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocorreu um erro. Tente novamente.');
      }

      if (mode === AuthMode.REGISTER) {
        // Após registro bem-sucedido, tenta fazer login para obter o token
        console.log('🚀 CHAMANDO LOGIN COM URL FIXA:', loginUrl);
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
         
         // REDIRECIONAR PARA PAINEL PRINCIPAL APÓS CADASTRO BEM-SUCEDIDO
         console.log('✅ Cadastro bem-sucedido! Redirecionando para painel...');
         window.location.href = 'https://ddevss.vercel.app';

      } else {
        onAuthSuccess(data.data, data.data.token);
        
        // REDIRECIONAR PARA PAINEL PRINCIPAL APÓS LOGIN BEM-SUCEDIDO
        console.log('✅ Login bem-sucedido! Redirecionando para painel...');
        window.location.href = 'https://ddevss.vercel.app'; // ou '/index.html' se estiver no mesmo domínio
      }

    } catch (error) {
      // 🚨 TRATAMENTO DE ERRO COM URL EXATA
      console.error('--- ERRO CAPTURADO ---');
      console.error('❌ FALHA NA URL:', endpoint);
      console.error('❌ URL COMPLETA TENTADA:', endpoint);
      console.error('❌ SERVIDOR RESPONDEU:', error.response?.status);
      console.error('❌ ERRO COMPLETO:', error);
      
      // Verificar se o erro é de JSON inválido
      if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
        console.error('❌ ERRO DE JSON - Servidor não retornou JSON válido');
        console.error('❌ POSSÍVEL CAUSA: Servidor retornou HTML 404 em vez de JSON');
        setError('Erro de comunicação com o servidor. Verificando conexão...');
      } else {
        setError(error.message || 'Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
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
