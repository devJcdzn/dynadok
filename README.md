# Dynadok - Teste Técnico

API RESTful para gerenciamento de clientes desenvolvida para teste técnico da Dynadok.

## 🚀 Tecnologias

* [Node.js](https://nodejs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [Express](https://expressjs.com/)
* [MongoDB](https://www.mongodb.com/)
* [Redis](https://redis.io/)
* [RabbitMQ](https://www.rabbitmq.com/)
* [Docker](https://www.docker.com/)
* [PNPM](https://pnpm.io/)
* [GitHub Actions](https://github.com/features/actions) (CI/CD)

## 📋 Pré-requisitos

* Node.js 20+
* PNPM 10+
* Docker e Docker Compose
* MongoDB 6+
* Redis 7+
* RabbitMQ 3+

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/dynadok.git
cd dynadok
```

2. Instale as dependências:

```bash
pnpm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

4. Ajuste as variáveis no arquivo `.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/clients
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost
```

## 🚀 Executando o projeto

### Usando Docker Compose (Recomendado)

```bash
docker-compose up -d
```

### Desenvolvimento Local

1. Inicie os serviços necessários (MongoDB, Redis, RabbitMQ):

```bash
docker-compose up -d mongodb redis rabbitmq
```

2. Execute o projeto em modo desenvolvimento:

```bash
pnpm dev
```

## 📚 Documentação da API

### Endpoints

#### Clientes

* `POST /clients` - Criar um novo cliente

```json
{
  "nome": "string",
  "email": "string",
  "telefone": "string"
}
```

* `GET /clients/:id` - Buscar cliente por ID

* `GET /clients` - Listar todos os clientes

* `PUT /clients/:id` - Atualizar cliente

```json
{
  "nome": "string",
  "email": "string",
  "telefone": "string"
}
```

## 🏗️ Arquitetura

O projeto segue arquitetura limpa com camadas claras:

* **Domain**: Entidades e regras de negócio
* **Application**: Casos de uso e serviços
* **Infrastructure**: Implementações concretas (MongoDB, Redis, RabbitMQ)
* **Interfaces**: Controllers e rotas
* **Shared**: Código compartilhado

## 🔄 Eventos

O sistema utiliza RabbitMQ para processamento de eventos:

* `client.created`: Disparado quando um cliente é criado
* `client.updated`: Disparado quando um cliente é atualizado
* `client.deleted`: Disparado quando um cliente é removido

## 💾 Cache

O sistema utiliza Redis para cache com as seguintes chaves:

* `client:{id}`: Cache de cliente individual (TTL: 5 minutos)
* `clients:all`: Cache da lista de clientes (TTL: 5 minutos)

## 🧪 Testes

Execute os testes unitários e de integração com:

```bash
pnpm test
```

Os testes são executados também no pipeline CI configurado via GitHub Actions, incluindo conexão real com MongoDB, Redis e RabbitMQ.

## 🔄 CI/CD

O projeto está mockado para integração contínua e entrega contínua usando GitHub Actions com:

* **Build e testes automáticos** em cada push e pull request na branch `main`
* **Build da imagem Docker** após testes aprovados
* **Push da imagem Docker** para Docker Hub
* **Deploy automatizado** via SSH para servidor remoto (configuração genérica, sem servidor definido)

Exemplo simplificado do workflow:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-test:
    runs-on: ubuntu-latest

    services:
      mongo:
        image: mongo:6
      redis:
        image: redis:7
      rabbitmq:
        image: rabbitmq:3-management

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: node-version: 20
      - run: npm ci
      - run: npm run test
        env:
          MONGO_URL: mongodb://localhost:27017/clients
          REDIS_URL: redis://localhost:6379
          RABBITMQ_URL: amqp://localhost
      - run: npm run build

  docker-build-push:
    needs: build-test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - name: Login Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - run: docker build -t yourusername/app-name:latest .
      - run: docker push yourusername/app-name:latest

  deploy:
    needs: docker-build-push
    runs-on: ubuntu-latest

    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v0.1.7
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            docker pull yourusername/app-name:latest
            docker stop app-container || true
            docker rm app-container || true
            docker run -d --name app-container -p 3000:3000 yourusername/app-name:latest
```

## 📝 TODO

* [x] Implementar Error Handling centralizado
* [ ] Adicionar rate limiting (opcional para escalabilidade)
* [ ] Adicionar documentação Swagger/OpenAPI (opcional para manutenibilidade)
* [x] Configurar CI/CD básico com testes, build e deploy
* [x] Adicionar testes de integração
