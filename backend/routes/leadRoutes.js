const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getLeads, getLeadStats } = require('../controllers/leadController');

// Proteger todas as rotas de leads - apenas admins podem acessar
router.get('/', protect, getLeads);
router.get('/stats', protect, getLeadStats);

module.exports = router;
