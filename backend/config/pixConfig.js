// 🚀 CONFIGURAÇÃO DE CHAVE PIX REAL
// Configure aqui sua chave PIX real do banco

// 🔑 CHAVE PIX REAL (configure sua chave aqui)
const REAL_PIX_KEY = process.env.REAL_PIX_KEY || '12345678909'; // Exemplo: seu CPF

// 🏢 DADOS DA CONTA
const MERCHANT_NAME = process.env.MERCHANT_NAME || 'Seu Nome';
const MERCHANT_CITY = process.env.MERCHANT_CITY || 'Sua Cidade';

// 🎯 CONFIGURAÇÃO DO PAGAMENTO
const PAYMENT_CONFIG = {
    // Chave PIX real (CPF, CNPJ, Email ou Telefone)
    pixKey: REAL_PIX_KEY,
    
    // Nome do beneficiário
    merchantName: MERCHANT_NAME,
    
    // Cidade do beneficiário
    merchantCity: MERCHANT_CITY,
    
    // Informações da conta (se necessário)
    merchantInfo: {
        name: MERCHANT_NAME,
        city: MERCHANT_CITY,
        key: REAL_PIX_KEY
    }
};

console.log('🎯 CONFIGURAÇÃO PIX REAL:');
console.log('🔑 Chave PIX:', PAYMENT_CONFIG.pixKey);
console.log('🏢 Nome:', PAYMENT_CONFIG.merchantName);
console.log('🌆 Cidade:', PAYMENT_CONFIG.merchantCity);

module.exports = PAYMENT_CONFIG;
