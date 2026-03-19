// Rotas de Pedidos
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/pedidos - Listar pedidos (com filtros)
router.get('/', async (req, res) => {
    try {
        const { cliente_id, status, limite = 50, pagina = 1 } = req.query;
        
        let query = `
            SELECT 
                p.*,
                c.nome as cliente_nome,
                c.email as cliente_email,
                COUNT(pi.id) as total_itens
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (cliente_id) {
            query += ` AND p.cliente_id = $${paramCount}`;
            params.push(cliente_id);
            paramCount++;
        }
        
        if (status) {
            query += ` AND p.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        
        query += ` GROUP BY p.id, c.nome, c.email ORDER BY p.created_at DESC`;
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
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/pedidos/:id - Buscar pedido por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Buscar pedido
        const pedidoResult = await db.query(`
            SELECT 
                p.*,
                c.nome as cliente_nome,
                c.email as cliente_email,
                c.telefone as cliente_telefone,
                e.cep, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.estado
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            LEFT JOIN enderecos e ON p.endereco_id = e.id
            WHERE p.id = $1
        `, [id]);
        
        if (pedidoResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
        }
        
        // Buscar itens do pedido
        const itensResult = await db.query(`
            SELECT * FROM pedido_itens WHERE pedido_id = $1 ORDER BY id
        `, [id]);
        
        const pedido = pedidoResult.rows[0];
        pedido.itens = itensResult.rows;
        
        res.json({ success: true, data: pedido });
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/pedidos - Criar novo pedido
router.post('/', async (req, res) => {
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        const { cliente_id, endereco_id, itens, observacoes } = req.body;
        
        if (!itens || itens.length === 0) {
            throw new Error('Pedido deve conter ao menos um item');
        }
        
        // Calcular totais
        let subtotal = 0;
        const itensValidados = [];
        
        for (const item of itens) {
            const produtoResult = await client.query(
                'SELECT * FROM produtos WHERE id = $1 AND ativo = true',
                [item.produto_id]
            );
            
            if (produtoResult.rows.length === 0) {
                throw new Error(`Produto ${item.produto_id} não encontrado`);
            }
            
            const produto = produtoResult.rows[0];
            
            if (produto.estoque < item.quantidade) {
                throw new Error(`Estoque insuficiente para ${produto.nome}`);
            }
            
            const preco = produto.preco_promocional || produto.preco;
            const itemSubtotal = preco * item.quantidade;
            subtotal += itemSubtotal;
            
            itensValidados.push({
                produto_id: produto.id,
                produto_nome: produto.nome,
                produto_preco: preco,
                quantidade: item.quantidade,
                subtotal: itemSubtotal,
                personalizacao: item.personalizacao || null
            });
            
            // Atualizar estoque
            await client.query(
                'UPDATE produtos SET estoque = estoque - $1 WHERE id = $2',
                [item.quantidade, produto.id]
            );
        }
        
        const desconto = 0; // Implementar lógica de cupons futuramente
        const frete = 0; // Implementar cálculo de frete futuramente
        const total = subtotal - desconto + frete;
        
        // Criar pedido
        const pedidoResult = await client.query(`
            INSERT INTO pedidos (cliente_id, endereco_id, subtotal, desconto, frete, total, observacoes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [cliente_id, endereco_id, subtotal, desconto, frete, total, observacoes]);
        
        const pedido = pedidoResult.rows[0];
        
        // Inserir itens do pedido
        for (const item of itensValidados) {
            await client.query(`
                INSERT INTO pedido_itens (pedido_id, produto_id, produto_nome, produto_preco, quantidade, subtotal, personalizacao)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [pedido.id, item.produto_id, item.produto_nome, item.produto_preco, item.quantidade, item.subtotal, item.personalizacao]);
        }
        
        // Limpar carrinho se houver session_id
        if (req.body.session_id) {
            await client.query('DELETE FROM carrinho WHERE session_id = $1', [req.body.session_id]);
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({ 
            success: true, 
            data: pedido,
            message: 'Pedido criado com sucesso'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

// PUT /api/pedidos/:id/status - Atualizar status do pedido
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const statusValidos = ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'];
        
        if (!statusValidos.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Status inválido',
                status_validos: statusValidos
            });
        }
        
        const result = await db.query(`
            UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *
        `, [status, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
