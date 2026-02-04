const asyncHandler = require('express-async-handler');
const Raffle = require('../models/Raffle');

// @desc    Get all active raffles
// @route   GET /api/raffles
// @access  Public
const getRaffles = asyncHandler(async (req, res) => {
    try {
        console.log('🎯 Buscando todas as rifas ativas...');
        
        // Buscar rifas ativas, ordenadas por data de criação (mais recentes primeiro)
        const raffles = await Raffle.find({ isActive: true, status: 'active' })
            .sort({ sequentialId: -1 })
            .select('creationId sequentialId title description pricePerQuota totalQuotas availableQuotas imageUrl createdAt status totalParticipants totalRevenue');
        
        console.log(`📊 Encontradas ${raffles.length} rifas ativas`);
        
        // Formatar resposta para o frontend com IDs completos
        const formattedRaffles = raffles.map(raffle => ({
            // IDs cruciais para operações
            id: raffle._id,
            creationId: raffle.creationId,
            sequentialId: raffle.sequentialId,
            formattedId: raffle.getFormattedId(),
            completeId: raffle.getCompleteId(),
            
            // Dados da rifa
            title: raffle.title,
            description: raffle.description || 'Rifa emocionante com ótimos prêmios!',
            pricePerQuota: raffle.pricePerQuota,
            totalQuotas: raffle.totalQuotas,
            availableQuotas: raffle.availableQuotas || raffle.totalQuotas,
            soldQuotas: raffle.totalQuotas - (raffle.availableQuotas || raffle.totalQuotas),
            imageUrl: raffle.imageUrl || 'https://via.placeholder.com/400x300/10b981/ffffff?text=RIFA',
            createdAt: raffle.createdAt,
            status: raffle.status || 'active',
            
            // Estatísticas
            totalParticipants: raffle.totalParticipants || 0,
            totalRevenue: raffle.totalRevenue || 0,
            
            // Progresso calculado
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
        
        const raffle = await Raffle.findById(req.params.id)
            .select('creationId sequentialId title description pricePerQuota totalQuotas availableQuotas imageUrl createdAt status totalParticipants totalRevenue');
        
        if (!raffle) {
            return res.status(404).json({
                success: false,
                message: 'Rifa não encontrada'
            });
        }
        
        const formattedRaffle = {
            // IDs cruciais para operações
            id: raffle._id,
            creationId: raffle.creationId,
            sequentialId: raffle.sequentialId,
            formattedId: raffle.getFormattedId(),
            completeId: raffle.getCompleteId(),
            
            // Dados da rifa
            title: raffle.title,
            description: raffle.description || 'Rifa emocionante com ótimos prêmios!',
            pricePerQuota: raffle.pricePerQuota,
            totalQuotas: raffle.totalQuotas,
            availableQuotas: raffle.availableQuotas || raffle.totalQuotas,
            soldQuotas: raffle.totalQuotas - (raffle.availableQuotas || raffle.totalQuotas),
            imageUrl: raffle.imageUrl || 'https://via.placeholder.com/400x300/10b981/ffffff?text=RIFA',
            createdAt: raffle.createdAt,
            status: raffle.status || 'active',
            
            // Estatísticas
            totalParticipants: raffle.totalParticipants || 0,
            totalRevenue: raffle.totalRevenue || 0,
            
            // Progresso calculado
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

// @desc    Create new raffle (Admin only)
// @route   POST /api/raffles
// @access  Private (Admin only)
const createRaffle = asyncHandler(async (req, res) => {
    try {
        console.log('🎯 Criando nova rifa...');
        console.log('📋 Dados recebidos:', req.body);
        
        const {
            title,
            description,
            pricePerQuota,
            totalQuotas,
            imageUrl,
            quickSelectPackages
        } = req.body;
        
        // Validar e limpar dados
        const raffleData = {
            title: title?.trim(),
            description: description?.trim() || 'Rifa emocionante com ótimos prêmios!',
            pricePerQuota: parseFloat(pricePerQuota) || 0,
            totalQuotas: parseInt(totalQuotas) || 1,
            imageUrl: imageUrl?.trim() || null,
            quickSelectPackages: Array.isArray(quickSelectPackages) 
                ? quickSelectPackages.filter(p => !isNaN(p)).map(p => parseInt(p))
                : [10, 50, 100, 500],
            isActive: true,
            status: 'active'
        };
        
        console.log('📋 Dados limpos:', raffleData);
        
        // Remover campos que podem causar problemas
        const cleanData = {
            title: raffleData.title,
            description: raffleData.description,
            pricePerQuota: raffleData.pricePerQuota,
            totalQuotas: raffleData.totalQuotas,
            imageUrl: raffleData.imageUrl,
            quickSelectPackages: raffleData.quickSelectPackages,
            isActive: raffleData.isActive,
            status: raffleData.status
        };
        
        console.log('📋 Dados finais:', cleanData);
        
        const raffle = await Raffle.create(cleanData);
        
        console.log(`✅ Rifa criada com sucesso: ${raffle.getCompleteId()}`);
        console.log('📊 Dados da rifa criada:', {
            id: raffle._id,
            creationId: raffle.creationId,
            sequentialId: raffle.sequentialId,
            formattedId: raffle.getFormattedId(),
            title: raffle.title
        });
        
        res.status(201).json({
            success: true,
            message: 'Rifa criada com sucesso',
            data: {
                id: raffle._id,
                creationId: raffle.creationId,
                sequentialId: raffle.sequentialId,
                formattedId: raffle.getFormattedId(),
                completeId: raffle.getCompleteId(),
                title: raffle.title,
                pricePerQuota: raffle.pricePerQuota,
                totalQuotas: raffle.totalQuotas,
                status: raffle.status,
                isActive: raffle.isActive
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao criar rifa:', error);
        console.error('❌ Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar rifa. Tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = {
    getRaffles,
    getRaffleById,
    createRaffle
};
