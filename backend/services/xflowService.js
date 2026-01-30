const axios = require('axios');

const XFLOW_API_URL = process.env.XFLOW_API_URL || 'https://api.xflowpayments.com/v1'; // === CRÍTICO: SUBSTITUIR PELO REAL ===

const generatePixPayment = async (amount, orderId, description) => {
    try {
        console.log('Preparando para chamar API da XFLOW para gerar PIX...');

        // === CRÍTICO: AJUSTAR CONFORME DOCUMENTAÇÃO DA XFLOW ===
        // Endpoint da XFLOW para gerar PIX (exemplo comum)
        const pixGenerationEndpoint = `${XFLOW_API_URL}/pix/payments`; 

        // Payload da requisição para a XFLOW (exemplo comum)
        const requestPayload = {
            client_id: process.env.XFLOW_CLIENT_ID,
            secret_key: process.env.XFLOW_SECRET_KEY, // Algumas APIs pedem secret no corpo, outras em Authorization
            amount: amount, // Valor total do pagamento
            order_id: orderId, // Seu ID de referência para a ordem
            description: description, // Descrição do pagamento
            // Adicionar outros parâmetros conforme documentação da XFLOW (ex: expiration_time, buyer_info, etc.)
        };

        // Configuração de cabeçalhos (pode variar, algumas APIs usam Bearer Token, outras basic auth, outras no corpo)
        const requestHeaders = {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${process.env.XFLOW_ACCESS_TOKEN}` // Se XFLOW usar Bearer token
            // 'X-Client-ID': process.env.XFLOW_CLIENT_ID // Se XFLOW usar client ID em header
        };

        // === EXECUTAR REQUISIÇÃO REAL ===
        const response = await axios.post(pixGenerationEndpoint, requestPayload, { headers: requestHeaders });
        
        console.log('Resposta da XFLOW (simulada/estrutura real):', response.data);

        // === CRÍTICO: ADAPTAR A RESPOSTA CONFORME O FORMATO REAL DA XFLOW ===
        // Extrair QRCode e Pix Copy/Paste da resposta real da XFLOW
        const xflowResponseData = response.data;
        return {
            pixQRCode: xflowResponseData.qr_code_base64 || `data:image/png;base64,PLACEHOLDER_QR_CODE_FROM_XFLOW_${orderId}`,
            pixCopyPaste: xflowResponseData.pix_copy_paste || `PLACEHOLDER_COPY_PASTE_FROM_XFLOW_${orderId}`,
            transactionId: xflowResponseData.transaction_id || `xflow_txn_${Date.now()}`,
        };

    } catch (error) {
        console.error('Erro ao chamar API da XFLOW para gerar PIX:', error.message);
        // Se houver response.data, logar para debug
        if (error.response && error.response.data) {
            console.error('Detalhes do erro da XFLOW:', error.response.data);
        }
        throw new Error('Falha na integração com XFLOW para gerar PIX.');
    }
};

module.exports = { generatePixPayment };