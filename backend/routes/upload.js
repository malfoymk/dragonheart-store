// Rotas de Upload de Imagens
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Criar pasta uploads se não existir
const uploadsDir = path.join(__dirname, '..', 'uploads', 'produtos');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'produto-' + uniqueSuffix + ext);
    }
});

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

// POST /api/upload/produto - Upload de imagem de produto
router.post('/produto', upload.single('imagem'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nenhuma imagem foi enviada' 
            });
        }
        
        const imageUrl = `/uploads/produtos/${req.file.filename}`;
        
        res.json({
            success: true,
            data: {
                filename: req.file.filename,
                url: imageUrl,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/upload/produtos-multiplos - Upload de múltiplas imagens
router.post('/produtos-multiplos', upload.array('imagens', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nenhuma imagem foi enviada' 
            });
        }
        
        const images = req.files.map(file => ({
            filename: file.filename,
            url: `/uploads/produtos/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype
        }));
        
        res.json({
            success: true,
            data: images
        });
    } catch (error) {
        console.error('Erro no upload múltiplo:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/upload/:filename - Deletar imagem
router.delete('/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: 'Imagem deletada com sucesso' });
        } else {
            res.status(404).json({ success: false, error: 'Imagem não encontrada' });
        }
    } catch (error) {
        console.error('Erro ao deletar imagem:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
