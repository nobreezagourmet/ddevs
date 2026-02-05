const mongoose = require('mongoose');
const Raffle = require('../models/Raffle');

// Script de migração para produção - corrigir sequentialId em rifas existentes
async function migrateProductionRaffles() {
    try {
        console.log('🔄 Iniciando migração de produção...');
        
        // Conectar ao MongoDB de produção
        const mongoUri = 'mongodb+srv://nobreezagourmet:cluster0.8r4.mongodb.net/raffle-system?retryWrites=true&w=majority';
        await mongoose.connect(mongoUri);
        console.log('✅ Conectado ao MongoDB de produção:', mongoUri);
        
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
            
            console.log('✅ Migração de produção concluída com sucesso!');
        } else {
            console.log('✅ Todas as rifas já têm sequentialId');
        }
        
        // Verificar resultado
        const rifasAposMigracao = await Raffle.find({ sequentialId: { $exists: true } });
        console.log(`📊 Total de rifas com sequentialId após migração: ${rifasAposMigracao.length}`);
        
        // Verificar rifas sem sequentialId restantes
        const rifasRestantes = await Raffle.find({ sequentialId: { $exists: false } });
        if (rifasRestantes.length === 0) {
            console.log('✅ Migração 100% concluída! Todas as rifas têm sequentialId.');
        } else {
            console.log(`⚠️ Ainda existem ${rifasRestantes.length} rifas sem sequentialId`);
        }
        
    } catch (error) {
        console.error('❌ Erro na migração de produção:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

// Executar migração
migrateProductionRaffles();
