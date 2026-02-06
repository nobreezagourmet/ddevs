const axios = require('axios');
const { generateRealPixQRCode } = require('./pixGenerator');

// VERIFICAR URL CORRETA DA API XFLOW
const XFLOW_API_URL = process.env.XFLOW_API_URL || 'https://api.xflow.com/v1'; // URL corrigida

// MODO TESTE - ENQUANTO API XFLOW NÃO FUNCIONA
const generatePixPayment = async (amount, orderId, description) => {
    console.log('🚀 CONFIGURANDO PAGAMENTO PIX...');
    console.log('💰 Valor:', amount);
    console.log('📦 Order ID:', orderId);
    console.log('📝 Descrição:', description);

    // Gerar QR Code PIX REAL
    const pixData = generateRealPixQRCode(amount, orderId, description);
    
    console.log('✅ QR Code PIX GERADO (REAL)');
    console.log('📋 PIX Copia e Cola:', pixData.pixCopyPaste);
    console.log('🔗 Transaction ID:', `xflow_${orderId}_${Date.now()}`);

    return {
        pixQRCode: pixData.qrCodeBase64,
        pixCopyPaste: pixData.pixCopyPaste,
        transactionId: `xflow_${orderId}_${Date.now()}`,
        isTestMode: true, // Flag para identificar modo teste
        payload: pixData.payload // Payload PIX completo
    };
};

module.exports = { generatePixPayment };