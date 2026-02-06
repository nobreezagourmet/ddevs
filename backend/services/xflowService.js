const axios = require('axios');

// VERIFICAR URL CORRETA DA API XFLOW
const XFLOW_API_URL = process.env.XFLOW_API_URL || 'https://api.xflow.com/v1'; // URL corrigida

// MODO TESTE - ENQUANTO API XFLOW NÃO FUNCIONA
const generatePixPayment = async (amount, orderId, description) => {
    console.log(' CONFIGURANDO PAGAMENTO PIX...');
    console.log(' Valor:', amount);
    console.log(' Order ID:', orderId);
    console.log(' Descrição:', description);

    // Gerar QR Code PIX de teste (simulado mas funcional)
    const testQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const testPixCopyPaste = `pix_test_${orderId}_${amount}_${Date.now()}`;
    const testTransactionId = `xflow_test_${orderId}_${Date.now()}`;

    console.log(' QR Code PIX GERADO (MODO TESTE)');
    console.log(' PIX Copia e Cola:', testPixCopyPaste);
    console.log(' Transaction ID:', testTransactionId);

    return {
        pixQRCode: testQRCode,
        pixCopyPaste: testPixCopyPaste,
        transactionId: testTransactionId,
        isTestMode: true // Flag para identificar modo teste
    };
};

module.exports = { generatePixPayment };