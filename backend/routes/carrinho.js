// Rotas de Carrinho
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/carrinho/:sessionId - Buscar carrinho por sessão
router.get('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const result = await db.query(`
            SELECT 
                c.*,
                p.nome as produto_nome,
                p.preco,
                p.preco_promocional,
                p.imagem_url,
                p.estoque,
                COALESCE(p.preco_promocional, p.preco) * c.quantidade as subtotal
            FROM carrinho c
            INNER JOIN produtos p ON c.produto_id = p.id
            WHERE c.session_id = $1 AND p.ativo = true
            ORDER BY c.created_at DESC
        `, [sessionId]);
        
        const total = result.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        
        res.json({ 
            success: true, 
            data: result.rows,
            resumo: {
                total_itens: result.rows.length,
                total_produtos: result.rows.reduce((sum, item) => sum + item.quantidade, 0),
                subtotal: total.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Erro ao buscar carrinho:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/carrinho - Adicionar item ao carrinho
router.post('/', async (req, res) => {
    try {
        const { session_id, produto_id, quantidade = 1, personalizacao } = req.body;
        
        if (!session_id || !produto_id) {
            return res.status(400).json({ 
                success: false, 
                error: 'session_id e produto_id são obrigatórios' 
            });
        }
        
        // Verificar se produto existe e tem estoque
        const produtoCheck = await db.query(
            'SELECT estoque FROM produtos WHERE id = $1 AND ativo = true',
            [produto_id]
        );
        
        if (produtoCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Produto não encontrado' });
        }
        
        if (produtoCheck.rows[0].estoque < quantidade) {
            return res.status(400).json({ 
                success: false, 
                error: 'Estoque insuficiente',
                estoque_disponivel: produtoCheck.rows[0].estoque
            });
        }
        
        // Verificar se item já existe no carrinho
        const existente = await db.query(
            'SELECT * FROM carrinho WHERE session_id = $1 AND produto_id = $2',
            [session_id, produto_id]
        );
        
        let result;
        
        if (existente.rows.length > 0) {
            // Atualizar quantidade
            result = await db.query(`
                UPDATE carrinho 
                SET quantidade = quantidade + $1,
                    personalizacao = COALESCE($2, personalizacao)
                WHERE session_id = $3 AND produto_id = $4
                RETURNING *
            `, [quantidade, personalizacao, session_id, produto_id]);
        } else {
            // Inserir novo item
            result = await db.query(`
                INSERT INTO carrinho (session_id, produto_id, quantidade, personalizacao)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `, [session_id, produto_id, quantidade, personalizacao]);
        }
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/carrinho/:id - Atualizar quantidade do item
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantidade } = req.body;
        
        if (!quantidade || quantidade < 1) {
            return res.status(400).json({ 
                success: false, 
                error: 'Quantidade deve ser maior que 0' 
            });
        }
        
        const result = await db.query(`
            UPDATE carrinho 
            SET quantidade = $1
            WHERE id = $2
            RETURNING *
        `, [quantidade, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Item não encontrado' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar carrinho:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/carrinho/:id - Remover item do carrinho
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query('DELETE FROM carrinho WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Item não encontrado' });
        }
        
        res.json({ success: true, message: 'Item removido do carrinho' });
    } catch (error) {
        console.error('Erro ao remover do carrinho:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/carrinho/sessao/:sessionId - Limpar carrinho
router.delete('/sessao/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        await db.query('DELETE FROM carrinho WHERE session_id = $1', [sessionId]);
        
        res.json({ success: true, message: 'Carrinho limpo com sucesso' });
    } catch (error) {
        console.error('Erro ao limpar carrinho:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
