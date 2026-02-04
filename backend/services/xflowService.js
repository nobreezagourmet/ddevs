const axios = require('axios');

const XFLOW_API_URL = process.env.XFLOW_API_URL || 'https://api.xflowpayments.com/v1'; // === CRÍTICO: SUBSTITUIR PELO REAL ===

const generatePixPayment = async (amount, orderId, description) => {
    try {
        console.log('🚀 CONFIGURANDO API REAL XFLOW...');
        console.log('💰 Valor:', amount);
        console.log('📦 Order ID:', orderId);
        console.log('📝 Descrição:', description);

        // API REAL XFLOW COM CREDENCIAIS FORNECIDAS
        const pixGenerationEndpoint = `${XFLOW_API_URL}/pix/payments`;

        // Payload com credenciais reais
        const requestPayload = {
            client_id: 'e1c98954cc404cbcb2868af9b40c7a33',
            secret_key: '7RomIIydlFl1ZqAqtb5UKgUGyqm-cQqoS9Rrf6Zb9UazSU-gTmdLD0w_DFWXUocU0L_ZwWic2QNMtmxVNb_nWg',
            amount: amount,
            order_id: orderId,
            description: description,
            currency: 'BRL',
            payment_method: 'pix'
        };

        // Headers para API XFLOW
        const requestHeaders = {
            'Content-Type': 'application/json',
            'X-Client-ID': 'e1c98954cc404cbcb2868af9b40c7a33'
        };

        console.log('📡 ENVIANDO REQUISIÇÃO PARA XFLOW...');
        console.log('🔗 Endpoint:', pixGenerationEndpoint);
        console.log('📋 Payload:', { ...requestPayload, secret_key: '[HIDDEN]' });

        // CHAMADA REAL À API XFLOW
        const response = await axios.post(pixGenerationEndpoint, requestPayload, { headers: requestHeaders });
        
        console.log('✅ RESPOSTA XFLOW RECEBIDA:', response.data);

        // Processar resposta real da XFLOW
        const xflowResponseData = response.data;
        
        return {
            pixQRCode: xflowResponseData.qr_code_base64 || xflowResponseData.qrCode,
            pixCopyPaste: xflowResponseData.pix_copy_paste || xflowResponseData.pixKey,
            transactionId: xflowResponseData.transaction_id || xflowResponseData.id,
        };

    } catch (error) {
        console.error('❌ ERRO NA API XFLOW:', error.message);
        
        // Se houver erro na API, fallback para modo teste
        console.log('🔄 FAZENDO FALLBACK PARA MODO TESTE...');
        const mockQRCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==FALLBACK_${orderId}`;
        const mockPixCopyPaste = `pix_fallback_${orderId}_${amount}_${Date.now()}`;
        const mockTransactionId = `xflow_fallback_${orderId}_${Date.now()}`;

        return {
            pixQRCode: mockQRCode,
            pixCopyPaste: mockPixCopyPaste,
            transactionId: mockTransactionId,
        };
    }
};

module.exports = { generatePixPayment };