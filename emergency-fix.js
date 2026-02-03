// 🚨 EMERGÊNCIA - FORÇAR URL DIRETA NO CONSOLE
// COLE ISSO NO CONSOLE F12 E APERTE ENTER

const FORCED_API_URL = 'https://ddevs-86w2.onrender.com/api';

// Sobrescrever todas as chamadas fetch
const originalFetch = window.fetch;
window.fetch = function(url, options) {
    if (url.startsWith('/api/')) {
        console.log('🚨 FORÇANDO URL:', FORCED_API_URL + url.substring(4));
        return originalFetch(FORCED_API_URL + url.substring(4), options);
    }
    return originalFetch(url, options);
};

console.log('🚨 EMERGÊNCIA ATIVADA - URL FORÇADA:', FORCED_API_URL);
