const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configuração do storage local
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        // Sanitização do nome do arquivo
        const originalName = file.originalname;
        const sanitized = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
        
        // Gerar nome único com timestamp e hash
        const timestamp = Date.now();
        const randomHash = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(sanitized);
        const fileName = `${timestamp}_${randomHash}${ext}`;
        
        cb(null, fileName);
    }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Apenas imagens são aceitas.'), false);
    }
};

// Configuração do multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Apenas um arquivo por vez
    }
});

// Middleware para servir arquivos estáticos
const serveStatic = require('express').static;

// Função para configurar serving de uploads
const configureUploads = (app) => {
    // Criar diretório uploads se não existir
    const fs = require('fs');
    const uploadDir = path.join(__dirname, '../uploads/');
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Servir arquivos estáticos da pasta uploads
    app.use('/uploads', serveStatic(uploadDir));
};

// Função para deletar imagem
const deleteImage = (fileName) => {
    const fs = require('fs');
    const filePath = path.join(__dirname, '../uploads/', fileName);
    
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
};

module.exports = {
    upload,
    configureUploads,
    deleteImage
};
