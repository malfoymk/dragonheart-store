// Rotas de Categorias
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/categorias - Listar todas as categorias
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                c.*,
                COUNT(p.id) as total_produtos
            FROM categorias c
            LEFT JOIN produtos p ON c.id = p.categoria_id AND p.ativo = true
            WHERE c.ativo = true
            GROUP BY c.id
            ORDER BY c.id
        `);
        
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/categorias/:id - Buscar categoria por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(`
            SELECT 
                c.*,
                COUNT(p.id) as total_produtos
            FROM categorias c
            LEFT JOIN produtos p ON c.id = p.categoria_id AND p.ativo = true
            WHERE c.id = $1 AND c.ativo = true
            GROUP BY c.id
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao buscar categoria:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/categorias/slug/:slug - Buscar categoria por slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const result = await db.query(`
            SELECT 
                c.*,
                COUNT(p.id) as total_produtos
            FROM categorias c
            LEFT JOIN produtos p ON c.id = p.categoria_id AND p.ativo = true
            WHERE c.slug = $1 AND c.ativo = true
            GROUP BY c.id
        `, [slug]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao buscar categoria:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
