const asyncHandler = require('express-async-handler');
const Quota = require('../models/Quota');
const Raffle = require('../models/Raffle');
const User = require('../models/User');

// @desc    Get all quotas from all customers
// @route   GET /api/admin/customer-quotas
// @access  Private/Admin
const getAllCustomerQuotas = asyncHandler(async (req, res) => {
    try {
        console.log('🔍 BUSCANDO TODAS AS COTAS DOS CLIENTES...');
        
        // Buscar todas as cotas com informações do usuário e rifa
        const quotas = await Quota.find({})
            .populate('ownerId', 'name email phone')
            .populate('raffleId', 'title sequentialId')
            .sort({ createdAt: -1 });

        if (quotas && quotas.length > 0) {
            // Agrupar por cliente para melhor visualização
            const groupedByCustomer = quotas.reduce((acc, quota) => {
                if (!quota.ownerId) return acc;
                
                const customerKey = quota.ownerId._id.toString();
                if (!acc[customerKey]) {
                    acc[customerKey] = {
                        customer: {
                            id: quota.ownerId._id,
                            name: quota.ownerId.name,
                            email: quota.ownerId.email,
                            phone: quota.ownerId.phone
                        },
                        quotas: []
                    };
                }
                
                acc[customerKey].quotas.push({
                    id: quota._id,
                    number: quota.number,
                    status: quota.status,
                    raffle: {
                        id: quota.raffleId?._id,
                        title: quota.raffleId?.title,
                        sequentialId: quota.raffleId?.sequentialId
                    },
                    purchaseDate: quota.createdAt,
                    purchaseValue: quota.raffleId?.pricePerQuota || 0
                });
                
                return acc;
            }, {});

            console.log(`✅ ENCONTRADAS ${quotas.length} COTAS DE ${Object.keys(groupedByCustomer).length} CLIENTES`);
            
            return res.status(200).json({
                success: true,
                data: {
                    totalQuotas: quotas.length,
                    totalCustomers: Object.keys(groupedByCustomer).length,
                    customers: Object.values(groupedByCustomer)
                }
            });
        } else {
            return res.status(200).json({
                success: true,
                data: {
                    totalQuotas: 0,
                    totalCustomers: 0,
                    customers: []
                }
            });
        }
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR COTAS DOS CLIENTES:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar cotas dos clientes: ' + error.message
        });
    }
});

// @desc    Search quota by raffle number and quota number
// @route   GET /api/admin/search-quota
// @access  Private/Admin
const searchQuota = asyncHandler(async (req, res) => {
    try {
        const { raffleNumber, quotaNumber } = req.query;

        console.log('🔍 BUSCANDO COTA ESPECÍFICA...');
        console.log('📋 Número da Rifa:', raffleNumber);
        console.log('📋 Número da Cota:', quotaNumber);

        // Validar parâmetros
        if (!raffleNumber || !quotaNumber) {
            return res.status(400).json({
                success: false,
                message: 'Por favor, forneça o número da rifa e o número da cota'
            });
        }

        // Buscar rifa pelo sequentialId
        const raffle = await Raffle.findOne({ sequentialId: parseInt(raffleNumber) });
        
        if (!raffle) {
            return res.status(404).json({
                success: false,
                message: `Rifa #${raffleNumber} não encontrada`
            });
        }

        // Buscar cota específica
        const quota = await Quota.findOne({
            raffleId: raffle._id,
            number: parseInt(quotaNumber)
        }).populate('ownerId', 'name email phone');

        if (!quota) {
            return res.status(404).json({
                success: false,
                message: `Cota #${quotaNumber} não encontrada na rifa #${raffleNumber}`
            });
        }

        // Montar resposta completa
        const quotaInfo = {
            quota: {
                id: quota._id,
                number: quota.number,
                status: quota.status,
                purchaseDate: quota.createdAt
            },
            raffle: {
                id: raffle._id,
                title: raffle.title,
                sequentialId: raffle.sequentialId,
                pricePerQuota: raffle.pricePerQuota,
                totalQuotas: raffle.totalQuotas,
                availableQuotas: raffle.availableQuotas,
                isActive: raffle.isActive
            },
            owner: quota.ownerId ? {
                id: quota.ownerId._id,
                name: quota.ownerId.name,
                email: quota.ownerId.email,
                phone: quota.ownerId.phone
            } : null
        };

        console.log('✅ COTA ENCONTRADA:', {
            raffle: raffle.sequentialId,
            quota: quota.number,
            owner: quota.ownerId?.name || 'Não vendida'
        });

        return res.status(200).json({
            success: true,
            data: quotaInfo
        });

    } catch (error) {
        console.error('❌ ERRO AO BUSCAR COTA:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar cota: ' + error.message
        });
    }
});

module.exports = {
    getAllCustomerQuotas,
    searchQuota
};
