import React, { useState, useCallback, FormEvent } from 'react';
import { AuthMode, User } from '../types';
import InputField from './InputField';
import { formatPhoneNumber } from '../utils/formatters';
import SpinnerIcon from './icons/SpinnerIcon';

// 🎯 VARIÁVEL DE AMBIENTE DA VERCEL
const API_URL = 'https://ddevs-86w2.onrender.com/api'; // FORÇADO MANUALMENTE
console.log('🎯 API_URL (Environment):', API_URL);
console.log('🎯 import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🚨 VERSÃO CRÍTICA: 2025-02-04-12:57 - BACKEND-FRONTEND SINCRONIZADO');
console.log('🚨 ARQUIVO JS FORÇADO: index-D5wzBn44.js');
console.log('🚨 BACKEND URL: https://ddevs-86w2.onrender.com/api');
console.log('🚨 FRONTEND URL: https://dark-fawn-phi.vercel.app');

interface AuthPageProps {
  selectedQuotas: number;
  onBack: () => void;
  onAuthSuccess: (user: User, token: string) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const AuthPage: React.FC<AuthPageProps> = ({ selectedQuotas, onBack, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.REGISTER);
  
  // 🎯 ÚNICO OBJETO DE ESTADO PARA O FORMULÁRIO
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (mode === AuthMode.REGISTER && !formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      setError('E-mail é obrigatório');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Senha é obrigatória');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    setError('');
    return true;
  }, [mode, formData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    // 🎯 URL COMPLETA FORÇADA MANUALMENTE
    const baseUrl = 'https://ddevs-86w2.onrender.com/api';
    const endpoint = mode === AuthMode.LOGIN 
      ? `${baseUrl}/auth/login` 
      : `${baseUrl}/auth/register`;
    
    console.log('🚀 DEBUG - baseUrl:', baseUrl);
    console.log('🚀 DEBUG - endpoint:', endpoint);
    console.log('🚀 DEBUG - mode:', mode);
    
    // 🎯 PAYLOAD CORRETO BASEADO NO MODO
    const payload = mode === AuthMode.LOGIN 
      ? { 
          email: formData.email, 
          password: formData.password 
        } 
      : { 
          name: formData.name, 
          email: formData.email, 
          phone: formData.phone, 
          password: formData.password 
        };

    console.log('🎯 ENVIANDO PARA:', endpoint);
    console.log('🎯 DADOS:', payload);

    try {
      // 🎯 FETCH COM MÉTODO POST E HEADERS OBRIGATÓRIOS
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // OBRIGATÓRIO
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload), // OBRIGATÓRIO
      });

      console.log('🎯 STATUS:', response.status);
      console.log('🎯 OK:', response.ok);

      // 🚨 CORREÇÃO CRÍTICA - VERIFICAÇÃO ANTES DO JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ERRO SERVIDOR:', errorText);
        
        if (response.status === 404) {
          throw new Error('Endpoint não encontrado. Verifique a configuração da API.');
        }
        
        if (errorText.includes('Not Found')) {
          throw new Error('Rota não encontrada. Verifique se o backend está acessível.');
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
            body: JSON.stringify({ 
              email: formData.email, 
              password: formData.password 
            }),
          });
          
          const loginData = await loginResponse.json();
          
          if (loginData.success) {
            onAuthSuccess(loginData.data, loginData.data.token);
            console.log('🎯 CADASTRO E LOGIN SUCESSO!');
            // Removido redirect forçado - deixar o App.tsx controlar
          }
        } else {
          onAuthSuccess(data.data, data.data.token);
          console.log('🎯 LOGIN SUCESSO!');
          // Removido redirect forçado - deixar o App.tsx controlar
        }
      } else {
        throw new Error(data.message || 'Ocorreu um erro. Tente novamente.');
      }

    } catch (error) {
      console.error('🎯 ERRO:', error);
      
      // 🚨 TRATAMENTO ESPECÍFICO PARA ERROS DE JSON
      if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
        setError('Erro de comunicação com o servidor. Verifique a configuração da API.');
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        setError('Servidor não encontrado. Verifique a URL da API e o CORS.');
      } else if (error.message.includes('CORS')) {
        setError('Erro de CORS. Configure o backend para aceitar requisições do domínio devsss-five.vercel.app');
      } else {
        setError(error.message || 'Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 11) {
      handleInputChange('phone', formatPhoneNumber(e.target.value));
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
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          )}

          <InputField
            label="E-mail"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="seu@email.com"
            required
          />

          {mode === AuthMode.REGISTER && (
            <InputField
              label="Telefone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="(11) 99999-9999"
              maxLength={15}
              required
            />
          )}

          <InputField
            label="Senha"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
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
