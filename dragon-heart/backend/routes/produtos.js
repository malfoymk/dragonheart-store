// Rotas de Produtos
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/produtos - Listar todos os produtos
router.get('/', async (req, res) => {
    try {
        const { categoria, busca, limite = 50, pagina = 1 } = req.query;
        
        let query = `
            SELECT 
                p.*,
                c.nome as categoria_nome,
                c.slug as categoria_slug,
                COALESCE(
                    json_agg(
                        json_build_object('url', pi.url, 'ordem', pi.ordem, 'principal', pi.principal)
                        ORDER BY pi.ordem
                    ) FILTER (WHERE pi.id IS NOT NULL),
                    '[]'
                ) as imagens
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN produto_imagens pi ON p.id = pi.produto_id
            WHERE p.ativo = true
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (categoria) {
            query += ` AND c.slug = $${paramCount}`;
            params.push(categoria);
            paramCount++;
        }
        
        if (busca) {
            query += ` AND (p.nome ILIKE $${paramCount} OR p.descricao ILIKE $${paramCount})`;
            params.push(`%${busca}%`);
            paramCount++;
        }
        
        query += ` GROUP BY p.id, c.nome, c.slug ORDER BY p.created_at DESC`;
        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(parseInt(limite), (parseInt(pagina) - 1) * parseInt(limite));
        
        const result = await db.query(query, params);
        
        res.json({
            success: true,
            data: result.rows,
            pagination: {
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                total: result.rowCount
            }
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/produtos/:id - Buscar produto por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(`
            SELECT 
                p.*,
                c.nome as categoria_nome,
                c.slug as categoria_slug,
                COALESCE(
                    json_agg(
                        json_build_object('url', pi.url, 'ordem', pi.ordem, 'principal', pi.principal)
                        ORDER BY pi.ordem
                    ) FILTER (WHERE pi.id IS NOT NULL),
                    '[]'
                ) as imagens
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN produto_imagens pi ON p.id = pi.produto_id
            WHERE p.id = $1 AND p.ativo = true
            GROUP BY p.id, c.nome, c.slug
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Produto não encontrado' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/produtos/slug/:slug - Buscar produto por slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const result = await db.query(`
            SELECT 
                p.*,
                c.nome as categoria_nome,
                c.slug as categoria_slug,
                COALESCE(
                    json_agg(
                        json_build_object('url', pi.url, 'ordem', pi.ordem, 'principal', pi.principal)
                        ORDER BY pi.ordem
                    ) FILTER (WHERE pi.id IS NOT NULL),
                    '[]'
                ) as imagens
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN produto_imagens pi ON p.id = pi.produto_id
            WHERE p.slug = $1 AND p.ativo = true
            GROUP BY p.id, c.nome, c.slug
        `, [slug]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Produto não encontrado' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/produtos - Criar novo produto (admin)
router.post('/', async (req, res) => {
    try {
        const { nome, descricao, preco, preco_promocional, categoria_id, imagem_url, badge, estoque, slug } = req.body;
        
        const result = await db.query(`
            INSERT INTO produtos (nome, descricao, preco, preco_promocional, categoria_id, imagem_url, badge, estoque, slug)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [nome, descricao, preco, preco_promocional, categoria_id, imagem_url, badge, estoque, slug]);
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/produtos/:id - Atualizar produto (admin)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, preco_promocional, categoria_id, imagem_url, badge, estoque, ativo } = req.body;
        
        const result = await db.query(`
            UPDATE produtos 
            SET nome = COALESCE($1, nome),
                descricao = COALESCE($2, descricao),
                preco = COALESCE($3, preco),
                preco_promocional = $4,
                categoria_id = COALESCE($5, categoria_id),
                imagem_url = COALESCE($6, imagem_url),
                badge = $7,
                estoque = COALESCE($8, estoque),
                ativo = COALESCE($9, ativo)
            WHERE id = $10
            RETURNING *
        `, [nome, descricao, preco, preco_promocional, categoria_id, imagem_url, badge, estoque, ativo, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Produto não encontrado' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/produtos/:id - Deletar produto permanentemente (hard delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Primeiro, deletar imagens relacionadas
        await db.query(`DELETE FROM produto_imagens WHERE produto_id = $1`, [id]);
        
        // Depois, deletar o produto
        const result = await db.query(`
            DELETE FROM produtos WHERE id = $1 RETURNING *
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Produto não encontrado' });
        }
        
        res.json({ success: true, message: 'Produto excluído permanentemente com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
