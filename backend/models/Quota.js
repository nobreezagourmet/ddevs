const mongoose = require('mongoose');

const quotaSchema = mongoose.Schema({
    raffleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Raffle',
    },
    number: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['available', 'reserved', 'sold'],
        default: 'available',
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    reservationTimestamp: {
        type: Date,
    },
}, {
    timestamps: true,
});

quotaSchema.index({ raffleId: 1, number: 1 }, { unique: true });

const Quota = mongoose.model('Quota', quotaSchema);

module.exports = Quota;