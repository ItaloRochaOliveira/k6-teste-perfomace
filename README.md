# 🚀 Teste de Performance com k6

Projeto de **teste de carga com k6** executado contra uma aplicação completa (API **NestJS**, front **Next.js** e **MySQL**) que simula os requisitos de uma aplicação real de trabalho.

> O foco deste repositório **não é a aplicação, e sim o teste**. A aplicação existe apenas para ser o alvo dos testes, e tudo roda localmente em Docker.

## ✨ Funcionalidades

### 🔐 Autenticação (`auth`)
- ✅ Cadastro (`signup`) e login com **JWT**
- ✅ Senha com hash **bcryptjs** (custo configurável por `BCRYPT_ROUNDS`)
- ✅ Guard JWT para proteger as rotas

### 📦 Produtos (`products`)
- ✅ CRUD completo com **soft delete** (`deletedAt`)
- ✅ Listagem com paginação, busca e ordenação
- ✅ Validação de entrada com **Zod**

### 📈 Testes de carga (`k6_backend`)
- ✅ Um único script (`config.js`) que lê os valores de arquivos de parâmetros
- ✅ Dois testes prontos: `auth` e `produto`
- ✅ **Resumo em português** no terminal (APROVADO/REPROVADO por limites)
- ✅ **Histórico** em JSON de cada execução
- ✅ Tempo de resposta **por rota**

## 🛠️ Stack Tecnológica

### Backend
- **NestJS 11** (Controller → Service, com as consultas do Prisma no Service)
- **Prisma 7** com `@prisma/adapter-mariadb`
- **MySQL 8**
- **JWT** (`jsonwebtoken`), **bcryptjs**, **Zod**

### Frontend
- **Next.js 16** (App Router) e **React 19**
- **Tailwind CSS v4** + **shadcn/ui** (`components/ui`)
- **React Query**, **React Hook Form** + **Zod**
- Estrutura por *features* (`auth` e `products`)

### Testes
- **k6** (executado na máquina, fora do Docker)

### Infraestrutura
- **Docker** com multi-stage builds
- **Docker Compose** (db + api + frontend)

## 📁 Estrutura do Projeto

```
k6-teste-perfomace/
├── backend/                       # API NestJS
│   ├── prisma/                    # schema.prisma e migrations
│   ├── src/
│   │   ├── common/                # guard JWT, decorator e pipe Zod
│   │   ├── database/prisma/       # PrismaService / PrismaModule
│   │   └── modules/
│   │       ├── auth/              # Controller, Service, schema, errors
│   │       └── products/          # Controller, Service, schema, errors
│   ├── prisma.config.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/                      # Aplicação Next.js
│   ├── src/
│   │   ├── app/                   # rotas: (auth) login/signup e (main) products
│   │   ├── components/ui/         # shadcn/ui
│   │   ├── features/              # auth/ e products/
│   │   ├── lib/ e providers/
│   │   └── middleware.ts          # protege rotas pelo cookie k6_token
│   ├── Dockerfile
│   └── package.json
├── k6_backend/                    # Testes de carga
│   ├── config.js                  # script do k6 (motor)
│   ├── authParams.js              # parâmetros do teste de auth
│   ├── produtoParams.js           # parâmetros do teste de produto
│   └── historico/                 # um JSON por execução
├── docker-compose.yml             # Orquestração dos serviços
└── README.md                      # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos
- **Docker** e **Docker Compose**
- **k6** instalado na máquina ([instalação](https://grafana.com/docs/k6/latest/set-up/install-k6/))
- Node.js 22+ apenas se for rodar back/front fora do Docker

### Docker (Recomendado)

1. **Configurar ambiente** (opcional, há valores padrão)
```bash
cp .env.example .env
```

2. **Subir todos os serviços**
```bash
docker compose up -d --build
```
A API aplica as migrations sozinha ao iniciar (`prisma migrate deploy`).

3. **Acessar**
- Frontend: http://localhost:3000
- Backend: http://localhost:3006
- MySQL: localhost:3306

4. **Zerar o banco** (apaga o volume)
```bash
docker compose down -v
```

### Desenvolvimento local (sem Docker para a aplicação)
```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

## 📊 Testes de Carga com k6

### Como rodar
O k6 aceita um único script por execução. O teste é escolhido pela variável `TESTE`:

```bash
k6 run -e TESTE=auth    k6_backend/config.js
k6 run -e TESTE=produto k6_backend/config.js
```

### Como funciona
`config.js` é o motor: importa `authParams.js` e `produtoParams.js` e usa o que vier em `TESTE`. Os arquivos de parâmetros têm **somente dados**, sem lógica.

| Etapa | O que faz |
|-------|-----------|
| `options` | Monta carga (`vus`/`duration` ou `stages`) e `thresholds` a partir dos parâmetros |
| `setup()` | Quando `login: true`, cadastra o usuário (aceita 201 ou 409) e faz login uma única vez para obter o token |
| função padrão | Executa cada rota em um `group`, com `check` do status esperado e `sleep` (`thinkTime`) |
| `handleSummary` | Imprime o resumo em português e grava o JSON do histórico |

### Parâmetros disponíveis

