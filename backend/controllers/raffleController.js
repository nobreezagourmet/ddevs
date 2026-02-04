const asyncHandler = require('express-async-handler');
const Raffle = require('../models/Raffle');

// @desc    Get all active raffles
// @route   GET /api/raffles
// @access  Public
const getRaffles = asyncHandler(async (req, res) => {
    try {
        console.log('🎯 Buscando todas as rifas ativas...');
        
        // Buscar rifas ativas, ordenadas por data de criação (mais recentes primeiro)
        const raffles = await Raffle.find({ isActive: true })
            .sort({ createdAt: -1 })
            .select('title description pricePerQuota totalQuotas availableQuotas imageUrl createdAt status');
        
        console.log(`📊 Encontradas ${raffles.length} rifas ativas`);
        
        // Formatar resposta para o frontend
        const formattedRaffles = raffles.map(raffle => ({
            id: raffle._id,
            title: raffle.title,
            description: raffle.description || 'Rifa emocionante com ótimos prêmios!',
            pricePerQuota: raffle.pricePerQuota,
            totalQuotas: raffle.totalQuotas,
            availableQuotas: raffle.availableQuotas || raffle.totalQuotas,
            soldQuotas: raffle.totalQuotas - (raffle.availableQuotas || raffle.totalQuotas),
            imageUrl: raffle.imageUrl || 'https://via.placeholder.com/400x300/10b981/ffffff?text=RIFA',
            createdAt: raffle.createdAt,
            status: raffle.status || 'active',
            progressPercentage: ((raffle.totalQuotas - (raffle.availableQuotas || raffle.totalQuotas)) / raffle.totalQuotas) * 100
        }));
        
        res.json({
            success: true,
            count: formattedRaffles.length,
            data: formattedRaffles
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar rifas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar rifas. Tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Get single raffle by ID
// @route   GET /api/raffles/:id
// @access  Public
const getRaffleById = asyncHandler(async (req, res) => {
    try {
        console.log(`🎯 Buscando rifa ID: ${req.params.id}`);
        
        const raffle = await Raffle.findById(req.params.id);
        
        if (!raffle) {
            return res.status(404).json({
                success: false,
                message: 'Rifa não encontrada'
            });
        }
        
        const formattedRaffle = {
            id: raffle._id,
            title: raffle.title,
            description: raffle.description || 'Rifa emocionante com ótimos prêmios!',
            pricePerQuota: raffle.pricePerQuota,
            totalQuotas: raffle.totalQuotas,
            availableQuotas: raffle.availableQuotas || raffle.totalQuotas,
            soldQuotas: raffle.totalQuotas - (raffle.availableQuotas || raffle.totalQuotas),
            imageUrl: raffle.imageUrl || 'https://via.placeholder.com/400x300/10b981/ffffff?text=RIFA',
            createdAt: raffle.createdAt,
            status: raffle.status || 'active',
            progressPercentage: ((raffle.totalQuotas - (raffle.availableQuotas || raffle.totalQuotas)) / raffle.totalQuotas) * 100
        };
        
        res.json({
            success: true,
            data: formattedRaffle
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar rifa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar rifa. Tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = {
    getRaffles,
    getRaffleById
};
