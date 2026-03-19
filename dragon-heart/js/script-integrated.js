// Dragon Heart - JavaScript Integrado com API Backend

const API_BASE_URL = 'http://localhost:3000/api';
let cart = [];
let produtos = [];
let categorias = [];

// ==================== UTILITÁRIOS ====================

function getSessionId() {
    let sessionId = localStorage.getItem('dh_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('dh_session_id', sessionId);
    }
    return sessionId;
}

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), duration);
    }
}

// ==================== API CALLS ====================

async function carregarProdutos(filtros = {}) {
    try {
        const params = new URLSearchParams();
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        if (filtros.busca) params.append('busca', filtros.busca);
        
        const url = `${API_BASE_URL}/produtos${params.toString() ? '?' + params : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            produtos = data.data;
            renderizarProdutos(produtos);
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showToast('❌ Erro ao carregar produtos');
    }
}

async function carregarCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`);
        const data = await response.json();
        
        if (data.success) {
            categorias = data.data;
            renderizarCategorias(categorias);
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

async function adicionarAoCarrinho(produto_id, quantidade = 1) {
    try {
        const sessionId = getSessionId();
        const response = await fetch(`${API_BASE_URL}/carrinho`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, produto_id, quantidade })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await atualizarCarrinho();
            const produto = produtos.find(p => p.id === produto_id);
            showToast(`✅ ${produto?.nome || 'Produto'} adicionado ao carrinho!`);
            return true;
        } else {
            showToast(`❌ ${data.error || 'Erro ao adicionar'}`);
            return false;
        }
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        showToast('❌ Erro ao adicionar ao carrinho');
        return false;
    }
}

async function atualizarCarrinho() {
    try {
        const sessionId = getSessionId();
        const response = await fetch(`${API_BASE_URL}/carrinho/${sessionId}`);
        const data = await response.json();
        
        if (data.success) {
            cart = data.data;
            updateCartCount(data.resumo.total_produtos);
        }
    } catch (error) {
        console.error('Erro ao atualizar carrinho:', error);
    }
}

function updateCartCount(count) {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
}

// ==================== RENDERIZAÇÃO ====================