| Campo | Descrição |
|-------|-----------|
| `nome` | Nome do teste (usado no arquivo de histórico) |
| `baseUrl` | URL da API (padrão `http://localhost:3006`) |
| `mode` | `sequential` (rotas em fluxo) ou `independent` (cada rota é um cenário) |
| `carga` | `{ vus, duration }` ou `{ stages: [...] }` |
| `thresholds` | Limites de aprovação (ex.: `http_req_failed: ['rate<0.01']`) |
| `thinkTime` | Segundos de pausa entre iterações |
| `login` / `usuario` | Faz login no `setup()` e envia `Bearer` nas rotas |
| `routes` | Lista de rotas: `name`, `method`, `path`, `body`, `headers`, `auth`, `expectedStatus`, `save`, `load`, `sleep` |

### Variáveis nos caminhos e corpos
`{{runId}}` `{{vu}}` `{{iter}}` `{{random}}` `{{randomPrice}}` `{{randomStock}}` `{{token}}` e qualquer chave criada por `save`.

Exemplo: `save: { productId: 'id' }` guarda o `id` da resposta para usar em `/products/{{productId}}`.

### Testes disponíveis

| Teste | Rotas | Login |
|-------|-------|-------|
| `auth` | `signup` → `login` (e-mail único por VU/iteração) | não |
| `produto` | `criar_produto` → `listar_produtos` → `buscar_produtos` → `buscar_produto_por_id` → `atualizar_produto` → `excluir_produto` | sim (`k6@teste.com`) |

### Sobrescrever na linha de comando
```bash
k6 run -e TESTE=produto -e VUS=50 -e DURATION=2m k6_backend/config.js
k6 run -e TESTE=auth -e BASE_URL=http://localhost:3006 k6_backend/config.js
k6 run -e TESTE=auth -e HISTORY_DIR=outra/pasta k6_backend/config.js
```

### Exemplo de resultado
```
=== Resultado do teste: produto ===
Duração total ................ 8,7 s
Requisições HTTP ............. 146 (16,8/s)
Requisições com falha ........ 0,00% (0 de 146)

Tempo de resposta por rota
  rota                      média      mediana    p95        máx
  criar_produto             20,6 ms    ...

Limites (thresholds)
  [ok]     http_req_failed  rate<0.01
  [ok]     http_req_duration  p(95)<800

RESULTADO: APROVADO - todos os limites foram atendidos.
```

### Histórico
A cada execução é gravado `k6_backend/historico/<nome>-<data-hora>.json` com o resumo completo do k6.
> O k6 **não cria pastas**: a pasta `historico/` precisa existir (já há um `.gitkeep`).

### Como ler o resultado
- Um limite `[FALHOU]` significa que a aplicação não atendeu o critério definido nos parâmetros.
- Tempo alto sob carga **é um resultado válido do teste**: por exemplo, o `bcryptjs` roda na thread principal do Node e, com muitos logins/cadastros simultâneos, bloqueia o event loop e aumenta a latência de todas as rotas. É esse tipo de gargalo que o teste existe para revelar.

## 🔧 Configuração

### Backend (`backend/.env`)
```env
DATABASE_URL=mysql://usuario:senha@localhost:3306/banco
PORT=3006
JWT_SECRET=troque_esta_chave
JWT_EXPIRES_IN=1d
BCRYPT_ROUNDS=10
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3006
```

## 📱 Endpoints da API

### Autenticação
- `POST /auth/signup` - Criar usuário (201, ou 409 `AUTH_EMAIL_TAKEN`)
- `POST /auth/login` - Fazer login (200, ou 401 `AUTH_INVALID_CREDENTIALS`)

### Produtos (requer `Authorization: Bearer <token>`)
- `GET /products` - Listar (`page`, `pageSize`, `search`, `sortBy`, `sortOrder`)
- `POST /products` - Criar (201)
- `GET /products/:id` - Buscar por id
- `PUT /products/:id` - Atualizar (204)
- `DELETE /products/:id` - Excluir, soft delete (204)

## 🐛 Troubleshooting

#### API não sobe / reinicia em loop
```bash
docker compose logs api
```
Confira se o MySQL ficou saudável (`docker compose ps`) e se a `DATABASE_URL` usa o host `mysql` dentro do Docker.

#### `k6 run` pede argumento
O comando precisa do caminho do script:
```bash
k6 run -e TESTE=auth k6_backend/config.js
```

#### Erro ao gravar o histórico
Verifique se a pasta `k6_backend/historico` existe.

#### Muitas falhas no teste de `auth`
Confira se a API está de pé em `http://localhost:3006` e se o `BCRYPT_ROUNDS` não está alto demais para a carga escolhida.

## 📈 Melhorias Futuras

- [ ] Scripts npm (`k6:auth`, `k6:produto`)
- [ ] Teste simultâneo de `auth` + `produto` (cenários em paralelo)
- [ ] Gerar `package-lock.json` para builds reproduzíveis
- [ ] Testes de *stress* e *spike* com `stages`

### Informações Pessoais

- Italo Rocha Oliveira
- [Github](https://github.com/ItaloRochaOliveira)
