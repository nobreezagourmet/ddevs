const axios = require('axios');
const { generateRealPixQRCode } = require('./realPixGenerator');

// XFLOW NÃO É PROVEDOR PIX REAL - USANDO SISTEMA PRÓPRIO
// XFLOW é provedor da Índia, não do Brasil
// Sistema agora gera QR Code PIX REAL do Banco Central

// MODO REAL - PAGAMENTO PIX FUNCIONAL
const generatePixPayment = async (amount, orderId, description) => {
    console.log(' GERANDO QR Code PIX REAL (Banco Central)...');
    console.log(' Valor:', amount);
    console.log(' Order ID:', orderId);
    console.log(' Descrição:', description);
    console.log(' XFLOW NÃO É PROVEDOR PIX BRASILEIRO');
    console.log(' USANDO SISTEMA PRÓPRIO PIX REAL');

    // Gerar QR Code PIX REAL (Banco Central)
    const pixData = generateRealPixQRCode(amount, orderId, description);
    
    console.log(' QR Code PIX REAL GERADO');
    console.log(' PIX Copia e Cola:', pixData.pixCopyPaste);
    console.log(' Chave PIX:', pixData.pixKey);
    console.log(' Payload:', pixData.payload);

    return {
        pixQRCode: pixData.qrCodeBase64,
        pixCopyPaste: pixData.pixCopyPaste,
        transactionId: `pix_real_${orderId}_${Date.now()}`,
        isTestMode: false, // MODO REAL
        isRealPayment: true,
        isRealPix: true, // PIX REAL DO BANCO CENTRAL
        payload: pixData.payload,
        amount: pixData.amount,
        merchantName: pixData.merchantName,
        merchantCity: pixData.merchantCity,
        txid: pixData.txid,
        pixKey: pixData.pixKey
    };
};

module.exports = { generatePixPayment };