function renderizarProdutos(produtos) {
    const container = document.querySelector('#produtos .grid');
    if (!container) return;
    
    container.innerHTML = produtos.map(produto => {
        const preco = produto.preco_promocional || produto.preco;
        const precoFormatado = parseFloat(preco).toFixed(2).replace('.', ',');
        let imagemPrincipal = produto.imagens?.find(img => img.principal)?.url || produto.imagem_url || 'assets/images/placeholder.jpg';
        
        // Se a imagem começa com /uploads, adicionar URL do backend
        if (imagemPrincipal && imagemPrincipal.startsWith('/uploads')) {
            imagemPrincipal = `http://localhost:3000${imagemPrincipal}`;
        } else if (imagemPrincipal && !imagemPrincipal.startsWith('http') && !imagemPrincipal.startsWith('assets/')) {
            imagemPrincipal = `assets/images/${imagemPrincipal}`;
        }
        
        return `
            <div class="group bg-gradient-dh border border-dh-magenta/20 rounded-2xl overflow-hidden hover-lift hover:border-dh-magenta/50 hover:shadow-glow-magenta" data-produto-id="${produto.id}">
                <div class="aspect-square bg-gradient-to-br from-dh-purple/20 to-dh-magenta/20 flex items-center justify-center relative overflow-hidden">
                    <img src="${imagemPrincipal}" alt="${produto.nome}" class="w-full h-full object-cover">
                    ${produto.badge ? `<div class="absolute top-4 right-4 px-3 py-1 bg-dh-${produto.badge === 'NOVO' ? 'magenta' : produto.badge === 'TOP' ? 'gold text-dh-darker' : 'purple'} rounded-full text-xs font-bold">${produto.badge}</div>` : ''}
                </div>
                <div class="p-6">
                    <h3 class="font-display text-xl font-bold mb-2">${produto.nome}</h3>
                    ${produto.descricao ? `<p class="text-gray-400 text-sm mb-4">${produto.descricao}</p>` : ''}
                    <div class="flex items-center justify-between">
                        <span class="text-2xl font-bold text-dh-gold">R$ ${precoFormatado}</span>
                        <button class="btn-comprar px-4 py-2 bg-gradient-to-r from-dh-magenta to-dh-purple rounded-lg text-sm font-semibold hover:shadow-glow-magenta transition-all">
                            Comprar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Adicionar event listeners aos botões de compra
    container.querySelectorAll('.btn-comprar').forEach(button => {
        button.addEventListener('click', handleBuyButtonAPI);
    });
}

function renderizarCategorias(categorias) {
    const container = document.querySelector('#categorias .grid');
    if (!container) return;
    
    const cores = { 'magenta': 'magenta', 'gold': 'gold', 'purple': 'purple', 'pink': 'pink' };
    
    // Mapeamento de ícones SVG por slug de categoria
    const iconesMap = {
        'cadernos-agendas': '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>',
        'adesivos': '<svg class="w-8 h-8 text-dh-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>',
        'canecas-copos': '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>',
        'itens-especiais': '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>'
    };
    
    container.innerHTML = categorias.map((cat, index) => {
        const cor = cores[cat.cor] || 'magenta';
        const icone = iconesMap[cat.slug] || iconesMap['itens-especiais'];
        
        return `
            <div class="group bg-gradient-dh border border-dh-${cor}/20 rounded-2xl p-6 hover-lift hover:border-dh-${cor}/50 hover:shadow-glow-${cor} cursor-pointer" data-categoria-slug="${cat.slug}">
                <div class="w-16 h-16 bg-gradient-to-br from-dh-${cor} to-dh-purple rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    ${icone}
                </div>
                <h3 class="font-display text-xl font-bold mb-2 text-white">${cat.nome}</h3>
                <p class="text-gray-400 text-sm">${cat.descricao}</p>
                <p class="text-dh-${cor} text-xs mt-2">${cat.total_produtos || 0} produtos</p>
            </div>
        `;
    }).join('');
    
    // Event listeners para categorias
    container.querySelectorAll('[data-categoria-slug]').forEach(card => {
        card.addEventListener('click', handleCategoryClickAPI);
    });
}

// ==================== EVENT HANDLERS ====================

async function handleBuyButtonAPI(event) {
    const button = event.target;
    const card = button.closest('[data-produto-id]');
    if (!card) return;
    
    const produtoId = parseInt(card.dataset.produtoId);
    
    button.classList.add('btn-loading');
    button.disabled = true;
    
    const sucesso = await adicionarAoCarrinho(produtoId, 1);
    
    button.classList.remove('btn-loading');
    button.disabled = false;
}

async function handleCategoryClickAPI(event) {
    const card = event.currentTarget;
    const slug = card.dataset.categoriaSlug;
    
    showToast(`🎯 Carregando ${card.querySelector('h3').textContent}...`);
    await carregarProdutos({ categoria: slug });
    
    document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
}

function handleCTAButton(event) {
    const button = event.target;
    const buttonText = button.textContent.trim();
    
    button.classList.add('btn-loading');
    button.disabled = true;
    
    setTimeout(() => {
        if (buttonText.includes('Ver Produtos') || buttonText.includes('Começar Agora')) {
            showToast('🎨 Redirecionando para catálogo...');
            setTimeout(() => {
                document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        } else if (buttonText.includes('Personalizar') || buttonText.includes('Especialista')) {
            showToast('💬 Abrindo chat de atendimento...');
            setTimeout(() => {
                window.open('https://wa.me/5512992495483?text=Vim%20atrav%C3%A9s%20do%20site%2C%20gostaria%20de%20maiores%20informa%C3%A7%C3%B5es', '_blank');
            }, 1000);
        } else if (buttonText.includes('Catálogo')) {
            showToast('📚 Abrindo catálogo completo...');
            setTimeout(() => {
                document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        } else if (buttonText.includes('Ver Todos')) {
            carregarProdutos();
        }
        
        button.classList.remove('btn-loading');
        button.disabled = false;
    }, 800);
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
    }
}

function handleNavClick(event) {
    const href = event.target.getAttribute('href');
    
    if (href && href.startsWith('#')) {
        event.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            closeMobileMenu();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// ==================== INICIALIZAÇÃO ====================

function addDOMElements() {
    if (!document.getElementById('toast')) {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    if (!document.getElementById('mobile-menu')) {
        const nav = document.querySelector('nav');
        if (nav) {
            const mobileMenu = document.createElement('div');
            mobileMenu.id = 'mobile-menu';
            mobileMenu.className = 'mobile-menu';
            mobileMenu.innerHTML = `
                <a href="#produtos">Produtos</a>
                <a href="#sobre">Sobre</a>
                <a href="#categorias">Categorias</a>
                <a href="#contato">Contato</a>
                <button class="btn-primary w-full mt-4">Catálogo</button>
            `;
            nav.parentNode.insertBefore(mobileMenu, nav.nextSibling);
        }
    }
    
    const catalogButton = document.querySelector('nav button');
    if (catalogButton && !document.getElementById('cart-count')) {
        catalogButton.style.position = 'relative';
        const cartCount = document.createElement('span');
        cartCount.id = 'cart-count';
        cartCount.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #FF1493;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
        `;
        cartCount.textContent = '0';
        catalogButton.appendChild(cartCount);
    }
}

function initializeEventListeners() {
    const allButtons = document.querySelectorAll('button');
    
    allButtons.forEach(button => {
        const buttonText = button.textContent.trim();
        
        if (buttonText === 'Comprar') {
            // Já tratado na renderização
        } else if (
            buttonText.includes('Ver Produtos') || 
            buttonText.includes('Personalizar') || 
            buttonText.includes('Catálogo') ||
            buttonText.includes('Começar') ||
            buttonText.includes('Especialista') ||
            buttonText.includes('Ver Todos')
        ) {
            button.addEventListener('click', handleCTAButton);
        }
    });
    
    const mobileMenuButton = document.querySelector('button.md\\:hidden');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
    
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🐉 Dragon Heart - Sistema iniciado (Integrado com API)');
    
    addDOMElements();
    initializeEventListeners();
    
    // Carregar dados da API
    await carregarCategorias();
    await carregarProdutos();
    await atualizarCarrinho();
    
    console.log('%c🐉 Dragon Heart', 'color: #FF1493; font-size: 20px; font-weight: bold;');
    console.log('%cOnde hobby e criatividade completam sua vida', 'color: #C930AE; font-size: 12px;');
    console.log('%c✅ Conectado à API Backend', 'color: #00FF00; font-size: 12px;');
});

// Exportar funções para uso global
window.DragonHeart = {
    carregarProdutos,
    carregarCategorias,
    adicionarAoCarrinho,
    atualizarCarrinho,
    cart,
    produtos,
    categorias
};
