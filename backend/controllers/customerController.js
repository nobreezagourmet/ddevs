const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all customers (simplified view)
// @route   GET /api/customers
// @access  Private (Admin only)
const getAllCustomers = asyncHandler(async (req, res) => {
    try {
        console.log('👥 Buscando todos os clientes...');
        
        // Verificar se é admin
        if (!req.user.isAdmin) {
            console.log('❌ Acesso negado: usuário não é admin');
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores podem visualizar clientes.'
            });
        }
        
        // Buscar todos os usuários com dados essenciais
        const users = await User.find({})
            .sort({ sequentialId: -1 })
            .select('leadId sequentialId name email phone createdAt isAdmin status')
            .lean(); // lean() para melhor performance
        
        console.log(`📊 Encontrados ${users.length} clientes cadastrados`);
        
        // Formatar resposta simplificada
        const formattedCustomers = users.map(user => ({
            // IDs cruciais
            leadId: user.leadId,
            sequentialId: user.sequentialId,
            formattedLeadId: `LED-${user.sequentialId.toString().padStart(6, '0')}`,
            
            // Dados do cliente
            name: user.name,
            email: user.email,
            phone: user.phone || 'Não informado',
            
            // Dados de cadastro
            createdAt: user.createdAt,
            registrationDate: new Date(user.createdAt).toLocaleDateString('pt-BR'),
            registrationTime: new Date(user.createdAt).toLocaleTimeString('pt-BR'),
            
            // Status
            isAdmin: user.isAdmin || false,
            status: user.status || 'active'
        }));
        
        res.json({
            success: true,
            count: formattedCustomers.length,
            data: formattedCustomers
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar clientes:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar clientes. Tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private (Admin only)
const getCustomerStats = asyncHandler(async (req, res) => {
    try {
        console.log('📊 Buscando estatísticas dos clientes...');
        
        // Verificar se é admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores podem visualizar estatísticas.'
            });
        }
        
        const totalCustomers = await User.countDocuments();
        const adminCustomers = await User.countDocuments({ isAdmin: true });
        const regularCustomers = totalCustomers - adminCustomers;
        const activeCustomers = await User.countDocuments({ status: 'active' });
        
        // Clientes cadastrados nos últimos 7 dias
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCustomers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        
        // Clientes cadastrados nos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyCustomers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        
        console.log('✅ Estatísticas calculadas:', {
            totalCustomers,
            adminCustomers,
            regularCustomers,
            activeCustomers,
            recentCustomers,
            monthlyCustomers
        });
        
        res.json({
            success: true,
            data: {
                totalCustomers,
                adminCustomers,
                regularCustomers,
                activeCustomers,
                recentCustomers,
                monthlyCustomers
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas. Tente novamente mais tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = {
    getAllCustomers,
    getCustomerStats
};
