const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');
const cors = require('cors');
const { configureUploads } = require('./middleware/uploadMiddleware');

dotenv.config();

connectDB();

const app = express();

// Configurar uploads ANTES de outros middlewares
configureUploads(app);

// MIDDLEWARE NO TOPO ABSOLUTO
app.use(express.json());

app.use(require('cors')({ 
    origin: '*',  // ABERTO PARA TESTE
    credentials: true 
}));

app.use(express.urlencoded({ extended: true }));

// MIDDLEWARE DE LOG CRÍTICO - ACIMA DE TUDO
app.use((req, res, next) => {
    console.log('🚨 REQ RECEBIDA:', req.method, req.url);
    console.log('🌐 ORIGEM:', req.headers.origin);
    console.log('📋 PATH:', req.path);
    console.log('🔗 ORIGINAL URL:', req.originalUrl);
    next();
});

// Middleware de auditoria - log TODAS as requisições
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log('\n🚀 ===== AUDITORIA DE REQUISIÇÃO =====');
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`📍 URL COMPLETA: ${req.originalUrl}`);
    console.log(`🔧 MÉTODO HTTP: ${req.method}`);
    console.log(`🌐 ORIGEM: ${req.headers.origin || 'Direct'}`);
    console.log(`🌍 USER-AGENT: ${req.headers['user-agent'] || 'Unknown'}`);
    console.log(`📋 CONTENT-TYPE: ${req.headers['content-type'] || 'Not specified'}`);
    console.log(`🔑 AUTHORIZATION: ${req.headers.authorization ? 'Present' : 'Missing'}`);
    if (req.method !== 'GET' && req.body) {
        console.log(`💾 CORPO DA REQUISIÇÃO:`, JSON.stringify(req.body, null, 2));
    }
    console.log('=====================================\n');
    next();
});

app.use((req, res, next) => {
    if (req.originalUrl === '/api/payment/webhook') {
        req.rawBody = '';
        req.on('data', chunk => {
            req.rawBody += chunk;
        });
        req.on('end', () => {
            next();
        });
    } else {
        next();
    }
});

app.use('/api/auth', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// SERVIR ARQUIVOS ESTÁTICOS DA RAIZ DO BACKEND
app.use(express.static(__dirname));

// ROTA DE ACESSO AO PAINEL ADMIN - ANTES DE QUALQUER ROTA GENÉRICA
app.get('/admin-painel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ROTA ADMIN-PANEL.HTML
app.get('/admin-panel.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-panel.html'));
});

// ROTA RAIZ - CARREGA O PAINEL ADMIN
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ROTA ADMIN PADRÃO
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ROTA ADMIN.HTML
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ROTA CORINGA - PEGA TUDO O QUE NÃO É API E SERVE O INDEX
app.get('*', (req, res) => {
    // Se for rota de API que não existe, retorna 404 JSON
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ 
            success: false, 
            message: 'API route not found',
            path: req.originalUrl,
            method: req.method
        });
    }
    // Senão, serve o index.html (SPA routing)
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ROTA DE TESTE TEMPORÁRIA
app.get('/api/test', (req, res) => res.json({ msg: 'Backend Online' }));

// Error handling middleware - retorna JSON com retry info
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        url: req.originalUrl,
        method: req.method
    });
    
    // Se for erro de timeout do MongoDB
    if (err.message.includes('buffering timed out') || err.message.includes('server selection timeout')) {
        res.status(503).json({ 
            success: false, 
            message: 'Database connection timeout. Please try again.',
            retry: true,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});