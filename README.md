# Dog Explorer — Fullstack (Projeto 2)

Aplicação fullstack distribuída: SPA React no front-end e arquitetura de microsserviços no back-end (auth, resource e notification), com fila de mensagens (Redis Pub/Sub) e notificações em tempo real via WebSocket.

A temática e a estrutura do front-end são as mesmas do Projeto 1 (consulta de raças de cachorros).

## Estrutura

```
dog-explorer-fullstack-p2/
├── auth-service/          # Login, JWT, usuários
│   ├── package.json
│   └── src/
│       ├── routes/        # Rota /auth/login e /auth/logout
│       ├── models/        # Model User (Mongoose)
│       └── config/        # Conexão MongoDB e Redis
├── resource-service/      # CRUD dos registros + publica eventos na fila
│   ├── package.json
│   └── src/
│       ├── routes/        # Rotas /dogs (GET, POST, PUT, DELETE)
│       ├── models/        # Model Dog (Mongoose)
│       └── config/        # Conexão MongoDB e Redis
├── notification-service/  # WebSocket + consome eventos da fila
│   ├── package.json
│   └── src/
│       ├── routes/        # Health-check HTTP
│       ├── models/        # Consumidor da fila Redis Pub/Sub
│       └── config/        # Conexão Redis (subscriber dedicado)
├── frontend/              # SPA React (mesma estrutura do Projeto 1)
├── nginx/                 # Proxy reverso (roteamento por path)
├── docker-compose.yml
└── README.md
```

## Dependências externas

- Node.js 22+
- MongoDB
- Redis

## Como executar com Docker (recomendado)

### Pré-requisitos

- Docker e Docker Compose instalados

### 1. Criar o arquivo de variáveis de ambiente

Na raiz do projeto, crie um arquivo `.env`:

```env
MONGO_URI_AUTH=mongodb://mongo:27017/auth-db
MONGO_URI_RESOURCE=mongodb://mongo:27017/resource-db
REDIS_URL=redis://redis:6379
JWT_SECRET=segredo_jwt_super_secreto
CORS_ORIGIN=http://localhost

VITE_AUTH_URL=http://localhost
VITE_API_URL=http://localhost/api
VITE_WS_URL=ws://localhost/ws
```

### 2. Subir todos os serviços

```bash
docker compose up -d --build
```

Isso inicia: MongoDB, Redis, auth-service (porta 3001), resource-service (porta 3002), notification-service (porta 3003), frontend e nginx (porta 80).

### 3. Criar usuário de teste

```bash
docker compose exec auth-service node -e "
import('bcryptjs').then(m => m.default.hash('senha123', 10)).then(hash => {
  import('./src/config/db.js').then(({ connectDB }) => connectDB()).then(() => {
    import('./src/models/User.js').then(({ default: User }) =>
      User.create({ username: 'admin', password: hash })
    ).then(() => { console.log('Usuário criado'); process.exit(0); });
  });
});
"
```

Ou via mongosh:

```bash
# 1. Gerar o hash (executar fora do container)
node -e "import('bcryptjs').then(m => m.default.hash('senha123', 10).then(console.log))"

# 2. Inserir no banco (substituir HASH pelo valor gerado)
docker compose exec mongo mongosh auth-db --eval \
  'db.users.insertOne({ username: "admin", password: "HASH" })'
```

### 4. Acessar

Abra `http://localhost` no navegador e faça login com `admin` / `senha123`.

---

## Como executar localmente (sem Docker)

### Pré-requisitos

- Node.js 22+
- MongoDB rodando em `localhost:27017`
- Redis rodando em `localhost:6379`

### 1. auth-service

```bash
cd auth-service
cp .env.example .env   # ou crie o .env manualmente
npm install
node src/server.js
# Porta padrão: 3001
```

`.env` mínimo:
```env
MONGO_URI=mongodb://localhost:27017/auth-db
REDIS_URL=redis://localhost:6379
JWT_SECRET=segredo_jwt_super_secreto
PORT=3001
```

### 2. resource-service

```bash
cd resource-service
npm install
node src/server.js
# Porta padrão: 3002
```

`.env` mínimo:
```env
MONGO_URI=mongodb://localhost:27017/resource-db
REDIS_URL=redis://localhost:6379
JWT_SECRET=segredo_jwt_super_secreto
AUTH_SERVICE_URL=http://localhost:3001
PORT=3002
```

### 3. notification-service

```bash
cd notification-service
npm install
node src/server.js
# Porta padrão: 3003
```

`.env` mínimo:
```env
REDIS_URL=redis://localhost:6379
PORT=3003
```

### 4. frontend

```bash
cd frontend
npm install
npm run dev
# Porta padrão: 5173
```

`.env` mínimo:
```env
VITE_AUTH_URL=http://localhost:3001
VITE_API_URL=http://localhost:3002
VITE_WS_URL=ws://localhost:3003
```

---

## Fluxo de comunicação

```
Browser → nginx (80)
  /auth/*  → auth-service (3001)   Login e logout JWT
  /api/*   → resource-service (3002)  CRUD com autenticação
  /ws      → notification-service (3003)  WebSocket tempo real
  /        → frontend (React SPA)

resource-service → Redis Pub/Sub (dog-events) → notification-service → WebSocket → Browser
```

### Validação de token entre serviços

A cada requisição autenticada, o **resource-service consulta o auth-service** em
`POST /auth/verify` (que confere a assinatura do JWT e a lista de revogação no Redis).
Se o auth-service estiver indisponível, o resource-service **degrada para validação
local** com o segredo compartilhado e registra o incidente no log — tratamento de erro
explícito entre serviços.

### Segurança / HTTPS

Senhas são armazenadas com **bcrypt (hash + salt)**. Em produção, o tráfego é servido
sob **HTTPS** pelo Cloudflare Tunnel à frente do Nginx (terminação TLS na borda); no
ambiente local de demonstração os serviços respondem em HTTP via `http://localhost`.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | React, Vite, Context API, useReducer |
| Auth | Express, JWT (jsonwebtoken), bcryptjs |
| Resource | Express, Mongoose (MongoDB), Redis cache |
| Notification | Express, ws (WebSocket), Redis Pub/Sub |
| Banco de dados | MongoDB (auth-db e resource-db separados) |
| Fila | Redis Pub/Sub (canal `dog-events`) |
| Proxy | Nginx (roteamento por path) |
| Deploy | Docker Compose |
