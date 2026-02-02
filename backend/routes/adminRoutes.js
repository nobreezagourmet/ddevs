const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { swapQuota, createRaffle, deleteRaffle, getRaffles, getRaffle } = require('../controllers/adminController');

// Rotas com upload de imagem
router.post('/create-raffle', protect, admin, upload.single('image'), createRaffle);

// Rotas de listagem
router.get('/raffles', protect, admin, getRaffles);
router.get('/raffle/:id', protect, admin, getRaffle);

// Rotas de deleção
router.delete('/raffle/:id', protect, admin, deleteRaffle);

// Rotas existentes
router.post('/swap-quota', protect, admin, swapQuota);

module.exports = router;