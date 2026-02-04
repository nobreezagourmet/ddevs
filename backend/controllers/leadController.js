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
        
        // Buscar todos os usuários, ordenados por data de criação (mais recentes primeiro)
        const users = await User.find({})
            .sort({ createdAt: -1 })
            .select('name email phone createdAt isAdmin _id');
        
        console.log(`📊 Encontrados ${users.length} leads cadastrados`);
        
        // Formatar resposta para o frontend
        const formattedLeads = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || 'Não informado',
            createdAt: user.createdAt,
            isAdmin: user.isAdmin || false,
            registrationDate: new Date(user.createdAt).toLocaleDateString('pt-BR'),
            registrationTime: new Date(user.createdAt).toLocaleTimeString('pt-BR')
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
        
        // Usuários cadastrados nos últimos 7 dias
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        
        // Usuários cadastrados nos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        
        console.log('✅ Estatísticas calculadas:', {
            totalUsers,
            adminUsers,
            regularUsers,
            recentUsers,
            monthlyUsers
        });
        
        res.json({
            success: true,
            data: {
                totalUsers,
                adminUsers,
                regularUsers,
                recentUsers,
                monthlyUsers
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

module.exports = {
    getLeads,
    getLeadStats
};
