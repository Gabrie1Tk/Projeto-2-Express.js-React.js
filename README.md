# CineSearch — Projeto 2

**Disciplina:** Programação Web Fullstack  
**Professor:** Anderson Paulo Avila Santos  
**Integrantes:** Gabriel Takao & Luiz Gustavo

---

## Visão Geral

O CineSearch é uma aplicação fullstack distribuída com SPA React no front-end e arquitetura de microsserviços no back-end. Permite buscar, inserir, atualizar e excluir séries e shows de TV, com notificações em tempo real via WebSocket.

---

## Tecnologias Utilizadas

| Componente | Tecnologia |
|---|---|
| Frontend | React.js + Vite |
| auth-service | Express.js + MySQL |
| resource-service | Express.js + MongoDB + Mongoose |
| notification-service | Express.js + WebSocket |
| Fila de mensagens | Redis Pub/Sub |
| Banco (auth) | MySQL 8.0 |
| Banco (resource) | MongoDB |
| Segurança | HTTPS + bcrypt + express-validator + helmet |
| Performance | compression + morgan + Redis cache + pool de conexões |

---

## Estrutura de Pastas

```
Projeto-2-Express.js-React.js/
├── auth-service/
│   ├── package.json
│   ├── certs/              ← cert.pem e key.pem
│   └── src/
│       ├── server.js
│       ├── config/         (db.js, jwt.js)
│       ├── models/         (User.js)
│       └── routes/         (auth.js)
│
├── resource-service/
│   ├── package.json
│   ├── certs/              ← cert.pem e key.pem
│   └── src/
│       ├── server.js
│       ├── config/         (db.js, redis.js)
│       ├── models/         (Show.js)
│       └── routes/         (shows.js)
│
├── notification-service/
│   ├── package.json
│   ├── certs/              ← cert.pem e key.pem
│   └── src/
│       ├── server.js
│       ├── config/         (redis.js)
│       ├── models/         (consumer.js)
│       └── routes/         (health.js)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── contexts/       (AuthContext, SearchContext, WebSocketContext)
│       └── components/     (Login, Header, SearchBar, ShowCard, ShowForm, ConfirmModal, ResultsList)
│
├── certs-base/             ← certificados originais gerados pelo gerar-certs.sh
│   ├── cert.pem
│   └── key.pem
│
├── Dockerfile.seed
├── gerar-certs.sh
├── README.md
└── seed.js
```

---

## Pré-requisitos

- Node.js 18+
- Docker Desktop (MongoDB e Redis rodam em containers)
- MySQL 8.0 instalado localmente

---

## Passo a Passo para Rodar o Projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/Gabrie1Tk/Projeto-2-Express.js-React.js.git
cd Projeto-2-Express.js-React.js
```

---

### 2. Subir a infraestrutura via Docker

Na raiz do projeto execute:

docker-compose up -d --build

Isso sobe automaticamente:
- MySQL 8.0 com banco e usuários já criados
- MongoDB com ~970 shows populados automaticamente
- Redis

Verificar se estão rodando:

docker ps


---

### 4. Configurar as variáveis de ambiente

Crie um arquivo `.env` em cada serviço:

**`auth-service/.env`**
```
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=auth_db
JWT_SECRET=cinesearch_secret_2024
JWT_EXPIRES_IN=8h
```

**`resource-service/.env`**
```
PORT=3002
MONGO_URI=mongodb://localhost:27017/resource_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=cinesearch_secret_2024
```

**`notification-service/.env`**
```
PORT=3003
REDIS_URL=redis://localhost:6379
```

> O `JWT_SECRET` deve ser **idêntico** no auth-service e no resource-service.

---

### 5. Instalar dependências

```bash
cd auth-service && npm install

cd ../resource-service && npm install

cd ../notification-service && npm install

