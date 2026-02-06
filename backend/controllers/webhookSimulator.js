// 🚀 WEBHOOK SIMULADO PARA TESTE DE PAGAMENTO PIX
const Quota = require('../models/Quota');
const Raffle = require('../models/Raffle');
const mongoose = require('mongoose');

// Simular confirmação de pagamento PIX
const simulatePixPayment = async (req, res) => {
    console.log('🚀 SIMULANDO CONFIRMAÇÃO DE PAGAMENTO PIX...');
    
    try {
        const { transactionId, raffleId, reservedQuotaNumbers, userId, amount } = req.body;
        
        console.log('📋 DADOS DO PAGAMENTO:');
        console.log('💰 Valor:', amount);
        console.log('📦 Raffle ID:', raffleId);
        console.log('🎫 Cotas:', reservedQuotaNumbers);
        console.log('👤 User ID:', userId);
        console.log('🔗 Transaction ID:', transactionId);
        
        // Verificar se as cotas existem e estão reservadas
        const quotas = await Quota.find({
            raffleId,
            number: { $in: reservedQuotaNumbers },
            status: 'reserved'
        });
        
        if (quotas.length === 0) {
            console.log('❌ Nenhuma cota encontrada para este pagamento');
            return res.status(404).json({ 
                success: false, 
                message: 'Nenhuma cota encontrada para este pagamento' 
            });
        }
        
        console.log(`✅ Encontradas ${quotas.length} cotas reservadas`);
        
        // Atualizar cotas para 'sold'
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            await Quota.updateMany(
                { raffleId, number: { $in: reservedQuotaNumbers }, status: 'reserved' },
                { 
                    $set: { 
                        status: 'sold', 
                        ownerId: userId,
                        reservationTimestamp: undefined,
                        soldAt: new Date()
                    } 
                },
                { session }
            );
            
            // Atualizar estatísticas da rifa
            await Raffle.findByIdAndUpdate(
                raffleId,
                { 
                    $inc: { 
                        totalParticipants: 1,
                        totalRevenue: amount
                    }
                },
                { session }
            );
            
            await session.commitTransaction();
            session.endSession();
            
            console.log('✅ PAGAMENTO CONFIRMADO COM SUCESSO!');
            console.log(`🎫 ${quotas.length} COTAS VENDIDAS`);
            console.log('💰 Valor total:', amount);
            
            res.status(200).json({ 
                success: true, 
                message: 'Pagamento PIX confirmado com sucesso!',
                data: {
                    transactionId,
                    raffleId,
                    soldQuotas: quotas.length,
                    amount,
                    confirmedAt: new Date()
                }
            });
            
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
        
    } catch (error) {
        console.error('❌ ERRO AO SIMULAR PAGAMENTO:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao confirmar pagamento: ' + error.message 
        });
    }
};

module.exports = { simulatePixPayment };
