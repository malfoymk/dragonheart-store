// Rotas de Clientes
const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcrypt');

// GET /api/clientes/:id - Buscar cliente por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(`
            SELECT id, nome, email, telefone, cpf, created_at, updated_at
            FROM clientes 
            WHERE id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/clientes - Criar novo cliente
router.post('/', async (req, res) => {
    try {
        const { nome, email, telefone, cpf, senha } = req.body;
        
        if (!nome || !email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nome e email são obrigatórios' 
            });
        }
        
        // Verificar se email já existe
        const emailCheck = await db.query('SELECT id FROM clientes WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email já cadastrado' 
            });
        }
        
        // Hash da senha se fornecida
        let senhaHash = null;
        if (senha) {
            senhaHash = await bcrypt.hash(senha, 10);
        }
        
        const result = await db.query(`
            INSERT INTO clientes (nome, email, telefone, cpf, senha_hash)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, nome, email, telefone, cpf, created_at
        `, [nome, email, telefone, cpf, senhaHash]);
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, cpf } = req.body;
        
        const result = await db.query(`
            UPDATE clientes 
            SET nome = COALESCE($1, nome),
                email = COALESCE($2, email),
                telefone = COALESCE($3, telefone),
                cpf = COALESCE($4, cpf)
            WHERE id = $5
            RETURNING id, nome, email, telefone, cpf, updated_at
        `, [nome, email, telefone, cpf, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/clientes/:id/enderecos - Buscar endereços do cliente
router.get('/:id/enderecos', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(`
            SELECT * FROM enderecos WHERE cliente_id = $1 ORDER BY principal DESC, created_at DESC
        `, [id]);
        
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Erro ao buscar endereços:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/clientes/:id/enderecos - Adicionar endereço
router.post('/:id/enderecos', async (req, res) => {
    try {
        const { id } = req.params;
        const { cep, logradouro, numero, complemento, bairro, cidade, estado, principal } = req.body;
        
        if (!cep || !logradouro || !numero || !bairro || !cidade || !estado) {
            return res.status(400).json({ 
                success: false, 
                error: 'Campos obrigatórios: cep, logradouro, numero, bairro, cidade, estado' 
            });
        }
        
        // Se for principal, desmarcar outros endereços
        if (principal) {
            await db.query('UPDATE enderecos SET principal = false WHERE cliente_id = $1', [id]);
        }
        
        const result = await db.query(`
            INSERT INTO enderecos (cliente_id, cep, logradouro, numero, complemento, bairro, cidade, estado, principal)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [id, cep, logradouro, numero, complemento, bairro, cidade, estado, principal || false]);
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Erro ao adicionar endereço:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
