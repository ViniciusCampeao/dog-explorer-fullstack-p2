# Dog Explorer — Fullstack (Projeto 2)

Aplicação fullstack distribuída: SPA React no front-end e arquitetura de
microsserviços no back-end (auth, resource e notification), com fila de
mensagens (Redis Pub/Sub) e notificações em tempo real via WebSocket.

A temática e a estrutura do front-end são as mesmas do Projeto 1
(consulta de raças de cachorros).

## Estrutura

```txt
dog-explorer-fullStack/
├── auth-service/          # Login, JWT, usuários
├── resource-service/      # CRUD dos registros + publica eventos na fila
├── notification-service/  # WebSocket + consome eventos da fila
├── frontend/              # SPA React (mesma estrutura do Projeto 1)
└── README.md
```

## Dependências externas

- Node.js
- MongoDB
- Redis

## Como executar

Instruções de execução de cada serviço serão adicionadas conforme o
desenvolvimento avança.
# dog-explorer-fullstack-p2
