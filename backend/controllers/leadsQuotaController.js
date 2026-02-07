const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Quota = require('../models/Quota');
const Raffle = require('../models/Raffle');
const User = require('../models/User');

// @desc    Get all customer quotas with detailed information (leads)
// @route   GET /api/admin/leads-quotas
// @access  Private/Admin
const getLeadsQuotas = asyncHandler(async (req, res) => {
    try {
        console.log('🔍 BUSCANDO COTAS DOS LEADS/CLIENTES...');
        
        // Buscar todas as cotas com informações completas
        const quotas = await Quota.find({})
            .populate('ownerId', 'name email phone password')
            .populate('raffleId', 'title sequentialId pricePerQuota')
            .sort({ createdAt: -1 });

        if (quotas && quotas.length > 0) {
            // Agrupar por cliente e mostrar informações detalhadas
            const customerQuotas = quotas.reduce((acc, quota) => {
                if (!quota.ownerId) {
                    // Cotas não vendidas
                    acc.unsold.push({
                        quotaNumber: quota.number,
                        raffleId: quota.raffleId?._id,
                        raffleTitle: quota.raffleId?.title,
                        raffleSequentialId: quota.raffleId?.sequentialId,
                        status: quota.status,
                        price: quota.raffleId?.pricePerQuota || 0
                    });
                    return acc;
                }
                
                const customerKey = quota.ownerId._id.toString();
                if (!acc.customers) {
                    acc.customers = {};
                }
                if (!acc.customers[customerKey]) {
                    acc.customers[customerKey] = {
                        customerId: quota.ownerId._id,
                        name: quota.ownerId.name,
                        email: quota.ownerId.email,
                        phone: quota.ownerId.phone,
                        password: quota.ownerId.password, // Mostrar senha do cliente
                        quotas: [],
                        totalValue: 0,
                        totalQuotas: 0
                    };
                }
                
                const quotaInfo = {
                    quotaId: quota._id,
                    quotaNumber: quota.number,
                    raffleId: quota.raffleId?._id,
                    raffleTitle: quota.raffleId?.title,
                    raffleSequentialId: quota.raffleId?.sequentialId,
                    status: quota.status,
                    price: quota.raffleId?.pricePerQuota || 0,
                    purchaseDate: quota.createdAt
                };
                
                acc.customers[customerKey].quotas.push(quotaInfo);
                acc.customers[customerKey].totalValue += quotaInfo.price;
                acc.customers[customerKey].totalQuotas += 1;
                
                return acc;
            }, { customers: {}, unsold: [] });

            const customersList = Object.values(customerQuotas.customers);
            
            console.log(`✅ ENCONTRADAS ${quotas.length} COTAS DE ${customersList.length} CLIENTES`);
            console.log(`❌ COTAS NÃO VENDIDAS: ${customerQuotas.unsold.length}`);
            
            return res.status(200).json({
                success: true,
                data: {
                    summary: {
                        totalQuotas: quotas.length,
                        totalCustomers: customersList.length,
                        unsoldQuotas: customerQuotas.unsold.length,
                        soldQuotas: quotas.length - customerQuotas.unsold.length
                    },
                    customers: customersList,
                    unsoldQuotas: customerQuotas.unsold
                }
            });
        } else {
            return res.status(200).json({
                success: true,
                data: {
                    summary: {
                        totalQuotas: 0,
                        totalCustomers: 0,
                        unsoldQuotas: 0,
                        soldQuotas: 0
                    },
                    customers: [],
                    unsoldQuotas: []
                }
            });
        }
    } catch (error) {
        console.error('❌ ERRO AO BUSCAR COTAS DOS LEADS:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar cotas dos clientes: ' + error.message
        });
    }
});

// @desc    Search quota by raffle ID and quota number (enhanced)
// @route   GET /api/admin/search-quota-enhanced
// @access  Private/Admin
const searchQuotaEnhanced = asyncHandler(async (req, res) => {
    try {
        const { raffleId, quotaNumber } = req.query;

        console.log('🔍 BUSCANDO COTA ESPECÍFICA (ENHANCED)...');
        console.log('📋 ID da Rifa:', raffleId);
        console.log('📋 Número da Cota:', quotaNumber);

        // Validar parâmetros
        if (!raffleId || !quotaNumber) {
            return res.status(400).json({
                success: false,
                message: 'Por favor, forneça o ID da rifa e o número da cota'
            });
        }

        // Buscar rifa pelo ID ou sequentialId
        let raffle;
        if (mongoose.Types.ObjectId.isValid(raffleId)) {
            raffle = await Raffle.findById(raffleId);
        } else {
            raffle = await Raffle.findOne({ sequentialId: parseInt(raffleId) });
        }
        
        if (!raffle) {
            return res.status(404).json({
                success: false,
                message: `Rifa ${raffleId} não encontrada`
            });
        }

        // Buscar cota específica
        const quota = await Quota.findOne({
            raffleId: raffle._id,
            number: String(quotaNumber).padStart(String(raffle.totalQuotas).length, '0')
        }).populate('ownerId', 'name email phone password');

        if (!quota) {
            return res.status(404).json({
                success: false,
                message: `Cota #${quotaNumber} não encontrada na rifa ${raffleId}`
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
                phone: quota.ownerId.phone,
                password: quota.ownerId.password // Mostrar senha do cliente
            } : null
        };

        console.log('✅ COTA ENCONTRADA:', {
            raffle: raffle.sequentialId,
            quota: quota.number,
            owner: quota.ownerId?.name || 'Não vendida',
            email: quota.ownerId?.email || 'N/A'
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
    getLeadsQuotas,
    searchQuotaEnhanced
};
