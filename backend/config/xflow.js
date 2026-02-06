// 🚀 CONFIGURAÇÃO WEBHOOK XFLOW - CHAVES DE API
// 🔑 API Key (Client ID): e1c98954cc404cbcb2868af9b40c7a33
// 🔑 Secret Key (Company): 7RomIIydlFl1ZqAqtb5UKgUGyqm-cQqoS9Rrf6Zb9UazSU-gTmdLD0w_DFWXUocU0L_ZwWic2QNMtmxVNb_nWg

console.log('🎯 XFLOW API CONFIGURADO');
console.log('🔑 Client ID:', 'e1c98954cc404cbcb2868af9b40c7a33');
console.log('🔑 Secret Key:', '7RomIIydlFl1ZqAqtb5UKgUGyqm-cQqoS9Rrf6Zb9UazSU-gTmdLD0w_DFWXUocU0L_ZwWic2QNMtmxVNb_nWg');

module.exports = {
    XFLOW_CLIENT_ID: 'e1c98954cc404cbcb2868af9b40c7a33',
    XFLOW_SECRET_KEY: '7RomIIydlFl1ZqAqtb5UKgUGyqm-cQqoS9Rrf6Zb9UazSU-gTmdLD0w_DFWXUocU0L_ZwWic2QNMtmxVNb_nWg',
    XFLOW_WEBHOOK_URL: 'https://ddevs-86w2.onrender.com/api/payment/webhook',
    XFLOW_WEBHOOK_SECRET: 'xflo_webhook_secret_key_aqui', // Configure esta chave no .env
    XFLOW_API_URL: 'https://api.xflow.com/v1' // URL corrigida
};
