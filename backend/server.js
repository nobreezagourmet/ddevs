const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');
const cors = require('cors');

dotenv.config();

connectDB();

const app = express();

// MIDDLEWARE ESSENCIAIS NO TOPO - ANTES DE TUDO
app.use(require('cors')({ 
    origin: [
        'https://ddevss.vercel.app', // Frontend na Vercel - URL CORRETA
        'https://ddevs-86w2.onrender.com', // Backend (painel admin)
        'http://localhost:3000', 
        'http://localhost:5173'
    ], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use(express.json());

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

// CORS RADICAL - URL VERCEL CORRIGIDA
app.use(require('cors')({ 
    origin: [
        'https://ddevss.vercel.app', // Frontend na Vercel - URL CORRETA
        'https://ddevs-86w2.onrender.com', // Backend (painel admin)
        'http://localhost:3000', 
        'http://localhost:5173'
    ], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));

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

// ROTA DE TESTE TEMPORÁRIA
app.get('/api/test', (req, res) => res.json({ msg: 'Backend Online' }));

// 404 handler FORÇADO para APIs - captura TUDO que não foi encontrado
app.use('/api/*', (req, res) => {
    console.log('❌ 404 API não encontrada:', req.originalUrl);
    res.status(404).json({ 
        success: false, 
        message: 'API route not found',
        path: req.originalUrl,
        method: req.method,
        availableRoutes: [
            'GET /api/test',
            'POST /api/auth/login',
            'POST /api/auth/register',
            'POST /api/admin/create-raffle',
            'POST /api/admin/swap-quota',
            'POST /api/payment/create-order'
        ]
    });
});

// Serve frontend em produção
if (process.env.NODE_ENV === 'production') {
    // Servir arquivos estáticos da pasta public
    app.use(express.static(path.join(__dirname, 'public')));

    // Rota principal - retorna JSON
    app.get('/', (req, res) => {
        res.json({ 
            success: true, 
            message: 'API is running',
            endpoints: ['/api/test', '/api/auth/login', '/api/auth/register']
        });
    });

    // Rota de login
    app.get('/login', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    });

    // Rota do painel admin
    app.get('/admin', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    });

    // 404 handler geral - apenas para rotas não-API e não-estáticas
    app.use((req, res) => {
        res.status(404).json({ 
            success: false, 
            message: 'Route not found',
            path: req.originalUrl,
            method: req.method
        });
    });
}

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