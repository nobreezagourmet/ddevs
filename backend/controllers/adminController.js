const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Raffle = require('../models/Raffle');
const Quota = require('../models/Quota');
const User = require('../models/User');
const { deleteImage } = require('../middleware/uploadMiddleware');

// @desc    Swap ownership of a specific quota
// @route   POST /api/admin/swap-quota
// @access  Private/Admin
const swapQuota = asyncHandler(async (req, res) => {
    const { originUserId, destinationUserId, raffleId, quotaNumber } = req.body;

    if (!originUserId || !destinationUserId || !raffleId || !quotaNumber) {
        res.status(400);
        throw new Error('Please provide all required fields for quota swap');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const quota = await Quota.findOne({
            raffleId,
            number: quotaNumber,
            ownerId: originUserId,
        }).session(session);

        if (!quota) {
            throw new Error('Quota not found or does not belong to the origin user');
        }

        const destinationUser = await User.findById(destinationUserId).session(session);

        if (!destinationUser) {
            throw new Error('Destination user not found');
        }

        quota.ownerId = destinationUserId;
        await quota.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Quota ownership swapped successfully' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error(`Error swapping quota: ${error.message}`);
    }
});

// @desc    Create a new raffle with image upload
// @route   POST /api/admin/create-raffle
// @access  Private/Admin
const createRaffle = asyncHandler(async (req, res) => {
    try {
        console.log('=== DEBUG BACKEND CREATE RAFFLE ===');
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);

        const { title, pricePerQuota, totalQuotas, quickSelectPackages } = req.body;

        // VALIDAÇÃO DETALHADA
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Título da rifa é obrigatório e deve ser um texto válido' 
            });
        }

        // Converter para número se for string (FormData)
        const priceNum = typeof pricePerQuota === 'string' ? parseFloat(pricePerQuota) : pricePerQuota;
        const quotasNum = typeof totalQuotas === 'string' ? parseInt(totalQuotas) : totalQuotas;

        if (!pricePerQuota || isNaN(priceNum) || priceNum < 0.01) {
            return res.status(400).json({ 
                success: false, 
                message: 'Preço por cota é obrigatório e deve ser no mínimo R$ 0,01' 
            });
        }

        if (!totalQuotas || isNaN(quotasNum) || quotasNum <= 0 || quotasNum > 100000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Total de cotas é obrigatório, deve ser maior que zero e no máximo 100.000' 
            });
        }

        // Processar pacotes de seleção rápida
        let packages = [];
        if (quickSelectPackages) {
            try {
                packages = Array.isArray(quickSelectPackages) 
                    ? quickSelectPackages 
                    : JSON.parse(quickSelectPackages);
                
                // Validar pacotes
                packages = packages.filter(pkg => {
                    const num = parseInt(pkg);
                    return num > 0 && num <= parseInt(totalQuotas);
                });

                // Remover duplicados e ordenar
                packages = [...new Set(packages)].sort((a, b) => a - b);
            } catch (error) {
                console.warn('Erro ao processar pacotes:', error.message);
                packages = [10, 50, 100, 500]; // Padrão
            }
        } else {
            packages = [10, 50, 100, 500]; // Padrão
        }

        // Filtrar pacotes que não excedem o total de cotas
        packages = packages.filter(pkg => pkg <= quotasNum);

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            console.log(' Criando raffle:', { title, pricePerQuota, totalQuotas, packages });
            
            // Construir objeto da rifa
            const raffleData = {
                title: title.trim(),
                pricePerQuota: priceNum,
                totalQuotas: quotasNum,
                isActive: false,
                quickSelectPackages: packages,
            };

            // Adicionar informações da imagem se existir
            if (req.file) {
                raffleData.imageUrl = `/uploads/${req.file.filename}`;
                raffleData.imageFileName = req.file.filename;
            }
            
            const raffle = await Raffle.create([raffleData], { session });
            const createdRaffle = raffle[0];
            console.log(' Raffle criado:', createdRaffle._id);

            // Generate quotas for the new raffle
            const quotas = [];
            for (let i = 1; i <= quotasNum; i++) {
                quotas.push({
                    raffleId: createdRaffle._id,
                    number: String(i).padStart(String(quotasNum).length, '0'),
                    status: 'available',
                });
            }
            
            console.log(' Criando', quotas.length, 'cotas...');
            await Quota.insertMany(quotas, { session });
            console.log(' Cotass criadas com sucesso!');

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({ 
                success: true, 
                message: 'Rifa criada com sucesso!',
                data: {
                    ...createdRaffle.toObject(),
                    imageUrl: createdRaffle.imageUrl ? `${req.protocol}://${req.get('host')}${createdRaffle.imageUrl}` : null
                }
            });

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            
            // Deletar imagem se houver erro
            if (req.file) {
                deleteImage(req.file.filename);
            }
            
            throw error;
        }
    } catch (error) {
        return res.status(error.status || 500).json({ 
            success: false, 
            message: error.message || 'Raffle creation failed' 
        });
    }
});

// @desc    Get all raffles
// @route   GET /api/admin/raffles
// @access  Private/Admin
const getRaffles = asyncHandler(async (req, res) => {
    try {
        const raffles = await Raffle.find({}).sort({ createdAt: -1 });
        
        const rafflesWithImageUrl = raffles.map(raffle => ({
            ...raffle.toObject(),
            imageUrl: raffle.imageUrl ? `${req.protocol}://${req.get('host')}${raffle.imageUrl}` : null
        }));

        return res.status(200).json({
            success: true,
            data: rafflesWithImageUrl
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch raffles'
        });
    }
});

// @desc    Get single raffle
// @route   GET /api/admin/raffle/:id
// @access  Private/Admin
const getRaffle = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de rifa inválido'
            });
        }

        const raffle = await Raffle.findById(id);
        
        if (!raffle) {
            return res.status(404).json({
                success: false,
                message: 'Rifa não encontrada'
            });
        }

        const raffleWithImageUrl = {
            ...raffle.toObject(),
            imageUrl: raffle.imageUrl ? `${req.protocol}://${req.get('host')}${raffle.imageUrl}` : null
        };

        return res.status(200).json({
            success: true,
            data: raffleWithImageUrl
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch raffle'
        });
    }
});

// @desc    Delete raffle and associated data
// @route   DELETE /api/admin/raffle/:id
// @access  Private/Admin
const deleteRaffle = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de rifa inválido'
            });
        }

        // Buscar raffle antes de deletar para obter imagem
        const raffle = await Raffle.findById(id);
        
        if (!raffle) {
            return res.status(404).json({
                success: false,
                message: 'Rifa não encontrada'
            });
        }

        // Deletar imagem associada se existir
        if (raffle.imageFileName) {
            deleteImage(raffle.imageFileName);
        }

        // Deletar cotas associadas
        await Quota.deleteMany({ raffleId: id });

        // Deletar raffle
        await Raffle.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Rifa e dados associados deletados com sucesso'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete raffle'
        });
    }
});

// @desc    Delete raffle and associated data
// @route   DELETE /api/admin/raffle/:id
// @access  Private/Admin
const deleteRaffleSimplified = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de rifa inválido'
            });
        }

        const raffle = await Raffle.findById(id);
        
        if (!raffle) {
            return res.status(404).json({
                success: false,
                message: 'Rifa não encontrada'
            });
        }

        // Deletar cotas associadas
        await Quota.deleteMany({ raffleId: id });

        // Deletar raffle
        await Raffle.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Rifa deletada com sucesso'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete raffle'
        });
    }
});

module.exports = { swapQuota, createRaffle, deleteRaffle, deleteRaffleSimplified, getRaffles, getRaffle };