const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { 
    getRaffles, 
    getRaffleById, 
    createRaffle, 
    toggleRaffleStatus, 
    deleteRaffle, 
    getAllRafflesAdmin 
} = require('../controllers/raffleController');

// Rotas públicas para rifas
router.get('/', getRaffles);
router.get('/:id', getRaffleById);

// Rotas protegidas (admin apenas)
router.post('/', protect, admin, createRaffle);
router.patch('/:id/toggle', protect, admin, toggleRaffleStatus);
router.delete('/:id', protect, admin, deleteRaffle);
router.get('/admin/all', protect, admin, getAllRafflesAdmin);

module.exports = router;
