# API de Gerenciamento de Reservas de Quadras

Esta API foi desenvolvida para gerenciar reservas de quadras esportivas, permitindo o cadastro e autenticação de usuários, gerenciamento de quadras, reservas e bloqueio de horários. A aplicação foi construída utilizando Node.js, Express e Prisma, seguindo uma arquitetura modular com separação clara entre Controllers, Services e Middlewares.

## Funcionalidades

-   **Cadastro e Gerenciamento de Usuários:**
    -   Criação de usuários com e-mails institucionais (@ifnmg.edu.br e @aluno.ifnmg.edu.br).
    -   Consulta de dados do usuário autenticado e de usuários específicos.
-   **Autenticação e Segurança:**
    -   Login com geração de token JWT.
    -   Refresh token para renovação de sessão.
    -   Recuperação e redefinição de senha via e-mail utilizando Nodemailer.
    -   Middleware de autenticação e autorização (acesso restrito para administradores).
-   **Gerenciamento de Quadras:**
    -   Criação, listagem, atualização e exclusão de quadras (operações restritas a administradores).
-   **Reservas:**
    -   Criação de reservas com validações de data e horário.
    -   Limitação de até 3 reservas por semana para cada usuário.
    -   Cancelamento e alteração de status (aprovado, rejeitado ou cancelado).
    -   Consulta de reservas por usuário e por quadra.
-   **Bloqueio de Horários:**
    -   Definição de horários bloqueados para impedir reservas em determinados períodos.
    -   Listagem e remoção de bloqueios.
-   **Documentação Interativa:**
    -   Documentação completa e interativa via Swagger, disponível em `/api/docs`.

## Tecnologias Utilizadas

-   **Node.js & Express:** Estrutura do servidor e definição de rotas.
-   **Prisma:** ORM para interação com o banco de dados.
-   **JWT (JSON Web Tokens):** Controle de autenticação e autorização.
-   **bcrypt:** Criptografia de senhas.
-   **Nodemailer:** Envio de e-mails para recuperação de senha.
-   **date-fns:** Manipulação e validação de datas.
-   **dotenv:** Gerenciamento de variáveis de ambiente.
-   **Swagger:** Documentação interativa da API.

## Estrutura do Projeto

```markdown
├── config.js # Configurações e variáveis de ambiente
├── index.js # Ponto de entrada da aplicação
├── prismaClient.js # Configuração do cliente Prisma para o banco de dados
├── routes.js # Definição das rotas da API
├── middleware.js # Middlewares de autenticação e autorização
├── controllers/ # Controladores das funcionalidades da API
│   ├── authController.js
│   ├── bookingController.js
│   ├── blockedTimeController.js
│   ├── courtController.js
│   └── userController.js
├── services/ # Lógica de negócio servicos e acesso ao banco de dados
│   ├── authService.js
│   ├── bookingService.js
│   ├── blockedTimeService.js
│   ├── courtService.js
│   └── userService.js
└── swagger.json # Configuração do Swagger para a documentação da API
```

## Instalação

1.  **Clone o repositório:**

    ```bash
    git clone <URL-do-repositório>
    cd <nome-do-repositório>
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**

    Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (ajuste conforme necessário):

    ```env
    PORT=3030
    DATABASE_URL="<sua_url_do_banco_de_dados>"
    JWT_SECRET="seu_segredo_super_secreto"
    REFRESH_TOKEN_SECRET="seu_segredo_super_secreto_para_refresh_token"
    ACCESS_TOKEN_SECRET="seu_seguro_para_access_token"
    USER_EMAIL="<seu_email_para_envio>"
    PASSWORD_EMAIL="<senha_do_email>"
    RESET_PASSWORD_URL="<url_para_resetar_senha>"
    ```

    **Importante:**
    *   Substitua os valores entre `<>` com suas informações reais.
    *   `DATABASE_URL`: A string de conexão com o seu banco de dados.
    *   `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `ACCESS_TOKEN_SECRET`: Chaves secretas para a geração de tokens JWT.  Mantenha-as em segredo!
    *   `USER_EMAIL` e `PASSWORD_EMAIL`: As credenciais de um e-mail que será usado para o envio de e-mails de recuperação de senha.
    *   `RESET_PASSWORD_URL`:  A URL da sua aplicação front-end que será usada para resetar a senha. Ex: `http://localhost:8080/reset-password`

4.  **Configure o Prisma:**

    ```bash
    npx prisma migrate dev
    npx prisma generate
    ```

5.  **Execução:**

    Inicie a aplicação utilizando o comando:

    ```bash
    npm run dev
    ```

    A API ficará disponível na porta definida (por padrão, 3030) e a documentação interativa via Swagger poderá ser acessada em:

    ```bash
    http://localhost:3030/api/docs
    ```

## Uso da API

Utilize ferramentas como Postman ou Insomnia para testar os endpoints. A seguir, alguns exemplos de chamadas:

1.  **Cadastro de Usuário:**

    *   Endpoint: `POST /api/users`
    *   Body:

        ```json
        {
            "name": "Seu Nome",
            "email": "seu_email@ifnmg.edu.br",
            "password": "sua_senha"
        }
        ```

2.  **Login:**

    *   Endpoint: `POST /api/auth/login`
    *   Body:

        ```json
        {
            "email": "seu_email@ifnmg.edu.br",
            "password": "sua_senha"
        }
        ```

3.  **Criação de Quadra (Admin):**

    *   Endpoint: `POST /api/courts`
    *   Headers: `Authorization: Bearer <token>` (substitua `<token>` pelo token JWT obtido no login)
    *   Body:

        ```json
        {
            "name": "Quadra 1",
            "location": "Localização",
            "description": "Descrição",
            "openTime": "08:00",
            "closeTime": "22:00"
        }
        ```

Consulte a documentação Swagger para uma lista completa dos endpoints e exemplos de requisição.

## Contribuições

Sinta-se à vontade para abrir issues e pull requests para melhorar a API.
