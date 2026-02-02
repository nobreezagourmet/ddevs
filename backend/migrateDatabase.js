const mongoose = require('mongoose');
const Raffle = require('./models/Raffle');
const dotenv = require('dotenv');

dotenv.config();

const migrateDatabase = async () => {
    try {
        console.log('🔄 === MIGRAÇÃO DO BANCO DE DADOS ===');
        
        // Conectar ao banco
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado ao MongoDB');

        // Verificar se há rifas existentes sem os novos campos
        const existingRaffles = await Raffle.find({});
        console.log(`📋 Encontradas ${existingRaffles.length} rifas existentes`);

        let migratedCount = 0;
        
        for (const raffle of existingRaffles) {
            let needsUpdate = false;
            const updateData = {};

            // Verificar e adicionar campos faltantes
            if (!raffle.imageUrl) {
                updateData.imageUrl = null;
                needsUpdate = true;
            }

            if (!raffle.imageFileName) {
                updateData.imageFileName = null;
                needsUpdate = true;
            }

            if (!raffle.quickSelectPackages || raffle.quickSelectPackages.length === 0) {
                updateData.quickSelectPackages = [10, 50, 100, 500];
                needsUpdate = true;
            }

            // Validar se o preço por cota é válido (mínimo 0.01)
            if (raffle.pricePerQuota < 0.01) {
                updateData.pricePerQuota = 0.01;
                needsUpdate = true;
            }

            // Validar se o total de cotas está dentro do limite (máximo 100000)
            if (raffle.totalQuotas > 100000) {
                updateData.totalQuotas = 100000;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await Raffle.updateOne({ _id: raffle._id }, updateData);
                console.log(`🔄 Rifa "${raffle.title}" migrada`);
                migratedCount++;
            }
        }

        console.log(`✅ Migração concluída! ${migratedCount} rifas atualizadas`);
        
        // Verificar consistência final
        const finalRaffles = await Raffle.find({});
        console.log(`📊 Total de rifas após migração: ${finalRaffles.length}`);
        
        console.log('\n🎉 === MIGRAÇÃO CONCLUÍDA COM SUCESSO ===');
        
    } catch (error) {
        console.error('❌ Erro na migração:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
};

migrateDatabase();
