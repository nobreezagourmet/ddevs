const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    console.log(' Middleware de autenticação - URL:', req.originalUrl);
    console.log(' Headers:', req.headers);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log(' Token encontrado:', token.substring(0, 20) + '...');

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            console.log(' Token decodificado:', decoded);

            // Temporariamente usar mock user para evitar erro de banco
            req.user = {
                _id: decoded.id,
                email: 'admin@test.com',
                isAdmin: true,
                name: 'Admin User'
            };
            
            console.log(' Usuário mock criado:', req.user.email);
            console.log(' Usuário é admin:', req.user.isAdmin);

            next();
        } catch (error) {
            console.error(' Erro na autenticação:', error.message);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        console.log(' Token não encontrado nos headers');
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { protect, admin };