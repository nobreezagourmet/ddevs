const asyncHandler = require('express-async-handler');
const Quota = require('../models/Quota');

// @desc    Get all quotas purchased by the logged in user
// @route   GET /api/user/my-numbers
// @access  Private
const getMyNumbers = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const myQuotas = await Quota.find({ ownerId: userId }).populate('raffleId', 'title');

    if (myQuotas) {
        // Group quotas by raffle for better display, similar to frontend Purchase structure
        const groupedQuotas = myQuotas.reduce((acc, quota) => {
            const raffleTitle = quota.raffleId ? quota.raffleId.title : 'Unknown Raffle';
            if (!acc[raffleTitle]) {
                acc[raffleTitle] = {
                    id: quota.raffleId._id,
                    quotas: 0,
                    numbers: [],
                    date: quota.createdAt, // Using creation date as purchase date for now
                };
            }
            acc[raffleTitle].quotas += 1;
            acc[raffleTitle].numbers.push(quota.number);
            return acc;
        }, {});

        res.json(Object.values(groupedQuotas));
    } else {
        res.status(404);
        throw new Error('No purchased numbers found');
    }
});

module.exports = { getMyNumbers };