# Guia de Arquitetura do Backend - Plataforma de Rifas

Este documento serve como a planta arquitetural para a construção do backend da plataforma de rifas. Ele foi projetado para garantir segurança, escalabilidade e performance, seguindo as melhores práticas do mercado.

## 1. Stack Tecnológica Recomendada

-   **Linguagem:** Node.js (com Express.js ou NestJS) ou Python (com Django ou Flask).
-   **Banco de Dados:** MongoDB.
-   **Autenticação:** JSON Web Tokens (JWT).

## 2. Variáveis de Ambiente Essenciais (`.env`)

Estas são as chaves secretas que configuram e protegem sua aplicação. Elas **NUNCA** devem ser expostas no código.

```
# Conexão com o Banco de Dados MongoDB Atlas
MONGO_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/<databaseName>?retryWrites=true&w=majority"

# Chave secreta para assinar os tokens de autenticação (mínimo 32 caracteres)
JWT_SECRET="f3a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9"

# Tempo de expiração do token (Ex: 7d para 7 dias, 1h para 1 hora)
JWT_EXPIRES_IN="7d"

# Chave secreta da sua API de Pagamento (Ex: Mercado Pago, Stripe)
PAYMENT_API_SECRET="SUA_CHAVE_SECRETA_DA_API_DE_PAGAMENTO"
```

## 3. Estrutura do Banco de Dados (MongoDB Collections)

### a. `users`

Armazena os dados dos clientes.

-   `_id`: `ObjectId` (Gerado pelo Mongo)
-   `name`: `String`
-   `email`: `String` (Deve ter um **índice único** para evitar duplicatas)
-   `phone`: `String`
-   `password`: `String` (**OBRIGATÓRIO:** Armazenar a senha criptografada usando `bcrypt`)
-   `isAdmin`: `Boolean` (Default: `false`. Usado para acesso ao painel admin)

### b. `raffles`

Armazena as informações de cada rifa.

-   `_id`: `ObjectId`
-   `title`: `String`
-   `pricePerQuota`: `Number`
-   `totalQuotas`: `Number`
-   `isActive`: `Boolean`

### c. `quotas`

A coleção mais importante. Armazena cada número individualmente.

-   `_id`: `ObjectId`
-   `raffleId`: `ObjectId` (Referência à coleção `raffles`)
-   `number`: `String` (Ex: "00001", "99999")
-   `status`: `String` (Valores possíveis: `available`, `reserved`, `sold`)
-   `ownerId`: `ObjectId` (Referência à coleção `users`, preenchido quando `status` é `sold`)

**Índice CRÍTICO para Segurança e Performance:**
Crie um **índice único composto** em `[raffleId, number]`. Isso garante em nível de banco de dados que é impossível vender o mesmo número duas vezes na mesma rifa.

## 4. Especificação dos Endpoints da API

### Middleware de Segurança

#### Middleware de Autenticação (checkAuth)

-   Verifica se o `Authorization` header contém um token JWT válido.
-   Decodifica o token usando `JWT_SECRET`.
-   Anexa os dados do usuário (ex: `req.user`) à requisição para ser usado nos controllers.
-   Rejeita a requisição se o token for inválido ou ausente.

#### Middleware de Admin (checkAdmin)

-   Executa **após** `checkAuth`.
-   Verifica se `req.user.isAdmin` é `true`.
-   Rejeita a requisição se o usuário não for um administrador.

### Autenticação

#### `POST /api/auth/register`

-   **Função:** Cadastra um novo usuário.
-   **Corpo da Requisição (Request Body):** `{ "name": "...", "email": "...", "phone": "...", "password": "..." }`
-   **Lógica:**
    1.  Validar os dados recebidos.
    2.  Verificar se o e-mail já existe na coleção `users`.
    3.  Criptografar a senha com `bcrypt`.
    4.  Salvar o novo usuário no banco com `isAdmin: false`.
-   **Resposta de Sucesso (201 Created):** `{ "message": "Usuário criado com sucesso." }`

#### `POST /api/auth/login`

-   **Função:** Autentica um usuário e retorna um token JWT.
-   **Corpo da Requisição:** `{ "email": "...", "password": "..." }`
-   **Lógica:**
    1.  Encontrar o usuário pelo e-mail.
    2.  Comparar a senha recebida com a senha criptografada no banco usando `bcrypt.compare`.
    3.  Se a senha for válida, gerar um token JWT usando o `JWT_SECRET` e `JWT_EXPIRES_IN`. O payload do token deve conter o `_id` e o `isAdmin` do usuário.
-   **Resposta de Sucesso (200 OK):** `{ "token": "...", "user": { "name": "...", "email": "...", "isAdmin": false } }`

### Pagamento e Compra

#### `POST /api/payment/create-order`

-   **Função:** Cria uma ordem de pagamento e reserva os números.
-   **Rota Protegida:** Requer `checkAuth`.
-   **Corpo da Requisição:** `{ "raffleId": "...", "quantity": 100 }`
-   **Lógica:**
    1.  **USAR TRANSACTIONS (ACID):**
    2.  Encontrar `quantity` números com `status: 'available'` para a `raffleId`.
    3.  Atualizar o `status` desses números para `reserved` e adicionar um `reservationTimestamp`.
    4.  Gerar uma ordem de pagamento com o Gateway de Pagamento (usando `PAYMENT_API_SECRET`).
-   **Resposta de Sucesso (200 OK):** `{ "paymentId": "...", "pixQRCode": "...", "pixCopyPaste": "..." }`

#### `POST /api/payment/webhook`

-   **Função:** Endpoint que o Gateway de Pagamento chama para confirmar um pagamento.
-   **Rota Pública:** Não requer JWT, mas deve ser protegida pela verificação de assinatura do gateway.
-   **Lógica:**
    1.  Receber a notificação do gateway.
    2.  Verificar a autenticidade da notificação.
    3.  Se o pagamento for `approved`:
        a. **USAR TRANSACTIONS (ACID):**
        b. Encontrar os números que estavam `reserved` para esta ordem de pagamento.
        c. Atualizar o `status` deles para `sold` e preencher o `ownerId` com o ID do usuário que comprou.
-   **Resposta de Sucesso (200 OK):** `{ "status": "ok" }`

### Usuário

#### `GET /api/user/my-numbers`

-   **Função:** Retorna todos os números comprados pelo usuário logado.
-   **Rota Protegida:** Requer `checkAuth`.
-   **Lógica:**
    1.  Extrair o `userId` do token JWT (`req.user._id`).
    2.  Buscar na coleção `quotas` todos os documentos onde `ownerId` é igual ao `userId`.
    3.  Agrupar os resultados por compra/data.
-   **Resposta de Sucesso (200 OK):** `[{ "id": "...", "quotas": 50, "numbers": ["..."], "date": "..." }]` (igual ao `Purchase` do frontend)

### Admin

#### `POST /api/admin/swap-quota`

-   **Função:** Troca a propriedade de uma cota específica.
-   **Rota Protegida:** Requer `checkAuth` e `checkAdmin`.
-   **Corpo da Requisição:** `{ "originUserId": "...", "destinationUserId": "...", "raffleId": "...", "quotaNumber": "..." }`
-   **Lógica:**
    1.  **USAR TRANSACTIONS (ACID):**
    2.  Verificar se a cota (`raffleId`, `quotaNumber`) pertence de fato ao `originUserId`.
    3.  Se pertencer, atualizar o campo `ownerId` da cota para o `destinationUserId`.
-   **Resposta de Sucesso (200 OK):** `{ "message": "Troca realizada com sucesso." }`
