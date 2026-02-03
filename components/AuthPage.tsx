import React, { useState, useCallback, FormEvent } from 'react';
import { AuthMode, User } from '../types';
import InputField from './InputField';
import { formatPhoneNumber } from '../utils/formatters';
import SpinnerIcon from './icons/SpinnerIcon';

// 🎯 SOLUÇÃO FINAL - URL DIRETA DO RENDER
const API_URL = 'https://ddevs-86w2.onrender.com/api';
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
      setError('E-mail é obrigatório');
      return false;
    }
    if (!password.trim()) {
      setError('Senha é obrigatória');
      return false;
    }
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    setError('');
    return true;
  }, [mode, name, email, password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    // 🎯 URL DIRETA DO RENDER - SEM CONFLITOS
    const endpoint = mode === AuthMode.LOGIN 
      ? `${API_URL}/auth/login` 
      : `${API_URL}/auth/register`;
    
    const payload = mode === AuthMode.LOGIN 
      ? { email, password } 
      : { name, email, phone, password };

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

      console.log('🎯 STATUS:', response.status);
      console.log('🎯 OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ERRO SERVIDOR:', errorText);
        
        if (response.status === 404) {
          throw new Error('Servidor não encontrado. Tente novamente.');
        }
        
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🎯 RESPOSTA:', data);

      if (data.success) {
        if (mode === AuthMode.REGISTER) {
          // Login automático após registro
          const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          
          const loginData = await loginResponse.json();
          
          if (loginData.success) {
            onAuthSuccess(loginData.data, loginData.data.token);
            console.log('🎯 CADASTRO E LOGIN SUCESSO!');
            window.location.href = 'https://ddevss.vercel.app';
          }
        } else {
          onAuthSuccess(data.data, data.data.token);
          console.log('🎯 LOGIN SUCESSO!');
          window.location.href = 'https://ddevss.vercel.app';
        }
      } else {
        throw new Error(data.message || 'Ocorreu um erro. Tente novamente.');
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
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">
            {mode === AuthMode.LOGIN ? 'Bem-vindo de volta!' : 'Criar conta'}
          </h2>
          <p className="text-gray-400">
            {mode === AuthMode.LOGIN 
              ? 'Faça login para continuar' 
              : 'Preencha os dados para criar sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === AuthMode.REGISTER && (
            <InputField
              label="Nome completo"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          )}

          <InputField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />

          {mode === AuthMode.REGISTER && (
            <InputField
              label="Telefone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(11) 99999-9999"
              maxLength={15}
              required
            />
          )}

          <InputField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
          />

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
                {mode === AuthMode.LOGIN ? 'Entrando...' : 'Cadastrando...'}
              </>
            ) : (
              <>
                {mode === AuthMode.LOGIN ? 'Entrar' : 'Criar conta'}
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setMode(mode === AuthMode.LOGIN ? AuthMode.REGISTER : AuthMode.LOGIN)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {mode === AuthMode.LOGIN 
              ? 'Não tem uma conta? Criar conta' 
              : 'Já tem uma conta? Fazer login'}
          </button>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-gray-400 hover:text-white transition-colors"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
