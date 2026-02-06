const asyncHandler = require('express-async-handler');
const Quota = require('../models/Quota');
const Raffle = require('../models/Raffle');
const mongoose = require('mongoose');
const crypto = require('crypto');
const xflowService = require('../services/xflowService');

// MOCK: Definição de pacotes promocionais para demonstração
// Em um sistema real, isso viria de um banco de dados
const promotionalPackages = [
    { id: 'basic', quantity: 10, price: 50.00 },
    { id: 'silver', quantity: 50, price: 200.00 },
    { id: 'gold', quantity: 100, price: 350.00 },
];

// Função para verificar a assinatura do webhook da XFLOW
// === CRÍTICO: ADAPTAR ESTA FUNÇÃO CONFORME A DOCUMENTAÇÃO DA XFLOW ===
const verifyXflowSignature = (rawBody, signatureHeader, secret) => {
    // A XFLOW deve fornecer na documentação:
    // 1. O ALGORITMO de hash (ex: 'sha256').
    // 2. A FORMA exata como a 'payload' (corpo da requisição) é usada para gerar o hash.
    // 3. Se há outros dados (ex: timestamp, id) que precisam ser incluídos no hash.
    
    if (!signatureHeader) {
        console.error('Webhook: Signature header missing.');
        return false;
    }

    // === SUBSTITUIR: 'sha256' pelo algoritmo real da XFLOW se for diferente ===
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody); // Use o corpo bruto da requisição
    const expectedSignature = hmac.digest('hex');

    // Use uma comparação de tempo constante para evitar ataques de temporização
    const isValid = crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSignature));

    if (!isValid) {
        console.error(`Webhook: Invalid signature. Expected ${expectedSignature}, got ${signatureHeader}`);
    }

    return isValid;
};

// @desc    Create a payment order and reserve quotas
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { raffleId, purchaseType, quantity, packageId } = req.body;
    const userId = req.user._id;

    if (!raffleId || !purchaseType) {
        res.status(400);
        throw new Error('Please provide raffleId and purchaseType');
    }

    const raffle = await Raffle.findById(raffleId);

    if (!raffle) {
        res.status(404);
        throw new Error('Raffle not found');
    }

    let numQuotasToReserve = 0;
    let amount = 0;

    if (purchaseType === 'manual') {
        if (!quantity || quantity <= 0) {
            res.status(400);
            throw new Error('Please provide a valid quantity for manual purchase');
        }
        numQuotasToReserve = quantity;
        amount = raffle.pricePerQuota * quantity;
    } else if (purchaseType === 'package') {
        if (!packageId) {
            res.status(400);
            throw new Error('Please provide a packageId for package purchase');
        }
        const selectedPackage = promotionalPackages.find(p => p.id === packageId);
        if (!selectedPackage) {
            res.status(400);
            throw new Error('Invalid packageId');
        }
        numQuotasToReserve = selectedPackage.quantity;
        amount = selectedPackage.price;
    } else {
        res.status(400);
        throw new Error('Invalid purchase type');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const availableQuotas = await Quota.find({
            raffleId,
            status: 'available',
        }).limit(numQuotasToReserve).session(session);

        if (availableQuotas.length < numQuotasToReserve) {
            throw new Error('Not enough available quotas');
        }

        const reservedQuotaNumbers = availableQuotas.map(q => q.number);

        await Quota.updateMany(
            { _id: { $in: availableQuotas.map(q => q._id) } },
            { $set: { status: 'reserved', reservationTimestamp: new Date(), ownerId: userId } },
            { session }
        );

        // Gerar PIX usando a API da XFLOW através do serviço
        const orderId = new mongoose.Types.ObjectId().toString();
        const description = `Rifa: ${raffle.title} - ${numQuotasToReserve} Cotas`;
        const xflowPixData = await xflowService.generatePixPayment(amount, orderId, description);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            orderId: orderId,
            pixQRCode: xflowPixData.pixQRCode,
            pixCopyPaste: xflowPixData.pixCopyPaste,
            reservedQuotaNumbers,
            totalAmount: amount,
            transactionId: xflowPixData.transactionId,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error(`Error creating order: ${error.message}`);
    }
});

