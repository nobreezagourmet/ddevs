const asyncHandler = require('express-async-handler');
const Quota = require('../models/Quota');
const Raffle = require('../models/Raffle');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Swap ownership of a specific quota
// @route   POST /api/admin/swap-quota
// @access  Private/Admin
const swapQuota = asyncHandler(async (req, res) => {
    const { originUserId, destinationUserId, raffleId, quotaNumber } = req.body;

    if (!originUserId || !destinationUserId || !raffleId || !quotaNumber) {
        res.status(400);
        throw new Error('Please provide all required fields for quota swap');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const quota = await Quota.findOne({
            raffleId,
            number: quotaNumber,
            ownerId: originUserId,
        }).session(session);

        if (!quota) {
            throw new Error('Quota not found or does not belong to the origin user');
        }

        const destinationUser = await User.findById(destinationUserId).session(session);

        if (!destinationUser) {
            throw new Error('Destination user not found');
        }

        quota.ownerId = destinationUserId;
        await quota.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Quota ownership swapped successfully' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error(`Error swapping quota: ${error.message}`);
    }
});

// @desc    Create a new raffle
// @route   POST /api/admin/create-raffle
// @access  Private/Admin
const createRaffle = asyncHandler(async (req, res) => {
    const { title, pricePerQuota, totalQuotas } = req.body;

    // VALIDAÇÃO DETALHADA
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Título da rifa é obrigatório e deve ser um texto válido' 
        });
    }

    if (!pricePerQuota || isNaN(pricePerQuota) || parseFloat(pricePerQuota) <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Preço por cota é obrigatório e deve ser maior que zero' 
        });
    }

    if (!totalQuotas || isNaN(totalQuotas) || parseInt(totalQuotas) <= 0 || parseInt(totalQuotas) > 10000) {
        return res.status(400).json({ 
            success: false, 
            message: 'Total de cotas é obrigatório, deve ser maior que zero e menor que 10000' 
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log(' Criando raffle:', { title, pricePerQuota, totalQuotas });
        
        const raffle = await Raffle.create([{
            title: title.trim(),
            pricePerQuota: parseFloat(pricePerQuota),
            totalQuotas: parseInt(totalQuotas),
            isActive: false,
        }], { session });

        const createdRaffle = raffle[0];
        console.log(' Raffle criado:', createdRaffle._id);

        // Generate quotas for the new raffle
        const quotas = [];
        for (let i = 1; i <= parseInt(totalQuotas); i++) {
            quotas.push({
                raffleId: createdRaffle._id,
                number: String(i).padStart(String(totalQuotas).length, '0'),
                status: 'available',
            });
        }
        
        console.log(' Criando', quotas.length, 'cotas...');
        await Quota.insertMany(quotas, { session });
        console.log(' Cotass criadas com sucesso!');

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({ success: true });

    } catch (error) {
        console.error(' ERRO AO CRIAR RIFA:', error);
        await session.abortTransaction();
        session.endSession();
        
        // ERRO ESPECÍFICO DO MONGODB
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Erro de validação: ' + errors.join(', ') 
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Rifa duplicada detectada' 
            });
        }
        
        res.status(400).json({ 
            success: false, 
            message: `Erro ao criar rifa: ${error.message}` 
        });
    }
});

module.exports = { swapQuota, createRaffle };