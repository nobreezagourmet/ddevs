const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');
const cors = require('cors');
const { configureUploads } = require('./middleware/uploadMiddleware');

// Carregar variáveis de ambiente primeiro
dotenv.config();

// Verificar variáveis de ambiente críticas
if (!process.env.MONGO_URI) {
    console.error('❌ FATAL: MONGO_URI não está definido nas variáveis de ambiente');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('❌ FATAL: JWT_SECRET não está definido nas variáveis de ambiente');
    process.exit(1);
}

// Tentar conectar ao banco com tratamento de erro
let dbConnected = false;
try {
    connectDB();
    dbConnected = true;
    console.log('✅ Banco de dados conectado com sucesso');
} catch (error) {
    console.error('❌ FATAL: Erro ao conectar ao banco de dados:', error.message);
    process.exit(1);
}

const app = express();

// Tentar configurar uploads com tratamento de erro
try {
    configureUploads(app);
    console.log('✅ Sistema de upload configurado com sucesso');
} catch (error) {
    console.error('❌ FATAL: Erro ao configurar sistema de upload:', error.message);
    process.exit(1);
}

// MIDDLEWARE NO TOPO ABSOLUTO - COM LIMITES AUMENTADOS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MIDDLEWARE CORS OTIMIZADO
app.use(cors({ 
    origin: ['*', 'http://localhost:3000', 'https://ddevs-86w2.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// MIDDLEWARE PREFLIGHT
app.options('*', cors());

// MIDDLEWARE DE LOG MELHORADO
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log('\n� ===== REQUISIÇÃO RECEBIDA =====');
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`🔧 Método: ${req.method}`);
    console.log(`📍 URL: ${req.originalUrl}`);
    console.log(`🌐 Origem: ${req.headers.origin || 'Direct'}`);
    console.log(`� Authorization: ${req.headers.authorization ? 'Present' : 'Missing'}`);
    console.log(`� Content-Type: ${req.headers['content-type'] || 'Not specified'}`);
    console.log('=====================================\n');
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

// ROTA RAIZ - CARREGA O PAINEL ADMIN UNIFICADO
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-unificado.html'));
});

// ROTA ADMIN PADRÃO
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-unificado.html'));
});

// ROTA ADMIN.HTML
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-unificado.html'));
});

// ROTA ADMIN-PANEL.HTML (REDIRECIONAR)
app.get('/admin-panel.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-unificado.html'));
});

// ROTA ADMIN-PAINEL (REDIRECIONAR)
app.get('/admin-painel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-unificado.html'));
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

// ROTA DE TESTE - VALIDAR CONEXÃO
app.get('/api/test', (req, res) => {
    console.log('🧪 TESTE - Conexão validada');
    res.json({ 
        success: true
    });
});

// ROTA DE ESTATÍSTICAS DO ADMIN
app.get('/api/admin/stats', async (req, res) => {
    console.log('📊 BUSCANDO ESTATÍSTICAS DO ADMIN');
    
    try {
        const Raffle = require('./models/Raffle');
        const User = require('./models/User');
        const Quota = require('./models/Quota');
        
        // Buscar estatísticas
        const totalRaffles = await Raffle.countDocuments();
        const activeRaffles = await Raffle.countDocuments({ isActive: true });
        const totalUsers = await User.countDocuments();
        
        // Calcular total de cotas
        let totalQuotas = 0;
        const raffles = await Raffle.find({});
        raffles.forEach(raffle => {
            totalQuotas += raffle.totalQuotas || 0;
        });
        
        console.log('✅ ESTATÍSTICAS CALCULADAS:', {
            totalQuotas,
            totalUsers,
            activeRaffles,
            totalRaffles
        });
        
        res.json({
            success: true,
            data: {
                totalQuotas,
                totalUsers,
                activeRaffles,
                totalRaffles
            }
        });
        
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR ESTATÍSTICAS:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Error handling middleware - retorna JSON com detalhes completos
app.use((err, req, res, next) => {
    console.error('💥 ERRO DETALHADO:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params
    });
    
    // Erro de validação do Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Erro de validação: ' + Object.values(err.errors).map(e => e.message).join(', '),
            error: process.env.NODE_ENV === 'development' ? err.errors : undefined
        });
    }
    
    // Erro de duplicação do Mongoose
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Registro duplicado: ' + Object.keys(err.keyValue).join(', ') + ' já existe',
            error: process.env.NODE_ENV === 'development' ? err.keyValue : undefined
        });
    }
    
    // Erro de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    
    // Erro de JWT expirado
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expirado',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    
    // Se for erro de timeout do MongoDB
    if (err.message.includes('buffering timed out') || err.message.includes('server selection timeout')) {
        return res.status(503).json({ 
            success: false, 
            message: 'Database connection timeout. Please try again.',
            retry: true,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    
    // Erro de upload de arquivo
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'Arquivo muito grande. Tamanho máximo permitido: 5MB',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    
    // Erro genérico
    res.status(err.status || 500).json({ 
        success: false, 
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? {
            message: err.message,
            stack: err.stack,
            name: err.name
        } : undefined
    });
});

const PORT = process.env.PORT || 5000;

// Tratamento de erros globais
process.on('uncaughtException', (error) => {
    console.error('❌ UNCAUGHT EXCEPTION:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Database connected: ${dbConnected}`);
});

// Graceful shutdown
server.on('close', () => {
    console.log('🔄 Server closed');
});

module.exports = server;