// @desc    Webhook to confirm payment
// @route   POST /api/payment/webhook
// @access  Public (should be protected by gateway signature verification)
const handleWebhook = asyncHandler(async (req, res) => {
    // === CRÍTICO: VERIFICAÇÃO DE ASSINATURA DO WEBHOOK DA XFLOW ===
    const xflowWebhookSecret = process.env.XFLOW_WEBHOOK_SECRET || '2wkDHXXB1S83ptPveRWdEnpCYHX12893mk123jH899';
    // === CRÍTICO: SUBSTITUIR PELO NOME REAL DO CABEÇALHO DA XFLOW ===
    // Exemplos de nomes de cabeçalho comuns: 'X-Hub-Signature', 'X-Webhook-Signature', 'x-xflow-signature'
    const signatureHeaderName = 'x-xflow-signature'; // Assumindo este nome por padrão
    const signature = req.headers[signatureHeaderName]; 
    const rawBody = req.rawBody; // Capturado pelo middleware em server.js

    console.log(' WEBHOOK RECEBIDO');
    console.log(' Secret configurada:', xflowWebhookSecret ? 'Sim' : 'Não');
    console.log(' Signature:', signature ? 'Presente' : 'Ausente');
    console.log(' Body length:', rawBody ? rawBody.length : '0');

    if (!xflowWebhookSecret) {
        console.error('XFLOW_WEBHOOK_SECRET not configured in .env');
        res.status(500).send('Webhook secret not configured.');
        return;
    }

    // O corpo bruto é uma string. A XFLOW pode esperar que ele seja usado como está
    // ou parseado como JSON antes de ser assinado. Confirme na documentação da XFLOW.
    let parsedRawBodyForSignature = rawBody;
    // Exemplo: se a XFLOW assina o JSON do corpo:
    // try { parsedRawBodyForSignature = JSON.parse(rawBody); } catch (e) { /* ignore if not JSON */ }


    if (!verifyXflowSignature(parsedRawBodyForSignature, signature, xflowWebhookSecret)) {
        console.error('Webhook: Invalid signature received.');
        res.status(403).send('Invalid webhook signature');
        return;
    }
    // === FIM DA VERIFICAÇÃO DE ASSINATURA ===

    // === AVISO: DESENVOLVIMENTO LOCAL ===
    // Esta URL do webhook (seu_dominio.com/api/payment/webhook) precisará ser
    // configurada no painel da XFLOW quando o site estiver online e com HTTPS.
    // Durante o desenvolvimento local, você pode precisar de ferramentas como ngrok
    // para expor seu localhost à internet e testar o webhook.

    // O req.body já está parseado por express.json() aqui (exceto rawBody)
    const { transactionId, status, customData } = req.body; // Adapte para o payload real da XFLOW
    // customData pode conter raffleId, reservedQuotaNumbers, userId para identificar a ordem

    if (!transactionId || !status || !customData) {
        res.status(400);
        throw new Error('Invalid webhook payload');
    }

    const { raffleId, reservedQuotaNumbers, userId } = customData;

    if (status === 'approved') {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            await Quota.updateMany(
                { raffleId: raffleId, number: { $in: reservedQuotaNumbers }, status: 'reserved' },
                { $set: { status: 'sold', ownerId: userId, reservationTimestamp: undefined } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ message: 'Payment confirmed and quotas sold.' });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            res.status(400);
            throw new Error(`Error processing webhook: ${error.message}`);
        }
    } else {
        // Lidar com outros status como 'pending', 'failed', 'cancelled'
        // Aqui, você pode querer reverter as cotas para 'available' se o pagamento falhar
        res.status(200).json({ message: `Payment status: ${status}` });
    }
});

module.exports = { createOrder, handleWebhook };