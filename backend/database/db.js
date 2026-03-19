// Configuração da conexão com PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

// Criar pool de conexões
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'dragon_heart',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20, // Máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Testar conexão
pool.on('connect', () => {
    console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Erro no PostgreSQL:', err);
    process.exit(-1);
});

// Função helper para queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('📊 Query executada', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('❌ Erro na query:', error);
        throw error;
    }
};

// Função para transações
const getClient = async () => {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);
    
    // Adicionar timeout para evitar deadlocks
    const timeout = setTimeout(() => {
        console.error('⚠️ Cliente do pool não foi liberado após 5 segundos');
    }, 5000);
    
    client.release = () => {
        clearTimeout(timeout);
        return release();
    };
    
    return client;
};

module.exports = {
    query,
    pool,
    getClient
};
