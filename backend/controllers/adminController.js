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

    if (!title || !pricePerQuota || !totalQuotas || pricePerQuota <= 0 || totalQuotas <= 0) {
        res.status(400);
        throw new Error('Please provide valid title, price per quota, and total quotas');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const raffle = await Raffle.create({
            title,
            pricePerQuota,
            totalQuotas,
            isActive: false, // Newly created raffles are inactive by default
        });

        // Generate quotas for the new raffle
        const quotas = [];
        for (let i = 1; i <= totalQuotas; i++) {
            quotas.push({
                raffleId: raffle._id,
                number: String(i).padStart(String(totalQuotas).length, '0'),
                status: 'available',
            });
        }
        await Quota.insertMany(quotas, { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(raffle);

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error(`Error creating raffle: ${error.message}`);
    }
});

module.exports = { swapQuota, createRaffle };