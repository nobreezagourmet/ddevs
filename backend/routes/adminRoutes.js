const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { swapQuota, createRaffle, deleteRaffle, getRaffles, getRaffle } = require('../controllers/adminController');

// ROTA DE ESTATÍSTICAS - SEM AUTENTICAÇÃO PARA TESTE
router.get('/stats', async (req, res) => {
    console.log('📊 BUSCANDO ESTATÍSTICAS DO ADMIN');
    
    try {
        const Raffle = require('../models/Raffle');
        const User = require('../models/User');
        const Quota = require('../models/Quota');
        
        // Buscar estatísticas
        const totalRaffles = await Raffle.countDocuments();
        const activeRaffles = await Raffle.countDocuments({ isActive: true });
        const totalUsers = await User.countDocuments();
        
        // Calcular total de cotas
        let totalQuotas = 0;
        const raffles = await Raffle.find({});
        raffles.forEach(raffle => {
            totalQuotas += raffle.totalQuotas || 0;
        });
        
        console.log('✅ ESTATÍSTICAS CALCULADAS:', {
            totalQuotas,
            totalUsers,
            activeRaffles,
            totalRaffles
        });
        
        res.json({
            success: true,
            data: {
                totalQuotas,
                totalUsers,
                activeRaffles,
                totalRaffles
            }
        });
        
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR ESTATÍSTICAS:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

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