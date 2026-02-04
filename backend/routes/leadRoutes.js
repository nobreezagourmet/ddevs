const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getLeads, getLeadStats, getLeadById } = require('../controllers/leadController');

// Proteger todas as rotas de leads - apenas admins podem acessar
router.get('/', protect, getLeads);
router.get('/stats', protect, getLeadStats);
router.get('/:id', protect, getLeadById);

module.exports = router;
