const mongoose = require('mongoose');

// Conectar ao banco
mongoose.connect('mongodb+srv://viniciosvinicius:vinicios123@cluster0.mongodb.net/rafflehub?retryWrites=true&w=majority')
    .then(async () => {
        console.log('🔗 Conectado ao MongoDB');
        
        const { Raffle } = require('./models/Raffle');
        
        // Limpar rifas existentes
        await Raffle.deleteMany({});
        console.log('🧹 Rifas existentes removidas');
        
        // Criar rifas reais para substituir as mock
        const realRaffles = [
            {
                title: 'RIFA DE CARRO ZERO - VW GOL 1.6',
                description: 'Rifa oficial com carro VW Gol 0km como prêmio principal',
                pricePerQuota: 100.00,
                totalQuotas: 3000,
                imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop',
                quickSelectPackages: [10, 50, 100, 500],
                isActive: true,
                status: 'active'
            },
            {
                title: 'RIFA DE MOTO HONDA CG 160',
                description: 'Rifa com moto Honda CG 160 Start 2025',
                pricePerQuota: 50.00,
                totalQuotas: 2000,
                imageUrl: 'https://images.unsplash.com/photo-1558981000-f29e65676bda?q=80&w=2070&auto=format&fit=crop',
                quickSelectPackages: [10, 25, 50, 100],
                isActive: true,
                status: 'active'
            },
            {
                title: 'RIFA DE R$20.000 EM DINHEIRO',
                description: 'Rifa com prêmio de R$20.000 pago via PIX',
                pricePerQuota: 20.00,
                totalQuotas: 2500,
                imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop',
                quickSelectPackages: [10, 25, 50, 200],
                isActive: true,
                status: 'active'
            },
            {
                title: 'RIFA DE IPHONE 15 PRO MAX',
                description: 'Rifa com iPhone 15 Pro Max 256GB Titanium',
                pricePerQuota: 25.00,
                totalQuotas: 1500,
                imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=2070&auto=format&fit=crop',
                quickSelectPackages: [10, 25, 50, 100],
                isActive: true,
                status: 'active'
            },
            {
                title: 'RIFA DE NOTEBOOK SAMSUNG BOOK3',
                description: 'Rifa com Samsung Galaxy Book3 Pro 360',
                pricePerQuota: 75.00,
                totalQuotas: 1200,
                imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2070&auto=format&fit=crop',
                quickSelectPackages: [10, 25, 50, 75],
                isActive: true,
                status: 'active'
            }
        ];
        
        console.log('🎯 Criando rifas reais...');
        
        for (const raffleData of realRaffles) {
            const raffle = new Raffle(raffleData);
            try {
                const savedRaffle = await raffle.save();
                console.log('✅ Rifa real criada com sucesso:');
                console.log('📋 ID:', savedRaffle.creationId);
                console.log('📋 Sequential ID:', savedRaffle.sequentialId);
                console.log('📋 Formatted ID:', savedRaffle.getFormattedId());
                console.log('📋 Título:', savedRaffle.title);
                console.log('📋 Preço:', savedRaffle.pricePerQuota);
                console.log('📋 Total de Cotas:', savedRaffle.totalQuotas);
                console.log('---');
            } catch (error) {
                console.error('❌ Erro ao criar rifa real:', error);
            }
        }
        
        console.log('🎉 Rifas reais criadas com sucesso!');
        console.log('🚨 RIFA FICTÍCIA SUBSTITUÍDA POR RIFAS REAIS!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Erro ao conectar:', err);
        process.exit(1);
    });
