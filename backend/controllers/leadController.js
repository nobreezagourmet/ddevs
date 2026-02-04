const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all leads (users) - Admin only
// @route   GET /api/leads
// @access  Private (Admin only)
const getLeads = asyncHandler(async (req, res) => {
    try {
        console.log('👥 Buscando todos os leads (usuários cadastrados)...');
        
        // Verificar se é admin
        if (!req.user.isAdmin) {
            console.log('❌ Acesso negado: usuário não é admin');
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores podem visualizar leads.'
            });
        }
        
        // Buscar todos os usuários com populate das rifas
        const users = await User.find({})
            .sort({ sequentialId: -1 })
            .populate('firstRaffleAccessed', 'title creationId sequentialId')
            .populate('participatedRaffles.raffleId', 'title creationId sequentialId')
            .select('leadId sequentialId name email phone createdAt isAdmin status totalQuotasPurchased totalSpent lastActivityAt firstRaffleAccessed participatedRaffles');
        
        console.log(`📊 Encontrados ${users.length} leads cadastrados`);
        
        // Formatar resposta para o frontend com IDs completos
        const formattedLeads = users.map(user => ({
            // IDs cruciais para operações de troca
            id: user._id,
            leadId: user.leadId,
            sequentialId: user.sequentialId,
            formattedLeadId: user.getFormattedLeadId(),
            completeLeadId: user.getCompleteLeadId(),
            
            // Dados do lead
            name: user.name,
            email: user.email,
            phone: user.phone || 'Não informado',
            createdAt: user.createdAt,
            isAdmin: user.isAdmin || false,
            status: user.status || 'active',
            
            // Estatísticas do lead
            totalQuotasPurchased: user.totalQuotasPurchased || 0,
            totalSpent: user.totalSpent || 0,
            lastActivityAt: user.lastActivityAt,
            
            // Relacionamento com rifas
            firstRaffleAccessed: user.firstRaffleAccessed ? {
                id: user.firstRaffleAccessed._id,
                creationId: user.firstRaffleAccessed.creationId,
                sequentialId: user.firstRaffleAccessed.sequentialId,
                formattedId: `RFL-${user.firstRaffleAccessed.sequentialId.toString().padStart(6, '0')}`,
                title: user.firstRaffleAccessed.title
            } : null,
            
            // Rifas que participou
            participatedRaffles: user.participatedRaffles.map(participation => ({
                raffleId: participation.raffleId._id,
                creationId: participation.raffleId.creationId,
                sequentialId: participation.raffleId.sequentialId,
                formattedId: `RFL-${participation.raffleId.sequentialId.toString().padStart(6, '0')}`,
                title: participation.raffleId.title,
                quotasPurchased: participation.quotasPurchased,
                totalSpent: participation.totalSpent,
                participatedAt: participation.participatedAt
            })),
            
            // Formatação para exibição
            registrationDate: new Date(user.createdAt).toLocaleDateString('pt-BR'),
            registrationTime: new Date(user.createdAt).toLocaleTimeString('pt-BR'),
            lastActivityDate: user.lastActivityAt ? new Date(user.lastActivityAt).toLocaleDateString('pt-BR') : 'Nunca',
            lastActivityTime: user.lastActivityAt ? new Date(user.lastActivityAt).toLocaleTimeString('pt-BR') : ''
        }));
        
        res.json({
            success: true,
            count: formattedLeads.length,
            data: formattedLeads
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar leads:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar leads. Tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Get lead statistics - Admin only
// @route   GET /api/leads/stats
// @access  Private (Admin only)
const getLeadStats = asyncHandler(async (req, res) => {
    try {
        console.log('📊 Buscando estatísticas dos leads...');
        
        // Verificar se é admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores podem visualizar estatísticas.'
            });
        }
        
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ isAdmin: true });
        const regularUsers = totalUsers - adminUsers;
        const activeUsers = await User.countDocuments({ status: 'active' });
        
        // Usuários cadastrados nos últimos 7 dias
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        
        // Usuários cadastrados nos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        
        // Usuários que compraram cotas
        const usersWithQuotas = await User.countDocuments({ totalQuotasPurchased: { $gt: 0 } });
        
        // Total de cotas compradas e valor total
        const statsAggregation = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalQuotas: { $sum: '$totalQuotasPurchased' },
                    totalRevenue: { $sum: '$totalSpent' },
                    avgQuotasPerUser: { $avg: '$totalQuotasPurchased' },
                    avgSpentPerUser: { $avg: '$totalSpent' }
                }
            }
        ]);
        
        const aggregatedStats = statsAggregation[0] || {
            totalQuotas: 0,
            totalRevenue: 0,
            avgQuotasPerUser: 0,
            avgSpentPerUser: 0
        };
        
        console.log('✅ Estatísticas calculadas:', {
            totalUsers,
            adminUsers,
            regularUsers,
            activeUsers,
            recentUsers,
            monthlyUsers,
            usersWithQuotas,
            ...aggregatedStats
        });
        
        res.json({
            success: true,
            data: {
                totalUsers,
                adminUsers,
                regularUsers,
                activeUsers,
                recentUsers,
                monthlyUsers,
                usersWithQuotas,
                ...aggregatedStats
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas dos leads:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas. Tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Get lead by ID - Admin only
// @route   GET /api/leads/:id
// @access  Private (Admin only)
const getLeadById = asyncHandler(async (req, res) => {
    try {
        console.log(`👥 Buscando lead ID: ${req.params.id}`);
        
        // Verificar se é admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores podem visualizar leads.'
            });
        }
        
        const user = await User.findById(req.params.id)
            .populate('firstRaffleAccessed', 'title creationId sequentialId')
            .populate('participatedRaffles.raffleId', 'title creationId sequentialId')
            .select('leadId sequentialId name email phone createdAt isAdmin status totalQuotasPurchased totalSpent lastActivityAt firstRaffleAccessed participatedRaffles');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Lead não encontrado'
            });
        }
        
        const formattedLead = {
            // IDs cruciais para operações de troca
            id: user._id,
            leadId: user.leadId,
            sequentialId: user.sequentialId,
            formattedLeadId: user.getFormattedLeadId(),
            completeLeadId: user.getCompleteLeadId(),
            
            // Dados do lead
            name: user.name,
            email: user.email,
            phone: user.phone || 'Não informado',
            createdAt: user.createdAt,
            isAdmin: user.isAdmin || false,
            status: user.status || 'active',
            
            // Estatísticas do lead
            totalQuotasPurchased: user.totalQuotasPurchased || 0,
            totalSpent: user.totalSpent || 0,
            lastActivityAt: user.lastActivityAt,
            
            // Relacionamento com rifas
            firstRaffleAccessed: user.firstRaffleAccessed ? {
                id: user.firstRaffleAccessed._id,
                creationId: user.firstRaffleAccessed.creationId,
                sequentialId: user.firstRaffleAccessed.sequentialId,
                formattedId: `RFL-${user.firstRaffleAccessed.sequentialId.toString().padStart(6, '0')}`,
                title: user.firstRaffleAccessed.title
            } : null,
            
            // Rifas que participou
            participatedRaffles: user.participatedRaffles.map(participation => ({
                raffleId: participation.raffleId._id,
                creationId: participation.raffleId.creationId,
                sequentialId: participation.raffleId.sequentialId,
                formattedId: `RFL-${participation.raffleId.sequentialId.toString().padStart(6, '0')}`,
                title: participation.raffleId.title,
                quotasPurchased: participation.quotasPurchased,
                totalSpent: participation.totalSpent,
                participatedAt: participation.participatedAt
            })),
            
            // Formatação para exibição
            registrationDate: new Date(user.createdAt).toLocaleDateString('pt-BR'),
            registrationTime: new Date(user.createdAt).toLocaleTimeString('pt-BR'),
            lastActivityDate: user.lastActivityAt ? new Date(user.lastActivityAt).toLocaleDateString('pt-BR') : 'Nunca',
            lastActivityTime: user.lastActivityAt ? new Date(user.lastActivityAt).toLocaleTimeString('pt-BR') : ''
        };
        
        res.json({
            success: true,
            data: formattedLead
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar lead:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar lead. Tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = {
    getLeads,
    getLeadStats,
    getLeadById
};
