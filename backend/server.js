const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');

dotenv.config();

connectDB();

const app = express();

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

// Development default route (se não estiver em produção)
if (process.env.NODE_ENV !== 'production') {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}

// Serve frontend em produção (este bloco DEVE ser o último antes do tratamento de erros)
if (process.env.NODE_ENV === 'production') {
    // Define a pasta estática para os arquivos do front-end
    app.use(express.static(path.join(__dirname, '../../dist')));

    // Rota curinga para servir o index.html para todas as outras rotas não tratadas
    // Isso é essencial para aplicações SPA (Single Page Applications) onde o roteamento é feito no cliente.
    app.use('/*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
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