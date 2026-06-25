# CineSearch — Projeto 2

**Disciplina:** Programação Web Fullstack  
**Professor:** Anderson Paulo Avila Santos  
**Integrantes:** Gabriel Takao & Luiz Gustavo

---

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- MySQL 8+ instalado localmente (porta 3306)

---

## 1. Subir MongoDB e Redis via Docker

Na raiz do projeto, execute:

```bash
docker run -d --name mongo  -p 27017:27017 mongo:7
docker run -d --name redis  -p 6379:6379  redis:7
```

Para verificar se estão rodando:

```bash
docker ps
```

---

## 2. Configurar o banco MySQL

Acesse o MySQL e crie o banco e as tabelas:

```sql
CREATE DATABASE auth_db;
USE auth_db;

CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE token_blacklist (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  token      TEXT NOT NULL,
  revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Insira os usuários de teste (senhas já com hash bcrypt de `password`):

```sql
INSERT INTO users (name, email, password) VALUES
('Gabriel Takao', 'gabriel@email.com', '$2a$10$7QzV1KqZ1nXsE9Yk3L6tCuWqF8mN2pRjT0dHgBvIoS4xYeU5wAcOm'),
('Luiz Gustavo',  'luiz@email.com',    '$2a$10$7QzV1KqZ1nXsE9Yk3L6tCuWqF8mN2pRjT0dHgBvIoS4xYeU5wAcOm');
```

> **Atenção:** use os hashes que já estão cadastrados no seu banco — não substitua os valores acima se o banco já foi populado.

---

## 3. Variáveis de ambiente

Cada serviço possui um arquivo `.env` na sua raiz. Verifique se estão configurados:

**auth-service/.env**
```
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=auth_db
JWT_SECRET=seu_segredo_jwt
JWT_EXPIRES_IN=8h
```

**resource-service/.env**
```
PORT=3002
MONGO_URI=mongodb://localhost:27017/cinesearch
REDIS_URL=redis://localhost:6379
JWT_SECRET=seu_segredo_jwt
```

**notification-service/.env**
```
PORT=3003
REDIS_URL=redis://localhost:6379
```

> O `JWT_SECRET` deve ser **idêntico** no auth-service e no resource-service.

---

## 4. Instalar dependências

Execute em cada pasta de serviço:

```bash
# auth-service
cd auth-service
npm install
npm install compression morgan express-validator

# resource-service
cd ../resource-service
npm install
npm install compression morgan express-validator

# notification-service
cd ../notification-service
npm install
npm install compression morgan

# frontend
cd ../frontend
npm install
npm install vite-plugin-compression
```

---

## 5. Subir os serviços

Abra um terminal para cada serviço:

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

## 6. Acessar a aplicação

| Serviço              | URL                         |
|----------------------|-----------------------------|
| Frontend             | http://localhost:5173        |
| auth-service         | http://localhost:3001/health |
| resource-service     | http://localhost:3002/health |
| notification-service | http://localhost:3003/health |

---

## 7. Credenciais de teste

| Usuário       | Email                 | Senha    |
|---------------|-----------------------|----------|
| Gabriel Takao | gabriel@email.com     | password |
| Luiz Gustavo  | luiz@email.com        | password |

---

## 8. Demonstração do CRUD com notificação em tempo real

1. Abra dois navegadores (ex: Chrome e Firefox) em http://localhost:5173
2. Faça login em ambos (pode ser o mesmo usuário ou usuários diferentes)
3. Em um navegador, insira, edite ou exclua uma série
4. O outro navegador deve atualizar a lista automaticamente sem recarregar a página

---

## Estrutura de pastas

```
projeto/
├── auth-service/
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── server.js
│       ├── config/     (db.js, jwt.js)
│       ├── models/     (User.js)
│       └── routes/     (auth.js)
│
├── resource-service/
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── server.js
│       ├── config/     (db.js, redis.js)
│       ├── models/     (Show.js)
│       └── routes/     (shows.js)
│
├── notification-service/
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── server.js
│       ├── config/     (redis.js)
│       ├── models/     (consumer.js)
│       └── routes/     (health.js)
│
├── frontend/
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── contexts/   (AuthContext, WebSocketContext, SearchContext)
│       └── components/ (Login, Header, SearchBar, ShowCard, ShowForm, ConfirmModal, ResultsList)
│
└── README.md
```
