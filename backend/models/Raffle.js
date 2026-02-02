const mongoose = require('mongoose');

const raffleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    pricePerQuota: {
        type: Number,
        required: true,
        min: 0.01,
        default: 0,
    },
    totalQuotas: {
        type: Number,
        required: true,
        min: 1,
        max: 100000,
        default: 0,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false,
    },
    imageUrl: {
        type: String,
        default: null,
    },
    imageFileName: {
        type: String,
        default: null,
    },
    quickSelectPackages: [{
        type: Number,
        min: 1,
        max: 100000,
    }],
}, {
    timestamps: true,
});

const Raffle = mongoose.model('Raffle', raffleSchema);

module.exports = Raffle;