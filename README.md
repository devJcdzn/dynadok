# Dynadok

API RESTful para gerenciamento de clientes com arquitetura limpa, utilizando TypeScript, MongoDB, Redis e RabbitMQ.

## 🚀 Tecnologias

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [RabbitMQ](https://www.rabbitmq.com/)
- [Docker](https://www.docker.com/)
- [PNPM](https://pnpm.io/)

## 📋 Pré-requisitos

- Node.js 20+
- PNPM 10+
- Docker e Docker Compose
- MongoDB 6+
- Redis 7+
- RabbitMQ 3+

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

4. Configure as seguintes variáveis no arquivo `.env`:
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

- `POST /clients` - Criar um novo cliente
  ```json
  {
    "nome": "string",
    "email": "string",
    "telefone": "string"
  }
  ```

- `GET /clients/:id` - Buscar cliente por ID

- `GET /clients` - Listar todos os clientes

- `PUT /clients/:id` - Atualizar cliente
  ```json
  {
    "nome": "string",
    "email": "string",
    "telefone": "string"
  }
  ```

## 🏗️ Arquitetura

O projeto segue uma arquitetura limpa com as seguintes camadas:

- **Domain**: Entidades e regras de negócio
- **Application**: Casos de uso e serviços
- **Infrastructure**: Implementações concretas (MongoDB, Redis, RabbitMQ)
- **Interfaces**: Controllers e rotas
- **Shared**: Código compartilhado entre camadas

## 🧪 Testes

Execute os testes unitários:
```bash
pnpm test
```

## 📦 Estrutura do Projeto

```
src/
├── app/              # Casos de uso e serviços
├── domain/           # Entidades e regras de negócio
├── infra/           # Implementações de infraestrutura
├── interfaces/      # Controllers e rotas
└── shared/          # Código compartilhado
```

## 🔄 Eventos

O sistema utiliza RabbitMQ para processamento de eventos:

- `client.created`: Disparado quando um cliente é criado
- `client.updated`: Disparado quando um cliente é atualizado
- `client.deleted`: Disparado quando um cliente é removido

## 💾 Cache

O sistema utiliza Redis para cache com as seguintes chaves:

- `client:{id}`: Cache de cliente individual (TTL: 5 minutos)
- `clients:all`: Cache da lista de clientes (TTL: 5 minutos)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 TODO

- [ ] Implementar Error Handling centralizado
- [ ] Adicionar validação de entrada com Zod
- [ ] Adicionar rate limiting(opicional para escalabilidade);
- [ ] Adicionar documentação Swagger/OpenAPI(opicional para manutenibilidade)
- [ ] Configurar CI/CD
- [x] Adicionar testes de integração

