/**
 * Dragon Heart Backend API
 * Node.js + Express + PostgreSQL
 * 
 * @author Patrick Lopes
 * @description API REST completa para e-commerce Dragon Heart
 */

// Dragon Heart Backend API
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Importar rotas
const categoriasRoutes = require('./routes/categorias');
const produtosRoutes = require('./routes/produtos');
const carrinhoRoutes = require('./routes/carrinho');
const pedidosRoutes = require('./routes/pedidos');
const clientesRoutes = require('./routes/clientes');
const uploadRoutes = require('./routes/upload');

// Usar rotas
app.use('/api/categorias', categoriasRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/carrinho', carrinhoRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/upload', uploadRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        message: '🐉 Dragon Heart API',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            categorias: '/api/categorias',
            produtos: '/api/produtos',
            carrinho: '/api/carrinho',
            pedidos: '/api/pedidos',
            clientes: '/api/clientes'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware de erro
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err.stack);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🐉 Dragon Heart API rodando em http://localhost:${PORT}`);
    console.log(`📚 Documentação: http://localhost:${PORT}/`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
