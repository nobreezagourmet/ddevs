const mongoose = require('mongoose');
const Raffle = require('../models/Raffle');

// Script de migração para corrigir sequentialId em rifas existentes
async function migrateExistingRaffles() {
    try {
        console.log('🔄 Iniciando migração de rifas existentes...');
        
        // Conectar ao MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/raffle-system';
        await mongoose.connect(mongoUri);
        console.log('✅ Conectado ao MongoDB:', mongoUri);
        
        const rifasSemSequentialId = await Raffle.find({ sequentialId: { $exists: false } });
        
        if (rifasSemSequentialId.length > 0) {
            console.log(`📊 Encontradas ${rifasSemSequentialId.length} rifas sem sequentialId`);
            
            // Encontrar o último sequentialId existente
            const lastRaffle = await Raffle.findOne({}, {}, { sort: { sequentialId: -1 } });
            let nextSequentialId = lastRaffle ? (lastRaffle.sequentialId || 0) + 1 : 1;
            
            for (let i = 0; i < rifasSemSequentialId.length; i++) {
                const raffle = rifasSemSequentialId[i];
                
                await Raffle.updateOne(
                    { _id: raffle._id },
                    { 
                        $set: { 
                            sequentialId: nextSequentialId,
                            status: raffle.status || 'draft'
                        } 
                    }
                );
                
                console.log(`✅ Rifa "${raffle.title}" atualizada: sequentialId ${nextSequentialId}`);
                nextSequentialId++;
            }
            
            console.log('✅ Migração concluída com sucesso!');
        } else {
            console.log('✅ Todas as rifas já têm sequentialId');
        }
        
        // Verificar resultado
        const rifasAposMigracao = await Raffle.find({ sequentialId: { $exists: true } });
        console.log(`📊 Total de rifas com sequentialId após migração: ${rifasAposMigracao.length}`);
        
    } catch (error) {
        console.error('❌ Erro na migração:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

// Executar migração
migrateExistingRaffles();
