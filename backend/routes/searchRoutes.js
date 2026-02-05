const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { searchCustomers, searchTicketsByRaffle } = require('../controllers/searchController');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);
router.use(admin);

// @route   GET /api/search/customers
// @desc    Busca avançada de clientes
// @access  Private (Admin only)
router.get('/customers', searchCustomers);

// @route   GET /api/search/tickets/:raffleId
// @desc    Busca de tickets por rifa
// @access  Private (Admin only)
router.get('/tickets/:raffleId', searchTicketsByRaffle);

module.exports = router;
