# 🐉 Dragon Heart Backend API

Backend completo em Node.js + Express + PostgreSQL para o e-commerce Dragon Heart.

## 📋 Pré-requisitos

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **DBeaver** (já instalado) para gerenciar o banco

## 🚀 Instalação

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados no DBeaver

#### Passo 1: Criar Conexão no DBeaver
1. Abra o **DBeaver**
2. Clique em **Nova Conexão** (ícone de plug)
3. Selecione **PostgreSQL**
4. Configure:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `postgres` (padrão)
   - **Username**: `postgres`
   - **Password**: sua senha do PostgreSQL
5. Teste a conexão e clique em **Finish**

#### Passo 2: Criar Database Dragon Heart
1. No DBeaver, clique com botão direito em **Databases**
2. Selecione **Create New Database**
3. Nome: `dragon_heart`
4. Clique em **OK**

#### Passo 3: Executar Schema (Criar Tabelas)
1. Abra o arquivo `database/schema.sql` no DBeaver
2. Certifique-se que está conectado ao database `dragon_heart`
3. Clique em **Execute SQL Script** (ou pressione Ctrl+Alt+X)
4. Aguarde a mensagem de sucesso

#### Passo 4: Inserir Dados Iniciais (Seed)
1. Abra o arquivo `database/seed.sql` no DBeaver
2. Execute o script (Ctrl+Alt+X)
3. Verifique se as categorias e produtos foram inseridos

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dragon_heart
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_AQUI

PORT=3000
NODE_ENV=development
```

### 4. Iniciar Servidor

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Ou modo produção
npm start
```

O servidor estará rodando em: **http://localhost:3000**

## 📚 Endpoints da API

### Categorias
- `GET /api/categorias` - Listar todas
- `GET /api/categorias/:id` - Buscar por ID
- `GET /api/categorias/slug/:slug` - Buscar por slug

### Produtos
- `GET /api/produtos` - Listar todos (com filtros)
  - Query params: `?categoria=slug&busca=termo&limite=10&pagina=1`
- `GET /api/produtos/:id` - Buscar por ID
- `GET /api/produtos/slug/:slug` - Buscar por slug
- `POST /api/produtos` - Criar produto (admin)
- `PUT /api/produtos/:id` - Atualizar produto (admin)
- `DELETE /api/produtos/:id` - Deletar produto (soft delete)

### Carrinho
- `GET /api/carrinho/:sessionId` - Buscar carrinho
- `POST /api/carrinho` - Adicionar item
- `PUT /api/carrinho/:id` - Atualizar quantidade
- `DELETE /api/carrinho/:id` - Remover item
- `DELETE /api/carrinho/sessao/:sessionId` - Limpar carrinho

### Pedidos
- `GET /api/pedidos` - Listar pedidos
  - Query params: `?cliente_id=1&status=pendente`
- `GET /api/pedidos/:id` - Buscar pedido completo
- `POST /api/pedidos` - Criar pedido
- `PUT /api/pedidos/:id/status` - Atualizar status

### Clientes
- `GET /api/clientes/:id` - Buscar cliente
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `GET /api/clientes/:id/enderecos` - Listar endereços
- `POST /api/clientes/:id/enderecos` - Adicionar endereço

## 🧪 Testar API

### Usando o navegador
Acesse: http://localhost:3000

### Usando curl

```bash
# Listar categorias
curl http://localhost:3000/api/categorias

# Listar produtos
curl http://localhost:3000/api/produtos

# Buscar produto específico
curl http://localhost:3000/api/produtos/1

# Adicionar ao carrinho
curl -X POST http://localhost:3000/api/carrinho \
  -H "Content-Type: application/json" \
  -d '{"session_id":"teste123","produto_id":1,"quantidade":2}'
```

### Usando Postman/Insomnia
Importe a coleção de endpoints ou teste manualmente cada rota.

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- **categorias** - Categorias de produtos
- **produtos** - Catálogo de produtos
- **produto_imagens** - Múltiplas imagens por produto
- **clientes** - Cadastro de clientes
- **enderecos** - Endereços de entrega
- **carrinho** - Carrinho temporário
- **pedidos** - Pedidos realizados
- **pedido_itens** - Itens de cada pedido

### Relacionamentos
```
categorias (1) ──→ (N) produtos
produtos (1) ──→ (N) produto_imagens
produtos (1) ──→ (N) carrinho
produtos (1) ──→ (N) pedido_itens
clientes (1) ──→ (N) enderecos
clientes (1) ──→ (N) pedidos
clientes (1) ──→ (N) carrinho
pedidos (1) ──→ (N) pedido_itens
```

## 🔧 Scripts Disponíveis

```bash
npm start          # Iniciar servidor
npm run dev        # Modo desenvolvimento (nodemon)
npm run db:setup   # Criar tabelas (futuro)
npm run db:seed    # Inserir dados iniciais (futuro)
```

## 🐛 Troubleshooting

### Erro: "connect ECONNREFUSED"
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão no DBeaver

### Erro: "relation does not exist"
- Execute o `schema.sql` no DBeaver
- Verifique se está conectado ao database correto (`dragon_heart`)

### Erro: "port 3000 already in use"
- Mude a porta no `.env`: `PORT=3001`
- Ou mate o processo: `npx kill-port 3000`

## 📝 Próximos Passos

1. ✅ Integrar frontend com a API
2. ⬜ Implementar autenticação JWT
3. ⬜ Upload de imagens (Multer)
4. ⬜ Integração com gateway de pagamento
5. ⬜ Sistema de cupons de desconto
6. ⬜ Cálculo de frete (Correios API)
7. ⬜ Painel administrativo

## 📞 Suporte

WhatsApp: 12 99249-5483  
Mensagem: "Vim através do site, gostaria de maiores informações"

---

**Dragon Heart** - Onde hobby e criatividade completam sua vida 💜✨
