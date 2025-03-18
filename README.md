# ERP Backend

Sistema de backend para ERP com autenticação baseada em tokens JWT, especializado no gerenciamento de pedidos para uma empresa de uniformes.

## Visão Geral

Este sistema foi desenvolvido para gerenciar toda a operação de uma empresa de uniformes, permitindo:

- Gerenciamento de clientes e seus pedidos
- Controle de estoque de materiais e produtos acabados
- Acompanhamento da produção em suas diferentes etapas
- Gestão de entregas e faturamento

A autenticação robusta com tokens JWT garante que apenas usuários autorizados possam acessar as funcionalidades do sistema de acordo com seus níveis de permissão.

## Funcionalidades Implementadas

### Autenticação

- **Login de usuário**: Endpoint para login com username e password
- **Sistema de Tokens JWT**: Geração de tokens JWT para sessões autenticadas
- **Armazenamento de Tokens**: Persistência dos tokens no banco de dados vinculados a usuários
- **Guarda Global**: Proteção automática de todas as rotas não marcadas como públicas
- **Refresh Tokens**: Sistema de renovação de tokens de acesso sem necessidade de autenticação repetida
- **Sistema de Permissões**: Controle de acesso baseado em roles (ROOT, ADMIN, EMPLOYEE)

### Gerenciamento de Tokens

- **Validação de Tokens**: Verificação de tokens via header Authorization
- **Expiração de Tokens**: Tokens de acesso com validade curta (15 minutos) e refresh tokens de longa duração (7 dias)
- **Limpeza de Tokens**: Remoção automática de tokens expirados
- **Revogação de Tokens**: Possibilidade de revogar tokens específicos ou de um usuário
- **Uso único de Refresh Tokens**: Refresh tokens são revogados após uso, aumentando a segurança

### Controle de Acesso

- **Role ROOT**: Acesso completo ao sistema, incluindo gerenciamento de roles
- **Role ADMIN**: Acesso a todas as funcionalidades exceto gerenciamento de roles
- **Role EMPLOYEE**: Acesso restrito ao módulo de pedidos

### Módulo de Pedidos

- **Criação de Pedidos**: Endpoint para cadastro de novos pedidos
- **Consulta de Pedidos**: Listagem e busca por ID
- **Atualização de Pedidos**: Modificação de dados e status
- **Remoção de Pedidos**: Exclusão de pedidos (apenas ROOT e ADMIN)

### Endpoints Disponíveis

#### Autenticação

- `POST /auth/login`: Login de usuário (público)
  - Corpo: `{ "username": "...", "password": "..." }`
  - Retorno: `{ "access_token": "...", "refresh_token": "..." }`

- `POST /auth/refresh`: Renovação de token (público)
  - Corpo: `{ "refresh_token": "..." }`
  - Retorno: `{ "access_token": "...", "refresh_token": "..." }`

#### Gerenciamento de Tokens

- `GET /auth/tokens/verify`: Verificação de token
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: `{ "valid": true|false, "message": "..." }`

- `GET /auth/tokens/user-info`: Obtenção de informações do usuário a partir do token
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: Informações do usuário (id, username, name, role)

- `GET /auth/tokens`: Listagem de tokens do usuário (autenticado)
  - Acesso: Todos os usuários autenticados
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: Lista de tokens ativos

- `DELETE /auth/tokens`: Remoção de todos os tokens do usuário (autenticado)
  - Acesso: Todos os usuários autenticados
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: Confirmação de remoção

- `DELETE /auth/tokens/expired`: Remoção de tokens expirados (autenticado)
  - Acesso: ROOT e ADMIN
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: Quantidade de tokens removidos

#### Usuários

- `GET /users`: Listagem de usuários
  - Acesso: ROOT e ADMIN
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: Lista de usuários

