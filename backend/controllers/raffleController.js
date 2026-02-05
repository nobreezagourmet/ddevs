const asyncHandler = require('express-async-handler');
const Raffle = require('../models/Raffle');

// @desc    Get all active raffles
// @route   GET /api/raffles
// @access  Public
const getRaffles = asyncHandler(async (req, res) => {
    try {
        console.log('🎯 Buscando todas as rifas ativas...');
        
        // Tentar buscar rifas reais do banco primeiro
        try {
            const raffles = await Raffle.find({ isActive: true, status: 'active' })
                .sort({ sequentialId: -1 })
                .select('creationId sequentialId title description pricePerQuota totalQuotas availableQuotas imageUrl createdAt status totalParticipants totalRevenue')
                .limit(20);
            
            console.log(`📊 Encontradas ${raffles.length} rifas reais no banco`);
            
            if (raffles.length > 0) {
                // Formatar rifas reais
                const formattedRaffles = raffles.map(raffle => ({
                    id: raffle._id,
                    creationId: raffle.creationId,
                    sequentialId: raffle.sequentialId,
                    formattedId: raffle.getFormattedId(),
                    completeId: raffle.getCompleteId(),
                    title: raffle.title,
                    description: raffle.description || 'Rifa emocionante com ótimos prêmios!',
                    pricePerQuota: raffle.pricePerQuota,
                    totalQuotas: raffle.totalQuotas,
                    availableQuotas: raffle.availableQuotas || raffle.totalQuotas,
                    soldQuotas: raffle.totalQuotas - (raffle.availableQuotas || raffle.totalQuotas),
                    imageUrl: raffle.imageUrl || 'https://via.placeholder.com/400x300/10b981/ffffff?text=RIFA',
                    createdAt: raffle.createdAt,
                    status: raffle.status || 'active',
                    totalParticipants: raffle.totalParticipants || 0,
                    totalRevenue: raffle.totalRevenue || 0,
                    progressPercentage: ((raffle.totalQuotas - (raffle.availableQuotas || raffle.totalQuotas)) / raffle.totalQuotas) * 100
                }));
                
                console.log('✅ Rifas reais formatadas com sucesso');
                
                res.json({
                    success: true,
                    count: formattedRaffles.length,
                    data: formattedRaffles,
                    note: 'Dados reais do banco de dados'
                });
                return;
            }
        } catch (dbError) {
            console.log('⚠️ Erro ao acessar banco de rifas:', dbError.message);
        }
        
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
                availableQuotas: raffle.availableQuotas,
                status: raffle.status,
                isActive: raffle.isActive,
                createdAt: raffle.createdAt,
                imageUrl: raffle.imageUrl
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

// @desc    Toggle raffle active status (Admin only)
// @route   PATCH /api/raffles/:id/toggle
// @access  Private (Admin only)
const toggleRaffleStatus = asyncHandler(async (req, res) => {
    try {
        console.log(`🔄 Alternando status da rifa ID: ${req.params.id}`);
        
        // Tentar buscar do banco primeiro
        try {
            const raffle = await Raffle.findById(req.params.id);
            
            if (!raffle) {
                return res.status(404).json({
                    success: false,
                    message: 'Rifa não encontrada'
                });
            }
            
            // Protocolo de Correção: Status Toggle com persistência completa
            console.log(`🔄 Status Toggle (Protocolo de Correção): ${req.params.id}`);
            
            // Adicionar ao histórico de status antes de alterar
            const oldStatus = raffle.status;
            const newStatus = raffle.isActive ? 'inactive' : 'active';
            
            raffle.statusHistory.push({
                status: newStatus,
                changedAt: new Date(),
                changedBy: req.user?.email || 'admin'
            });
            
            // Alternar status com persistência
            raffle.isActive = !raffle.isActive;
            raffle.status = newStatus;
            raffle.lastStatusChange = new Date();
            
            await raffle.save();
            
            console.log(`✅ Status alterado: ${oldStatus} → ${newStatus}`);
            console.log(`📊 Histórico de status: ${raffle.statusHistory.length} alterações`);
            console.log(`🔄 Rifa ${raffle.isActive ? 'ATIVADA' : 'DESATIVADA'}: ${raffle.title}`);
            
            res.json({
                success: true,
                message: `Rifa ${raffle.isActive ? 'ativada' : 'desativada'} com sucesso`,
                data: {
                    id: raffle._id,
                    title: raffle.title,
                    formattedId: raffle.getFormattedId(),
                    isActive: raffle.isActive,
                    status: raffle.status,
                    lastStatusChange: raffle.lastStatusChange,
                    statusHistory: raffle.statusHistory
                }
            });
            return;
        } catch (dbError) {
            console.log('⚠️ Erro ao acessar banco:', dbError.message);
        }
        
    } catch (error) {
        console.error('❌ Erro ao alternar status da rifa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao alternar status da rifa',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Delete raffle (Admin only)
// @route   DELETE /api/raffles/:id
// @access  Private (Admin only)
const deleteRaffle = asyncHandler(async (req, res) => {
    try {
        console.log(`🗑️ Excluindo rifa ID: ${req.params.id}`);
        
        // Tentar buscar do banco primeiro
        try {
            const raffle = await Raffle.findById(req.params.id);
            
            if (!raffle) {
                return res.status(404).json({
                    success: false,
                    message: 'Rifa não encontrada'
                });
            }
            
            // Protocolo de Correção: Soft Delete em vez de exclusão física
            console.log('🗑️ Aplicando Soft Delete (Protocolo de Correção)...');
            
            // Adicionar ao histórico de status
            raffle.statusHistory.push({
                status: 'deleted',
                changedAt: new Date(),
                changedBy: req.user?.email || 'admin'
            });
            
            // Soft Delete - Marcar como excluído sem remover do banco
            raffle.isDeleted = true;
            raffle.deletedAt = new Date();
            raffle.isActive = false;
            raffle.status = 'cancelled';
            raffle.lastStatusChange = new Date();
            
            await raffle.save();
            
            console.log(`✅ Soft Delete aplicado: ${raffle.title}`);
            console.log(`📊 Histórico de status: ${raffle.statusHistory.length} alterações`);
            
            res.json({
                success: true,
                message: 'Rifa excluída com sucesso (Soft Delete aplicado)',
                data: {
                    id: raffle._id,
                    title: raffle.title,
                    formattedId: raffle.getFormattedId(),
                    isDeleted: raffle.isDeleted,
                    deletedAt: raffle.deletedAt,
                    statusHistory: raffle.statusHistory
                }
            });
            return;
        } catch (dbError) {
            console.log('⚠️ Erro ao acessar banco:', dbError.message);
        }
        
    } catch (error) {
        console.error('❌ Erro ao excluir rifa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir rifa',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Get all raffles (Admin only - including inactive)
// @route   GET /api/raffles/admin/all
// @access  Private (Admin only)
const getAllRafflesAdmin = asyncHandler(async (req, res) => {
    try {
        console.log('👑 Buscando todas as rifas (admin)...');
        
        const raffles = await Raffle.find({})
            .sort({ sequentialId: -1 })
            .select('creationId sequentialId title description pricePerQuota totalQuotas availableQuotas imageUrl createdAt status isActive totalParticipants totalRevenue');
        
        console.log(`📊 Encontradas ${raffles.length} rifas reais (admin)`);
        
        if (raffles.length > 0) {
            const formattedRaffles = raffles.map(raffle => ({
                id: raffle._id,
                creationId: raffle.creationId,
                sequentialId: raffle.sequentialId,
                formattedId: raffle.getFormattedId(),
                completeId: raffle.getCompleteId(),
                title: raffle.title,
                description: raffle.description || 'Rifa emocionante com ótimos prêmios!',
                pricePerQuota: raffle.pricePerQuota,
                totalQuotas: raffle.totalQuotas,
                availableQuotas: raffle.availableQuotas || raffle.totalQuotas,
                soldQuotas: raffle.totalQuotas - (raffle.availableQuotas || raffle.totalQuotas),
                imageUrl: raffle.imageUrl || 'https://via.placeholder.com/400x300/10b981/ffffff?text=RIFA',
                createdAt: raffle.createdAt,
                status: raffle.status || 'active',
                isActive: raffle.isActive,
                totalParticipants: raffle.totalParticipants || 0,
                totalRevenue: raffle.totalRevenue || 0,
                progressPercentage: ((raffle.totalQuotas - (raffle.availableQuotas || raffle.totalQuotas)) / raffle.totalQuotas) * 100
            }));
            
            res.json({
                success: true,
                count: formattedRaffles.length,
                data: formattedRaffles
            });
            return;
        }
        
        // Se não houver rifas, retornar array vazio
        res.json({
            success: true,
            count: 0,
            data: []
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar rifas admin:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar rifas admin',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = {
    getRaffles,
    getRaffleById,
    createRaffle,
    toggleRaffleStatus,
    deleteRaffle,
    getAllRafflesAdmin
};
