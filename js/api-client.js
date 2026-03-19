// Dragon Heart - Cliente da API
// Funções para comunicação com o backend

const API_BASE_URL = 'http://localhost:3000/api';

// Configuração global para fetch
const fetchConfig = {
    headers: {
        'Content-Type': 'application/json'
    }
};

// Utilitário para gerar session_id único
function getSessionId() {
    let sessionId = localStorage.getItem('dh_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('dh_session_id', sessionId);
    }
    return sessionId;
}

// ==================== CATEGORIAS ====================

async function getCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
    }
}

async function getCategoria(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias/${id}`);
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Erro ao buscar categoria:', error);
        return null;
    }
}

// ==================== PRODUTOS ====================

async function getProdutos(filtros = {}) {
    try {
        const params = new URLSearchParams();
        
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        if (filtros.busca) params.append('busca', filtros.busca);
        if (filtros.limite) params.append('limite', filtros.limite);
        if (filtros.pagina) params.append('pagina', filtros.pagina);
        
        const url = `${API_BASE_URL}/produtos${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }
}

async function getProduto(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos/${id}`);
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return null;
    }
}

async function getProdutoBySlug(slug) {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos/slug/${slug}`);
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return null;
    }
}

async function criarProduto(produto) {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos`, {
            method: 'POST',
            ...fetchConfig,
            body: JSON.stringify(produto)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        return { success: false, error: error.message };
    }
}

async function atualizarProduto(id, produto) {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
            method: 'PUT',
            ...fetchConfig,
            body: JSON.stringify(produto)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        return { success: false, error: error.message };
    }
}

// ==================== CARRINHO ====================

async function getCarrinho() {
    try {
        const sessionId = getSessionId();
        const response = await fetch(`${API_BASE_URL}/carrinho/${sessionId}`);
        const data = await response.json();
        return data.success ? data : { data: [], resumo: { total_itens: 0, total_produtos: 0, subtotal: '0.00' } };
    } catch (error) {
        console.error('Erro ao buscar carrinho:', error);
        return { data: [], resumo: { total_itens: 0, total_produtos: 0, subtotal: '0.00' } };
    }
}

async function adicionarAoCarrinho(produto_id, quantidade = 1, personalizacao = null) {
    try {
        const sessionId = getSessionId();
        const response = await fetch(`${API_BASE_URL}/carrinho`, {
            method: 'POST',
            ...fetchConfig,
            body: JSON.stringify({
                session_id: sessionId,
                produto_id,
                quantidade,
                personalizacao
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        return { success: false, error: error.message };
    }
}

async function atualizarItemCarrinho(id, quantidade) {
    try {
        const response = await fetch(`${API_BASE_URL}/carrinho/${id}`, {
            method: 'PUT',
            ...fetchConfig,
            body: JSON.stringify({ quantidade })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao atualizar carrinho:', error);
        return { success: false, error: error.message };
    }
}

async function removerDoCarrinho(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/carrinho/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao remover do carrinho:', error);
        return { success: false, error: error.message };
    }
}

async function limparCarrinho() {
    try {
        const sessionId = getSessionId();
        const response = await fetch(`${API_BASE_URL}/carrinho/sessao/${sessionId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao limpar carrinho:', error);
        return { success: false, error: error.message };
    }
}

// ==================== PEDIDOS ====================

async function criarPedido(pedido) {
    try {
        const sessionId = getSessionId();
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            ...fetchConfig,
            body: JSON.stringify({
                ...pedido,
                session_id: sessionId
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        return { success: false, error: error.message };
    }
}

async function getPedidos(filtros = {}) {
    try {
        const params = new URLSearchParams();
        
        if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id);
        if (filtros.status) params.append('status', filtros.status);
        
        const url = `${API_BASE_URL}/pedidos${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return [];
    }
}

async function getPedido(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${id}`);
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        return null;
    }
}

// ==================== CLIENTES ====================

async function criarCliente(cliente) {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`, {
            method: 'POST',
            ...fetchConfig,
            body: JSON.stringify(cliente)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        return { success: false, error: error.message };
    }
}

async function getCliente(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${id}`);
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        return null;
    }
}

// Exportar para uso global
window.DragonHeartAPI = {
    // Categorias
    getCategorias,
    getCategoria,
    
    // Produtos
    getProdutos,
    getProduto,
    getProdutoBySlug,
    criarProduto,
    atualizarProduto,
    
    // Carrinho
    getCarrinho,
    adicionarAoCarrinho,
    atualizarItemCarrinho,
    removerDoCarrinho,
    limparCarrinho,
    
    // Pedidos
    criarPedido,
    getPedidos,
    getPedido,
    
    // Clientes
    criarCliente,
    getCliente,
    
    // Utilitários
    getSessionId
};
