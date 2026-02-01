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
    origin: ['https://ddevs-ds5v.onrender.com', 'http://localhost:3000', 'http://localhost:5173'],
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

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});