const mongoose = require('mongoose');

// Modelo para consulta cruzada de tickets (Protocolo de Correção)
const ticketSchema = mongoose.Schema({
    // ID do ticket
    ticketNumber: {
        type: Number,
        required: true,
        index: true
    },
    
    // Relacionamento com rifa
    raffleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Raffle',
        required: true,
        index: true
    },
    
    // Relacionamento com usuário
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Status do ticket
    status: {
        type: String,
        enum: ['available', 'reserved', 'sold', 'paid'],
        default: 'available',
        index: true
    },
    
    // Informações de compra
    purchaseInfo: {
        purchaseDate: {
            type: Date,
            default: null
        },
        purchaseAmount: {
            type: Number,
            default: 0
        },
        paymentMethod: {
            type: String,
            default: null
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'cancelled'],
            default: 'pending'
        }
    },
    
    // Controle de persistência
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    },
    
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices compostos para performance
ticketSchema.index({ raffleId: 1, ticketNumber: 1 });
ticketSchema.index({ userId: 1, status: 1 });
ticketSchema.index({ raffleId: 1, status: 1 });

// Método estático para buscar ticket por número
ticketSchema.statics.findByNumber = async function(ticketNumber) {
    return this.findOne({ 
        ticketNumber: ticketNumber, 
        isDeleted: false 
    })
    .populate('userId', 'name email phone')
    .populate('raffleId', 'title formattedId');
};

// Método estático para buscar tickets do usuário
ticketSchema.statics.findByUser = async function(userId) {
    return this.find({ 
        userId: userId, 
        isDeleted: false 
    })
    .populate('raffleId', 'title formattedId status')
    .sort({ createdAt: -1 });
};

// Método para obter informações completas
ticketSchema.methods.getFullInfo = function() {
    return {
        ticketNumber: this.ticketNumber,
        raffle: this.raffleId,
        user: this.userId,
        status: this.status,
        purchaseInfo: this.purchaseInfo,
        createdAt: this.createdAt
    };
};

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
