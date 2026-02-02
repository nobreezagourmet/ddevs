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

// CORS middleware
app.use(cors({
    origin: ['https://ddevs-86w2.onrender.com', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true
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

app.use(express.json());

app.use('/api/auth', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend em produção
if (process.env.NODE_ENV === 'production') {
    // Servir arquivos estáticos da pasta public
    app.use(express.static(path.join(__dirname, 'public')));

    // Rota principal - página de login
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    });

    // Rota de login
    app.get('/login', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    });

    // Rota do painel admin
    app.get('/admin', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
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