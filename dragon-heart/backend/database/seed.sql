-- Dragon Heart E-commerce - Dados Iniciais (Seed)
-- Execute após criar o schema

-- Inserir Categorias
INSERT INTO categorias (nome, descricao, icone, cor, slug) VALUES
('Cadernos & Agendas', 'Personalizados com seus personagens favoritos', 'book', 'magenta', 'cadernos-agendas'),
('Adesivos', 'Designs exclusivos para decorar tudo', 'tag', 'gold', 'adesivos'),
('Canecas & Copos', 'Seu café com estilo geek', 'cube', 'purple', 'canecas-copos'),
('Itens Especiais', 'Produtos únicos e colecionáveis', 'star', 'pink', 'itens-especiais');

-- Inserir Produtos
INSERT INTO produtos (nome, descricao, preco, preco_promocional, categoria_id, imagem_url, badge, estoque, slug) VALUES
-- Cadernos
('FunkoPOP Vecna', 'Colecionável exclusivo da série Stranger Things', 45.90, NULL, 4, 'aa.png', 'NOVO', 15, 'funkopop-vecna'),
('Caderno Anime Edition', 'Capa dura personalizada, 200 páginas', 45.90, 39.90, 1, 'caderno-anime.jpg', 'NOVO', 50, 'caderno-anime-edition'),
('Agenda Gamer 2024', 'Planejamento anual para gamers', 52.90, NULL, 1, 'agenda-gamer.jpg', NULL, 30, 'agenda-gamer-2024'),
('Caderno RPG Master', 'Ideal para mestres de RPG, 250 páginas', 48.90, NULL, 1, 'caderno-rpg.jpg', 'EXCLUSIVO', 20, 'caderno-rpg-master'),

-- Adesivos
('Pack Adesivos RPG', '50 adesivos temáticos de RPG', 29.90, NULL, 2, 'adesivos-rpg.jpg', 'TOP', 100, 'pack-adesivos-rpg'),
('Adesivos Anime Mix', '30 adesivos de animes populares', 24.90, 19.90, 2, 'adesivos-anime.jpg', NULL, 80, 'adesivos-anime-mix'),
('Stickers Gamer', 'Pack com 40 adesivos de games', 27.90, NULL, 2, 'stickers-gamer.jpg', 'NOVO', 60, 'stickers-gamer'),

-- Canecas
('Caneca Gamer RGB', 'Design exclusivo, 350ml', 39.90, NULL, 3, 'caneca-gamer.jpg', 'EXCLUSIVO', 25, 'caneca-gamer-rgb'),
('Caneca Pixel Art', 'Estilo retrô 8-bit, 300ml', 35.90, NULL, 3, 'caneca-pixel.jpg', NULL, 40, 'caneca-pixel-art'),
('Copo Térmico Geek', 'Mantém temperatura por 6h, 500ml', 49.90, 44.90, 3, 'copo-termico.jpg', 'TOP', 15, 'copo-termico-geek'),

-- Itens Especiais
('Mousepad XXL Dragon', 'Mousepad gigante 90x40cm', 89.90, NULL, 4, 'mousepad-xxl.jpg', 'EXCLUSIVO', 10, 'mousepad-xxl-dragon'),
('Poster Metalizado', 'Poster premium 60x40cm', 34.90, NULL, 4, 'poster-metal.jpg', NULL, 35, 'poster-metalizado'),
('Kit Papelaria Completo', 'Caderno + Adesivos + Caneta', 79.90, 69.90, 4, 'kit-papelaria.jpg', 'TOP', 20, 'kit-papelaria-completo');

-- Inserir múltiplas imagens para alguns produtos
INSERT INTO produto_imagens (produto_id, url, ordem, principal) VALUES
(1, 'aa.png', 1, true),
(2, 'caderno-anime-1.jpg', 1, true),
(2, 'caderno-anime-2.jpg', 2, false),
(2, 'caderno-anime-3.jpg', 3, false),
(5, 'adesivos-rpg-1.jpg', 1, true),
(5, 'adesivos-rpg-2.jpg', 2, false);

-- Inserir cliente de teste (senha: teste123)
INSERT INTO clientes (nome, email, telefone, cpf, senha_hash) VALUES
('Cliente Teste', 'teste@dragonheart.com', '12992495483', '123.456.789-00', '$2b$10$rKvVXqQxQxQxQxQxQxQxQeO7Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8');

-- Inserir endereço de teste
INSERT INTO enderecos (cliente_id, cep, logradouro, numero, complemento, bairro, cidade, estado, principal) VALUES
(1, '12345-678', 'Rua dos Geeks', '123', 'Apto 42', 'Centro', 'São José dos Campos', 'SP', true);

-- Verificar dados inseridos
SELECT 'Categorias inseridas:' as info, COUNT(*) as total FROM categorias;
SELECT 'Produtos inseridos:' as info, COUNT(*) as total FROM produtos;
SELECT 'Clientes inseridos:' as info, COUNT(*) as total FROM clientes;
