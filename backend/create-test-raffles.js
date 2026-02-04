const mongoose = require('mongoose');

// Conectar ao banco
mongoose.connect('mongodb+srv://viniciosvinicius:vinicios123@cluster0.mongodb.net/rafflehub?retryWrites=true&w=majority')
    .then(async () => {
        console.log('🔗 Conectado ao MongoDB');
        
        // Limpar rifas existentes
        const { Raffle } = require('./models/Raffle');
        await Raffle.deleteMany({});
        console.log('🧹 Rifas existentes removidas');
        
        // Criar rifas de teste
        const testRaffles = [
            {
                title: 'RIFA DE IPHONE 15 PRO MAX - VERSÃO OFICIAL',
                description: 'Rifa oficial com iPhone 15 Pro Max como prêmio principal',
                pricePerQuota: 50.00,
                totalQuotas: 2000,
                imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=2070&auto=format&fit=crop',
                quickSelectPackages: [10, 50, 100, 500],
                isActive: true,
                status: 'active'
            },
            {
                title: 'RIFA DE NOTEBOOK GAMER - ALIENWARE',
                description: 'Notebook Alienware completo para gamers',
                pricePerQuota: 75.00,
                totalQuotas: 1500,
                imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2070&auto=format&fit=crop',
                quickSelectPackages: [10, 50, 100, 300],
                isActive: true,
                status: 'active'
            },
            {
                title: 'RIFA DE R$10.000 EM DINHEIRO',
                description: 'Rifa com prêmio de R$10.000 pago via PIX',
                pricePerQuota: 25.00,
                totalQuotas: 1000,
                imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop',
                quickSelectPackages: [10, 25, 50, 100],
                isActive: true,
                status: 'active'
            }
        ];
        
        for (const raffleData of testRaffles) {
            const raffle = new Raffle(raffleData);
            try {
                const savedRaffle = await raffle.save();
                console.log('✅ Rifa criada com sucesso:');
                console.log('📋 ID:', savedRaffle.creationId);
                console.log('📋 Sequential ID:', savedRaffle.sequentialId);
                console.log('📋 Formatted ID:', savedRaffle.getFormattedId());
                console.log('📋 Título:', savedRaffle.title);
                console.log('📋 Preço:', savedRaffle.pricePerQuota);
                console.log('📋 Total de Cotas:', savedRaffle.totalQuotas);
                console.log('---');
            } catch (error) {
                console.error('❌ Erro ao criar rifa:', error);
            }
        }
        
        console.log('🎉 Rifas de teste criadas com sucesso!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Erro ao conectar:', err);
        process.exit(1);
    });
