const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = mongoose.Schema({
    leadId: {
        type: String,
        required: true,
        unique: true,
        default: () => `LED-${uuidv4()}`,
        index: true
    },
    sequentialId: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    firstRaffleAccessed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Raffle',
        default: null
    },
    participatedRaffles: [{
        raffleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Raffle',
            required: true
        },
        participatedAt: {
            type: Date,
            default: Date.now
        },
        quotasPurchased: {
            type: Number,
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        }
    }],
    totalQuotasPurchased: {
        type: Number,
        default: 0,
        min: 0
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});

userSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const lastUser = await this.constructor.findOne({}, {}, { sort: { sequentialId: -1 } });
            this.sequentialId = lastUser ? lastUser.sequentialId + 1 : 1;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

userSchema.methods.getFormattedLeadId = function() {
    return `LED-${this.sequentialId.toString().padStart(6, '0')}`;
};

userSchema.methods.getCompleteLeadId = function() {
    return `${this.leadId} (${this.getFormattedLeadId()})`;
};

userSchema.methods.addRaffleParticipation = function(raffleId, quotasPurchased, totalSpent) {
    const existingParticipation = this.participatedRaffles.find(
        p => p.raffleId.toString() === raffleId.toString()
    );
    
    if (existingParticipation) {
        existingParticipation.quotasPurchased += quotasPurchased;
        existingParticipation.totalSpent += totalSpent;
        existingParticipation.participatedAt = new Date();
    } else {
        this.participatedRaffles.push({
            raffleId,
            quotasPurchased,
            totalSpent,
            participatedAt: new Date()
        });
        
        // Se for a primeira participação, registrar
        if (!this.firstRaffleAccessed) {
            this.firstRaffleAccessed = raffleId;
        }
    }
    
    this.totalQuotasPurchased += quotasPurchased;
    this.totalSpent += totalSpent;
    this.lastActivityAt = new Date();
    
    return this.save();
};

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;