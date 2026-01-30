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

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../../dist')));

    app.get('/*', (req, res) => res.sendFile(path.resolve(__dirname, '../../dist', 'index.html')));
} else {
    app.get('/', (req, res) => {
        res.send('API is running...');
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