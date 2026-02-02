const mongoose = require('mongoose');
const Raffle = require('./models/Raffle');
const dotenv = require('dotenv');

dotenv.config();

const testRaffleIntegration = async () => {
    try {
        console.log('🧪 === TESTE DE INTEGRAÇÃO DE RIFA ===');
        
        // Conectar ao banco
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado ao MongoDB');

        // Testar criação de rifa com novos campos
        const testRaffle = {
            title: 'Rifa Teste Integração',
            pricePerQuota: 0.01,
            totalQuotas: 1000,
            isActive: false,
            imageUrl: '/uploads/test_image.jpg',
            imageFileName: 'test_image.jpg',
            quickSelectPackages: [10, 50, 100, 500, 1000]
        };

        console.log('📝 Criando rifa de teste:', testRaffle);
        
        const createdRaffle = await Raffle.create(testRaffle);
        console.log('✅ Rifa criada com sucesso!');
        console.log('📋 Detalhes:', createdRaffle.toObject());

        // Testar validação de campos
        console.log('\n🔍 Testando validações...');
        
        // Testar preço mínimo
        try {
            await Raffle.create({
                title: 'Teste Preço Inválido',
                pricePerQuota: 0.005, // Abaixo do mínimo
                totalQuotas: 100
            });
        } catch (error) {
            console.log('✅ Validação de preço mínimo funcionou:', error.message);
        }

        // Testar limite máximo de cotas
        try {
            await Raffle.create({
                title: 'Teste Limite Máximo',
                pricePerQuota: 1.00,
                totalQuotas: 100001 // Acima do máximo
            });
        } catch (error) {
            console.log('✅ Validação de limite máximo funcionou:', error.message);
        }

        // Limpar dados de teste
        await Raffle.deleteOne({ _id: createdRaffle._id });
        console.log('🧹 Dados de teste removidos');

        console.log('\n🎉 === TESTE CONCLUÍDO COM SUCESSO ===');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
};

testRaffleIntegration();
