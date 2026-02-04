const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const raffleSchema = mongoose.Schema({
    // ID Único de Criação (UUID) - Campo crucial
    creationId: {
        type: String,
        required: true,
        unique: true,
        default: () => `RFL-${uuidv4()}`,
        index: true
    },
    // ID Numérico Sequencial para fácil referência
    sequentialId: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: 'Rifa emocionante com ótimos prêmios!'
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
    availableQuotas: {
        type: Number,
        required: true,
        min: 0,
        default: function() {
            return this.totalQuotas;
        }
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false,
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled', 'draft'],
        default: 'draft'
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
    // Campo para estatísticas
    totalParticipants: {
        type: Number,
        default: 0,
        min: 0
    },
    totalRevenue: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true,
});

// Middleware para gerar sequentialId antes de salvar
raffleSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const lastRaffle = await this.constructor.findOne({}, {}, { sort: { sequentialId: -1 } });
            this.sequentialId = lastRaffle ? lastRaffle.sequentialId + 1 : 1;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

// Método para obter ID formatado
raffleSchema.methods.getFormattedId = function() {
    return `RFL-${this.sequentialId.toString().padStart(6, '0')}`;
};

// Método para obter ID completo
raffleSchema.methods.getCompleteId = function() {
    return `${this.creationId} (${this.getFormattedId()})`;
};

const Raffle = mongoose.model('Raffle', raffleSchema);

module.exports = Raffle;