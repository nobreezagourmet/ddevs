const mongoose = require('mongoose');
const Raffle = require('./models/Raffle');

// Conectar ao banco
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://viniciosvinicius:vinicios123@cluster0.mongodb.net/rafflehub?retryWrites=true&w=majority')
    .then(async () => {
        console.log('🔗 Conectado ao MongoDB');
        
        // Criar rifa de teste
        const testRaffle = new Raffle({
            title: 'RIFA DE TESTE - CRIADA AUTOMATICAMENTE',
            description: 'Rifa de teste para verificar sincronização com frontend',
            pricePerQuota: 25.50,
            totalQuotas: 1000,
            imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop',
            quickSelectPackages: [10, 50, 100, 500],
            isActive: true,
            status: 'active'
        });
        
        try {
            const savedRaffle = await testRaffle.save();
            console.log('✅ Rifa de teste criada com sucesso!');
            console.log('📋 ID:', savedRaffle.creationId);
            console.log('📋 Sequential ID:', savedRaffle.sequentialId);
            console.log('📋 Formatted ID:', savedRaffle.getFormattedId());
            console.log('📋 Título:', savedRaffle.title);
            console.log('📋 Preço:', savedRaffle.pricePerQuota);
            console.log('📋 Total de Cotas:', savedRaffle.totalQuotas);
        } catch (error) {
            console.error('❌ Erro ao criar rifa:', error);
        }
        
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Erro ao conectar:', err);
        process.exit(1);
    });
