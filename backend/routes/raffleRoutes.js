const express = require('express');
const router = express.Router();
const { getRaffles, getRaffleById } = require('../controllers/raffleController');

// Rotas públicas para rifas
router.get('/', getRaffles);
router.get('/:id', getRaffleById);

module.exports = router;
