const axios = require('axios');
const { generateRealPixQRCode } = require('./realPixGenerator');

// XFLOW PAYMENTS - API REAL
// URL CORRETA DA API XFLOW
const XFLOW_API_URL = process.env.XFLOW_API_URL || 'https://api.xflowpay.com/v1';

// MODO REAL - PAGAMENTO PIX FUNCIONAL
const generatePixPayment = async (amount, orderId, description) => {
    console.log(' CONFIGURANDO PAGAMENTO PIX XFLOW BRASIL...');
    console.log(' Valor:', amount);
    console.log(' Order ID:', orderId);
    console.log(' Descrição:', description);
    console.log(' URL API:', XFLOW_API_URL);

    try {
        // TENTAR API REAL XFLOW BRASIL
        console.log(' TENTANDO API REAL XFLOW BRASIL...');
        
        const pixGenerationEndpoint = `${XFLOW_API_URL}/payments/pix`;
        
        // Payload com credenciais reais
        const requestPayload = {
            client_id: 'e1c98954cc404cbcb2868af9b40c7a33',
            secret_key: '7RomIIydlFl1ZqAqtb5UKgUGyqm-cQqoS9Rrf6Zb9UazSU-gTmdLD0w_DFWXUocU0L_ZwWic2QNMtmxVNb_nWg',
            amount: amount,
            order_id: orderId,
            description: description,
            currency: 'BRL',
            payment_method: 'pix',
            webhook_url: 'https://ddevs-86w2.onrender.com/api/payment/webhook',
            webhook_secret: '2wkDHXXB1S83ptPveRWdEnpCYHX12893mk123jH899'
        };

        // Headers para API XFLOW REAL
        const requestHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 7RomIIydlFl1ZqAqtb5UKgUGyqm-cQqoS9Rrf6Zb9UazSU-gTmdLD0w_DFWXUocU0L_ZwWic2QNMtmxVNb_nWg`
        };

        console.log(' ENVIANDO REQUISIÇÃO PARA XFLOW BRASIL...');
        console.log(' Endpoint:', pixGenerationEndpoint);
        console.log(' Payload:', { ...requestPayload, secret_key: '[HIDDEN]' });

        // CHAMADA REAL À API XFLOW BRASIL
        const response = await axios.post(pixGenerationEndpoint, requestPayload, { 
            headers: requestHeaders,
            timeout: 30000 // 30 segundos timeout
        });
        
        console.log(' RESPOSTA XFLOW BRASIL RECEBIDA:', response.data);

        // Processar resposta real da XFLOW
        const xflowResponseData = response.data;
        
        return {
            pixQRCode: xflowResponseData.qr_code_base64 || xflowResponseData.qrCode || xflowResponse_data.pixQrCode,
            pixCopyPaste: xflowResponseData.pix_copy_paste || xflowResponseData.pixKey || xflowResponse_data.pixCopyPaste,
            transactionId: xflowResponseData.transaction_id || xflowResponseData.id || xflowResponse_data.transactionId,
            isTestMode: false, // MODO REAL
            isRealPayment: true,
            isXflowReal: true // XFLOW BRASIL REAL
        };

    } catch (error) {
        console.error('❌ ERRO NA API XFLOW BRASIL:', error.message);
        console.error('❌ DETALHES DO ERRO:', error.response?.data || error.message);
        
        // SE API REAL FALHAR, GERAR QR CODE REAL COM WEBHOOK
        console.log('🔄 GERANDO QR Code PIX REAL (Banco Central)...');
        
        // Gerar QR Code PIX REAL
        const pixData = generateRealPixQRCode(amount, orderId, description);
        
        console.log('✅ QR Code PIX REAL GERADO');
        console.log('📋 PIX Copia e Cola:', pixData.pixCopyPaste);
        console.log('🔑 Chave PIX:', pixData.pixKey);
        console.log('💾 Payload:', pixData.payload);

        return {
            pixQRCode: pixData.qrCodeBase64,
            pixCopyPaste: pixData.pixCopyPaste,
            transactionId: `pix_real_${orderId}_${Date.now()}`,
            isTestMode: false, // MODO REAL
            isRealPayment: true,
            isRealPix: true, // PIX REAL DO BANCO CENTRAL
            requiresRealPayment: true, // EXIGE PAGAMENTO REAL
            payload: pixData.payload,
            amount: pixData.amount,
            merchantName: pixData.merchantName,
            merchantCity: pixData.merchantCity,
            txid: pixData.txid,
            pixKey: pixData.pixKey,
            webhookUrl: 'https://ddevs-86w2.onrender.com/api/payment/webhook'
        };
    }
};

module.exports = { generatePixPayment };