cd ../frontend && npm install
```

---

### 6. Aceitar os certificados HTTPS no navegador

Os serviços rodam em HTTPS com certificado autoassinado. Abra cada URL abaixo no navegador e clique em **Avançado → Continuar para localhost**:

```
https://localhost:3001/health
https://localhost:3002/health
https://localhost:3003/health
```

> ⚠️ Este passo é obrigatório antes de usar o sistema. Repita em cada navegador que for usar.

---

### 7. Subir os serviços

Abra um terminal separado para cada serviço:

```bash
# Terminal 1 — auth-service
cd auth-service
node src/server.js
```

```bash
# Terminal 2 — resource-service
cd resource-service
node src/server.js
```

```bash
# Terminal 3 — notification-service
cd notification-service
node src/server.js
```

```bash
# Terminal 4 — frontend
cd frontend
npm run dev
```

---

## URLs da Aplicação

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| auth-service | https://localhost:3001/health |
| resource-service | https://localhost:3002/health |
| notification-service | https://localhost:3003/health |

---

## Credenciais de Teste

| Usuário | Email | Senha |
|---|---|---|
| Gabriel Takao | gabriel@email.com | password |
| Luiz Gustavo | luiz@email.com | password |

---

## Funcionalidades (RF1 a RF6)

### RF1 — Login
- Autenticação por email e senha via auth-service
- Validação e sanitização com express-validator
- Retorna token JWT com expiração configurável
- Rate limiting — máximo 10 tentativas por 15 minutos
- Logout invalida o token na blacklist do MySQL

### RF2 — Busca
- Busca séries por nome no resource-service
- Cache Redis de 30 segundos para buscas repetidas
- Botão "Ver todos" lista todo o catálogo

### RF3 — Inserção
- Formulário com nome, gêneros, status, estreia, nota, imagem e descrição
- Validação e sanitização de todos os campos no servidor
- Registro vinculado ao usuário autenticado (campo `owner`)
- Publica evento `show.criado` no Redis

### RF4 — Atualização (PUT)
- Formulário preenchido com os dados atuais do show
- Verificação de proprietário no servidor — HTTP 403 se não for dono
- Publica evento `show.atualizado` no Redis

### RF5 — Exclusão (DELETE)
- Modal de confirmação antes de excluir
- Verificação de proprietário no servidor — HTTP 403 se não for dono
- Publica evento `show.excluido` no Redis

### RF6 — Notificações em Tempo Real
- Frontend conecta ao notification-service via WebSocket após login
- Eventos do Redis são retransmitidos para todos os clientes conectados
- Lista atualiza automaticamente sem recarregar a página

---

## Demonstração em Tempo Real (dois navegadores)

1. Abra dois navegadores lado a lado (ex: Chrome e Edge)
2. Aceite os certificados HTTPS nos dois navegadores (passo 6)
3. Faça login nos dois navegadores
4. Em um navegador insira, edite ou exclua uma série
5. O outro navegador atualiza a lista automaticamente sem recarregar

---

## Segurança Implementada

| Requisito | Como |
|---|---|
| Senhas com hash | bcryptjs no auth-service |
| HTTPS | Certificado autoassinado em todos os serviços |
| Tokens JWT | Expiração + blacklist no logout |
| Rate limiting | 10 tentativas de login / 15 minutos |
| Sanitização de inputs | express-validator no auth-service e resource-service |
| Controle de acesso | Verificação de `owner` em Update e Delete (HTTP 403) |
| Headers seguros | helmet em todos os serviços |
| Logs | morgan em todos os serviços |

---

## Performance Implementada

| Requisito | Como |
|---|---|
| Compressão HTTP | middleware compression em todos os serviços |
| Compressão frontend | vite-plugin-compression no build |
| Cache de buscas | Redis com TTL de 30 segundos no resource-service |
| Pool de conexões MySQL | mysql2 pool no auth-service |
| Pool de conexões MongoDB | Mongoose gerencia automaticamente |

---

## Arquitetura de Microsserviços

```
Frontend (React)
    │
    ├── HTTPS → auth-service:3001    → MySQL (usuários + blacklist)
    │
    ├── HTTPS → resource-service:3002 → MongoDB (shows)
    │               │
    │               └── Redis Pub/Sub → notification-service:3003
    │                                         │
    └── WSS ──────────────────────────────────┘
         (WebSocket para notificações em tempo real)
```

Cada serviço tem:
- Porta própria
- Banco de dados próprio
- `package.json` próprio
- Inicialização independente