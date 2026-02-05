const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Raffle = require('../models/Raffle');

// @desc    Busca avançada de clientes por nome, email, telefone ou número da rifa
// @route   GET /api/search/customers
// @access  Private (Admin only)
const searchCustomers = asyncHandler(async (req, res) => {
    try {
        console.log('🔍 Busca avançada de clientes (Protocolo de Correção)...');
        
        const { query, ticketNumber, raffleId, page = 1, limit = 20 } = req.query;
        
        if (!query && !ticketNumber) {
            return res.status(400).json({
                success: false,
                message: 'Parâmetro de busca (query ou ticketNumber) é obrigatório'
            });
        }
        
        let results = [];
        let totalResults = 0;
        
        // Busca por número do ticket (consulta cruzada)
        if (ticketNumber) {
            console.log(`🎫 Buscando por ticket número: ${ticketNumber}`);
            
            const ticket = await Ticket.findByNumber(parseInt(ticketNumber));
            
            if (ticket) {
                console.log(`✅ Ticket encontrado: ${ticket.ticketNumber}`);
                
                // Buscar informações completas do usuário
                const user = await User.findById(ticket.userId).select('-password');
                
                if (user) {
                    results.push({
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        formattedLeadId: user.formattedLeadId || `USR-${user._id.toString().slice(-6).toUpperCase()}`,
                        registrationDate: user.createdAt?.toLocaleDateString('pt-BR'),
                        registrationTime: user.createdAt?.toLocaleTimeString('pt-BR'),
                        isAdmin: user.isAdmin || false,
                        status: user.status || 'active',
                        totalQuotasPurchased: await Ticket.countDocuments({ userId: user._id, status: 'sold' }),
                        totalSpent: await Ticket.aggregate([
                            { $match: { userId: user._id, status: 'sold' } },
                            { $group: { _id: null, total: { $sum: '$purchaseInfo.purchaseAmount' } } }
                        ]).then(result => result[0]?.total || 0),
                        lastActivityAt: user.updatedAt,
                        // Informações do ticket encontrado
                        foundTicket: {
                            ticketNumber: ticket.ticketNumber,
                            raffle: ticket.raffleId,
                            status: ticket.status,
                            purchaseInfo: ticket.purchaseInfo
                        },
                        // Todas as rifas que participou
                        participatedRaffles: await Ticket.find({ 
                            userId: user._id, 
                            status: 'sold',
                            isDeleted: false 
                        })
                        .populate('raffleId', 'title formattedId')
                        .then(tickets => tickets.map(t => ({
                            raffleId: t.raffleId._id,
                            creationId: t.raffleId.creationId,
                            sequentialId: t.raffleId.sequentialId,
                            formattedId: t.raffleId.formattedId,
                            title: t.raffleId.title,
                            quotasPurchased: 1,
                            totalSpent: t.purchaseInfo.purchaseAmount || 0,
                            participatedAt: t.createdAt
                        })))
                    });
                    
                    totalResults = 1;
                }
            }
        }
        
        // Busca por nome, email ou telefone
        if (query) {
            console.log(`👤 Buscando por: ${query}`);
            
            const searchRegex = new RegExp(query, 'i');
            
            const users = await User.find({
                $and: [
                    { isDeleted: { $ne: true } },
                    { $or: [
                        { name: searchRegex },
                        { email: searchRegex },
                        { phone: searchRegex }
                    ]}
                ]
            })
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });
            
            // Para cada usuário, buscar informações de rifas
            for (const user of users) {
                const tickets = await Ticket.find({ 
                    userId: user._id, 
                    status: 'sold',
                    isDeleted: false 
                })
                .populate('raffleId', 'title formattedId');
                
                const totalSpent = await Ticket.aggregate([
                    { $match: { userId: user._id, status: 'sold' } },
                    { $group: { _id: null, total: { $sum: '$purchaseInfo.purchaseAmount' } } }
                ]).then(result => result[0]?.total || 0);
                
                results.push({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    formattedLeadId: user.formattedLeadId || `USR-${user._id.toString().slice(-6).toUpperCase()}`,
                    registrationDate: user.createdAt?.toLocaleDateString('pt-BR'),
                    registrationTime: user.createdAt?.toLocaleTimeString('pt-BR'),
                    isAdmin: user.isAdmin || false,
                    status: user.status || 'active',
                    totalQuotasPurchased: tickets.length,
                    totalSpent: totalSpent,
                    lastActivityAt: user.updatedAt,
                    // Rifas que participou
                    participatedRaffles: tickets.map(t => ({
                        raffleId: t.raffleId._id,
                        creationId: t.raffleId.creationId,
                        sequentialId: t.raffleId.sequentialId,
                        formattedId: t.raffleId.formattedId,
                        title: t.raffleId.title,
                        quotasPurchased: 1,
                        totalSpent: t.purchaseInfo.purchaseAmount || 0,
                        participatedAt: t.createdAt
                    }))
                });
            }
            
            totalResults = await User.countDocuments({
                $and: [
                    { isDeleted: { $ne: true } },
                    { $or: [
                        { name: searchRegex },
                        { email: searchRegex },
                        { phone: searchRegex }
                    ]}
                ]
            });
        }
        
        console.log(`✅ Busca concluída: ${results.length} resultados`);
        
        res.json({
            success: true,
            count: results.length,
            totalResults: totalResults,
            currentPage: page,
            totalPages: Math.ceil(totalResults / limit),
            data: results
        });
        
    } catch (error) {
        console.error('❌ Erro na busca avançada:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao realizar busca avançada',
            error: error.message
        });
    }
});

// @desc    Busca de tickets por número da rifa
// @route   GET /api/search/tickets/:raffleId
// @access  Private (Admin only)
const searchTicketsByRaffle = asyncHandler(async (req, res) => {
    try {
        console.log(`🎫 Buscando tickets da rifa: ${req.params.raffleId}`);
        
        const { ticketNumber } = req.query;
        
        let tickets;
        
        if (ticketNumber) {
            // Busca por número específico
            tickets = await Ticket.find({
                raffleId: req.params.raffleId,
                ticketNumber: parseInt(ticketNumber),
                isDeleted: false
            })
            .populate('userId', 'name email phone')
            .populate('raffleId', 'title formattedId');
        } else {
            // Busca todos os tickets da rifa
            tickets = await Ticket.find({
                raffleId: req.params.raffleId,
                isDeleted: false
            })
            .populate('userId', 'name email phone')
            .populate('raffleId', 'title formattedId')
            .sort({ ticketNumber: 1 });
        }
        
        console.log(`✅ Encontrados ${tickets.length} tickets`);
        
        res.json({
            success: true,
            count: tickets.length,
            data: tickets.map(ticket => ticket.getFullInfo())
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar tickets',
            error: error.message
        });
    }
});

module.exports = {
    searchCustomers,
    searchTicketsByRaffle
};