- `POST /users`: Criação de usuário
  - Acesso: ROOT e ADMIN
  - Header: `Authorization: Bearer seu-token-aqui`
  - Corpo: Dados do usuário
  - Retorno: Usuário criado

- `PATCH /users/:id/role`: Alteração de role de usuário
  - Acesso: Apenas ROOT
  - Header: `Authorization: Bearer seu-token-aqui`
  - Corpo: `{ "role": "ROOT" | "ADMIN" | "EMPLOYEE" }`
  - Retorno: Usuário atualizado

#### Pedidos

- `GET /orders`: Listagem de pedidos
  - Acesso: Todos os usuários autenticados
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: Lista de pedidos

- `POST /orders`: Criação de pedido
  - Acesso: Todos os usuários autenticados
  - Header: `Authorization: Bearer seu-token-aqui`
  - Corpo: Dados do pedido
  - Retorno: Pedido criado

- `DELETE /orders/:id`: Remoção de pedido
  - Acesso: ROOT e ADMIN
  - Header: `Authorization: Bearer seu-token-aqui`
  - Retorno: Confirmação de remoção

## Estrutura do Projeto

- `src/auth`: Módulo de autenticação
  - `controllers`: Controladores de autenticação
  - `guards`: Guardas de autenticação (JwtAuthGuard, RolesGuard)
  - `models`: Interfaces e DTOs
  - `strategies`: Estratégias Passport.js (JWT, Local)
  - `services`: Serviços especializados (RefreshTokenService)
  - `decorators`: Decoradores para controle de acesso (@Roles, @IsPublic)
  - `enums`: Enumerações (Role)

- `src/token`: Módulo de gerenciamento de tokens
  - `controllers`: API para gerenciamento de tokens
  - `guards`: Guardas específicos para verificação de tokens
  - `models`: Interfaces e DTOs
  - `middleware`: Middleware para verificação de tokens

- `src/user`: Módulo de usuários
  - `entities`: Entidade User
  - `dto`: DTOs para criação e atualização de usuários
  - `controllers`: Gerenciamento de usuários
  - `services`: Lógica de negócio para usuários

- `src/orders`: Módulo de pedidos
  - `controllers`: API para gerenciamento de pedidos
  - `services`: Lógica de negócio para pedidos
  - `dto`: DTOs para criação e atualização de pedidos
  - `interfaces`: Definição de tipos e interfaces para pedidos

## Segurança

- Senhas armazenadas com hash usando bcrypt
- Tokens JWT assinados com chave secreta
- Tokens podem ser revogados individualmente
- Validação dupla: JWT válido + registro no banco
- Sistema de refresh tokens com uso único
- Tokens de acesso com curta duração (15 minutos)
- Refresh tokens com validade de 7 dias, revogados após uso
- Controle de acesso baseado em roles (ROOT, ADMIN, EMPLOYEE)
- Proteção contra acesso não autorizado a endpoints específicos

## Próximos Passos

### Autenticação e Segurança
- [x] Implementar refresh tokens para renovação de sessões
- [x] Criar sistema de permissões e roles
- [ ] Adicionar limite de tentativas de login
- [ ] Adicionar testes automatizados
- [ ] Implementar rate limiting para proteção contra ataques

### Sistema de Pedidos de Uniformes
- [ ] Implementar módulo de clientes (cadastro, consulta, atualização)
- [ ] Criar módulo de produtos/uniformes com variações (tamanhos, cores, modelos)
- [x] Desenvolver sistema básico de pedidos com status de acompanhamento
- [ ] Implementar controle de estoque de matéria-prima
- [ ] Criar fluxo de produção com etapas (corte, costura, acabamento, etc.)
- [ ] Desenvolver sistema de orçamentos com aprovação do cliente
- [ ] Implementar controle de entregas e logística
- [ ] Criar relatórios de produção, vendas e faturamento
- [ ] Desenvolver dashboard para acompanhamento em tempo real
- [ ] Implementar sistema de notificações para clientes e equipe

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
