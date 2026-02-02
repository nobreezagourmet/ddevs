const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Raffle = require('../models/Raffle');
const Quota = require('../models/Quota');

// @desc    Delete raffle and associated data
// @route   DELETE /api/admin/raffle/:id
// @access  Private/Admin
const deleteRaffle = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de rifa inválido'
            });
        }

        const raffle = await Raffle.findById(id);
        
        if (!raffle) {
            return res.status(404).json({
                success: false,
                message: 'Rifa não encontrada'
            });
        }

        // Deletar cotas associadas
        await Quota.deleteMany({ raffleId: id });

        // Deletar raffle
        await Raffle.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Rifa deletada com sucesso'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete raffle'
        });
    }
});

module.exports = { deleteRaffle };
