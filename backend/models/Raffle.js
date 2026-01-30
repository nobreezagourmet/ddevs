const mongoose = require('mongoose');

const raffleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    pricePerQuota: {
        type: Number,
        required: true,
        default: 0,
    },
    totalQuotas: {
        type: Number,
        required: true,
        default: 0,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false,
    },
}, {
    timestamps: true,
});

const Raffle = mongoose.model('Raffle', raffleSchema);

module.exports = Raffle;