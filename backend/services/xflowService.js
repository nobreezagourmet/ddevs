const axios = require('axios');

const XFLOW_API_URL = process.env.XFLOW_API_URL || 'https://api.xflowpayments.com/v1'; // === CRÍTICO: SUBSTITUIR PELO REAL ===

const generatePixPayment = async (amount, orderId, description) => {
    try {
        console.log('🚀 MODO TESTE - Simulando API da XFLOW para gerar PIX...');
        console.log('💰 Valor:', amount);
        console.log('📦 Order ID:', orderId);
        console.log('📝 Descrição:', description);

        // MODO TESTE - SIMULAÇÃO PARA FUNCIONAR IMEDIATAMENTE
        // Em produção, substitua com chamada real da API XFLOW
        const mockQRCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==TEST_${orderId}`;
        const mockPixCopyPaste = `pix_test_${orderId}_${amount}_${Date.now()}`;
        const mockTransactionId = `xflow_test_${orderId}_${Date.now()}`;

        console.log('✅ PIX GERADO EM MODO TESTE');
        console.log('📋 QR Code:', mockQRCode.substring(0, 50) + '...');
        console.log('💳 Copy/Paste:', mockPixCopyPaste);

        return {
            pixQRCode: mockQRCode,
            pixCopyPaste: mockPixCopyPaste,
            transactionId: mockTransactionId,
        };

    } catch (error) {
        console.error('❌ Erro ao gerar PIX (modo teste):', error.message);
        throw new Error('Falha na geração do PIX.');
    }
};

module.exports = { generatePixPayment };