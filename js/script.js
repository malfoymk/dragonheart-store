// Dragon Heart - JavaScript Funcional

// Configuração do carrinho
let cart = [];

// Função para mostrar toast notification
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
}

// Função para adicionar produto ao carrinho
function addToCart(productName, price) {
    const product = {
        id: Date.now(),
        name: productName,
        price: price,
        quantity: 1
    };
    
    cart.push(product);
    updateCartCount();
    showToast(`✅ ${productName} adicionado ao carrinho!`);
    
    // Salvar no localStorage
    localStorage.setItem('dragonHeartCart', JSON.stringify(cart));
}

// Função para atualizar contador do carrinho
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Função para lidar com botões de compra
function handleBuyButton(event) {
    const button = event.target;
    const card = button.closest('.product-card') || button.closest('[class*="group"]');
    
    if (!card) return;
    
    // Extrair informações do produto
    const productName = card.querySelector('h3')?.textContent || 'Produto';
    const priceText = card.querySelector('[class*="text-2xl"]')?.textContent || 'R$ 0,00';
    const price = parseFloat(priceText.replace('R$', '').replace(',', '.').trim());
    
    // Adicionar loading state
    button.classList.add('btn-loading');
    button.disabled = true;
    
    // Simular processamento
    setTimeout(() => {
        addToCart(productName, price);
        button.classList.remove('btn-loading');
        button.disabled = false;
    }, 500);
}

// Função para lidar com botões CTA principais
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
            showToast('🔍 Carregando todos os produtos...');
        }
        
        button.classList.remove('btn-loading');
        button.disabled = false;
    }, 800);
}

// Função para lidar com cliques em categorias
function handleCategoryClick(event) {
    const card = event.currentTarget;
    const categoryName = card.querySelector('h3')?.textContent || 'Categoria';
    
    showToast(`🎯 Explorando: ${categoryName}`);
    
    // Adicionar efeito visual
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = '';
    }, 200);
    
    // Rolar para produtos
    setTimeout(() => {
        document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
}

// Função para toggle do menu mobile
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// Função para fechar menu mobile ao clicar em link
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
    }
}

// Função para smooth scroll nos links de navegação
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

// Função para animação de scroll reveal
function revealOnScroll() {
    const reveals = document.querySelectorAll('[data-reveal]');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('revealed');
        }
    });
}

// Função para carregar carrinho do localStorage
function loadCart() {
    const savedCart = localStorage.getItem('dragonHeartCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartCount();
        } catch (e) {
            console.error('Erro ao carregar carrinho:', e);
            cart = [];
        }
    }
}

// Função para inicializar todos os event listeners
function initializeEventListeners() {
    // Selecionar TODOS os botões da página
    const allButtons = document.querySelectorAll('button');
    
    allButtons.forEach(button => {
        const buttonText = button.textContent.trim();
        
        // Botões de compra de produtos
        if (buttonText === 'Comprar') {
            button.addEventListener('click', handleBuyButton);
            console.log('✅ Botão Comprar registrado:', buttonText);
        } 
        // Botões CTA principais
        else if (
            buttonText.includes('Ver Produtos') || 
            buttonText.includes('Personalizar') || 
            buttonText.includes('Catálogo') ||
            buttonText.includes('Começar') ||
            buttonText.includes('Especialista') ||
            buttonText.includes('Ver Todos')
        ) {
            button.addEventListener('click', handleCTAButton);
            console.log('✅ Botão CTA registrado:', buttonText);
        }
    });
    
    // Cards de categoria
    const categoryCards = document.querySelectorAll('.category-card, [class*="group"][class*="cursor-pointer"]');
    categoryCards.forEach(card => {
        // Evitar duplicar listener em cards de produto
        if (!card.querySelector('button')) {
            card.addEventListener('click', handleCategoryClick);
        }
    });
    
    // Menu mobile toggle
    const mobileMenuButton = document.querySelector('button.md\\:hidden');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
    
    // Links de navegação
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // Scroll reveal
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Executar uma vez no carregamento
}

// Função para adicionar elementos necessários ao DOM
function addDOMElements() {
    // Adicionar toast notification se não existir
    if (!document.getElementById('toast')) {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Adicionar menu mobile se não existir
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
    
    // Adicionar contador de carrinho se não existir
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

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐉 Dragon Heart - Sistema iniciado');
    
    // Adicionar elementos necessários
    addDOMElements();
    
    // Carregar carrinho salvo
    loadCart();
    
    // Inicializar event listeners
    initializeEventListeners();
    
    // Log de boas-vindas
    console.log('%c🐉 Dragon Heart', 'color: #FF1493; font-size: 20px; font-weight: bold;');
    console.log('%cOnde hobby e criatividade completam sua vida', 'color: #FFD700; font-size: 12px;');
});

// Exportar funções para uso global (se necessário)
window.DragonHeart = {
    addToCart,
    showToast,
    cart,
    updateCartCount
};
