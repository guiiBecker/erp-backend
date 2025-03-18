# ERP Backend

Sistema de backend para ERP com autenticação baseada em tokens JWT.

## Funcionalidades Implementadas

### Autenticação

- **Login de usuário**: Endpoint para login com username e password
- **Sistema de Tokens JWT**: Geração de tokens JWT para sessões autenticadas
- **Armazenamento de Tokens**: Persistência dos tokens no banco de dados vinculados a usuários
- **Guarda Global**: Proteção automática de todas as rotas não marcadas como públicas

### Gerenciamento de Tokens

- **Validação de Tokens**: Verificação de tokens via header Authorization
- **Expiração de Tokens**: Tokens com validade de 30 dias
- **Limpeza de Tokens**: Remoção automática de tokens expirados
- **Revogação de Tokens**: Possibilidade de revogar tokens específicos ou de um usuário

### Endpoints Disponíveis

#### Autenticação

- `POST /auth/login`: Login de usuário (público)
  - Corpo: `{ "username": "...", "password": "..." }`
  - Retorno: `{ "access_token": "..." }`

#### Gerenciamento de Tokens

- `GET /auth/tokens/verify`: Verificação de token
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: `{ "valid": true|false, "message": "..." }`

- `GET /auth/tokens/user-info`: Obtenção de informações do usuário a partir do token
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: Informações do usuário (id, username, name)

- `GET /auth/tokens`: Listagem de tokens do usuário (autenticado)
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: Lista de tokens ativos

- `DELETE /auth/tokens`: Remoção de todos os tokens do usuário (autenticado)
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: Confirmação de remoção

- `DELETE /auth/tokens/expired`: Remoção de tokens expirados (autenticado)
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: Quantidade de tokens removidos

- `DELETE /auth/tokens/:id`: Remoção de um token específico (autenticado)
  - Header: `Authorization: Bearer seu-token-aqui`
  - Corpo: `{ "id": "token-id" }`
  - Retorno: Confirmação de remoção

## Estrutura do Projeto

- `src/auth`: Módulo de autenticação
  - `controllers`: Controladores de autenticação
  - `guards`: Guardas de autenticação (JwtAuthGuard, LocalAuthGuard)
  - `models`: Interfaces e DTOs
  - `strategies`: Estratégias Passport.js (JWT, Local)

- `src/token`: Módulo de gerenciamento de tokens
  - `controllers`: API para gerenciamento de tokens
  - `guards`: Guardas específicos para verificação de tokens
  - `models`: Interfaces e DTOs
  - `middleware`: Middleware para verificação de tokens

- `src/user`: Módulo de usuários
  - `entities`: Entidade User
  - `dto`: DTOs para criação e atualização de usuários

## Segurança

- Senhas armazenadas com hash usando bcrypt
- Tokens JWT assinados com chave secreta
- Tokens podem ser revogados individualmente
- Validação dupla: JWT válido + registro no banco

## Próximos Passos

- [ ] Implementar refresh tokens para renovação de sessões
- [ ] Adicionar controle de dispositivos conectados
- [ ] Criar sistema de permissões e roles
- [ ] Adicionar limite de tentativas de login
- [ ] Adicionar testes automatizados
- [ ] Implementar rate limiting para proteção contra ataques

## Como Executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente no arquivo `.env`
4. Execute as migrações do Prisma: `npx prisma migrate dev`
5. Inicie o servidor: `npm run start:dev`

## Tecnologias Utilizadas

- NestJS: Framework Node.js para backend
- Prisma: ORM para acesso ao banco de dados
- PostgreSQL: Banco de dados relacional
- Passport.js: Biblioteca de autenticação
- JWT: Tokens para autenticação stateless
- Bcrypt: Hashing de senhas
