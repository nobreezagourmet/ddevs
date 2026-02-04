const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getRaffles, getRaffleById, createRaffle } = require('../controllers/raffleController');

// Rotas públicas para rifas
router.get('/', getRaffles);
router.get('/:id', getRaffleById);

// Rotas protegidas (admin apenas)
router.post('/', protect, admin, createRaffle);

module.exports = router;
