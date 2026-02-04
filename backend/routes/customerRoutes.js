const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAllCustomers, getCustomerStats } = require('../controllers/customerController');

// Proteger todas as rotas de clientes - apenas admins podem acessar
router.get('/', protect, getAllCustomers);
router.get('/stats', protect, getCustomerStats);

module.exports = router;
