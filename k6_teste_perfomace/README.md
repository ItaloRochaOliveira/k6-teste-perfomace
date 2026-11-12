# k6_teste_perfomace — Testes de carga

Esta pasta é a **pasta k6 de uma aplicação**: tem os parâmetros dos testes, o histórico e o necessário para rodar em container. O motor (`config.js`) fica **fora**, um nível acima, e é compartilhado por todas as aplicações.

```
repo/
├── config.js                  # motor global do k6 (único, compartilhado)
└── k6_teste_perfomace/        # pasta desta aplicação
    ├── parametros/
    │   ├── auth.json
    │   └── produto.json
    ├── historico/             # um JSON por execução (a pasta precisa existir; o k6 não cria pastas)
    ├── Dockerfile             # imagem do k6
    └── docker-compose.yml     # serviço k6 (monta ../config.js, parametros/ e historico/)
```

| Arquivo | Papel |
|---------|-------|
| `../config.js` | O **motor**: o único script que o k6 executa. Não tem valores de teste. |
| `parametros/<teste>.json` | Os **parâmetros** (só dados) de cada teste desta aplicação. |
| `historico/` | Resultado de cada execução. |
| `Dockerfile` / `docker-compose.yml` | k6 em container; script, parâmetros e histórico entram por volume. |

## Como rodar

A partir da **raiz do repositório** (onde está o `config.js`):

```bash
k6 run -e APP=k6_teste_perfomace -e TESTE=auth    config.js
k6 run -e APP=k6_teste_perfomace -e TESTE=produto config.js
```

`APP` é a pasta da aplicação: o motor lê `APP/parametros/<TESTE>.json` e grava em `APP/historico/`. Outras formas:

```bash
# pastas explícitas (relativas ao config.js ou absolutas)
k6 run -e PARAMS_DIR=/srv/outro-app/parametros -e HISTORY_DIR=/srv/outro-app/historico -e TESTE=auth config.js

# caminho direto do JSON
k6 run -e PARAMS=/srv/outro-app/parametros/auth.json config.js
```

### Em container

A partir de **`k6_teste_perfomace/`**:

```bash
docker compose run --rm k6 run -e TESTE=auth -e BASE_URL=http://host.docker.internal:3006 /scripts/config.js

# parâmetros e histórico de outra aplicação
APP_PARAMS_DIR=/srv/outro-app/parametros APP_HISTORY_DIR=/srv/outro-app/historico \
  docker compose run --rm k6 run -e TESTE=auth /scripts/config.js
```

- `APP_PARAMS_DIR` e `APP_HISTORY_DIR` escolhem as pastas no host (padrões `./parametros` e `./historico`).
- `host.docker.internal` aponta para o host; se a aplicação estiver na mesma rede Docker, use o nome do serviço no `BASE_URL`.
- Há um limite opcional de `cpus` e `mem_limit` comentado no compose, para o k6 não disputar CPU com as aplicações.

Para **adicionar uma aplicação**, crie a pasta dela com `parametros/` e aponte `APP` (ou `PARAMS_DIR`). Não é preciso editar o `config.js`: o JSON é lido na hora com `open()`.

## Como o params funciona

Cada arquivo de parâmetros é **um objeto JSON** (sem comentários nem funções). O `config.js` lê esse objeto (chamado `values` lá dentro) e transforma em:

1. `options` **do k6** — carga (`carga`) e limites (`thresholds`).
2. `setup()` — cadastro e login, uma única vez, se `login: true`.
3. **Função padrão** — percorre `routes` em ordem, uma requisição por rota.
4. `handleSummary` — resumo em português e JSON do histórico.

Fluxo de uma iteração de cada usuário virtual (VU):

```
rota 1 -> check do status -> save (guarda campos da resposta)
rota 2 -> usa {{variáveis}} salvas ... -> ...
sleep(thinkTime)
```

Para **criar um novo teste**: copie um JSON existente para `parametros/<novo>.json` e ajuste.

## Parâmetros do objeto (nível raiz)

| Parâmetro | Tipo | Obrigatório | O que faz |
|-----------|------|-------------|-----------|
| `nome` | string | sim | Nome do teste. Aparece no título do resumo e no nome do arquivo de histórico (`<nome>-<data-hora>.json`). |
| `baseUrl` | string | sim | URL base da API (ex.: `http://localhost:3006`). Cada `path` é somado a ela. Pode ser trocada sem editar o arquivo com `-e BASE_URL=...`. |
| `mode` | `"sequential"` \| `"independent"` | não | `sequential` (padrão): cada VU percorre todas as rotas em sequência, como um fluxo de usuário. `independent`: cada rota vira um **cenário próprio** do k6, com sua carga, rodando em paralelo. |
| `carga` | objeto ou lista | não | Quantos usuários e por quanto tempo. Veja abaixo. Padrão: 10 VUs por 30s. |
| `thresholds` | objeto | não | Critérios de aprovação. Veja abaixo. |
| `thinkTime` | número (s) | não | Pausa, em segundos, ao final de cada iteração, simulando o tempo de um usuário real. `0` ou ausente = sem pausa. |
| `login` | boolean | não | `true`: o `setup()` cadastra e loga o `usuario` uma vez e o token vai como `Authorization: Bearer` nas rotas. `false`: nenhum login (use quando cadastro/login são as rotas testadas). |
| `usuario` | `{ name, email, password }` | se `login: true` | Usuário usado no `setup()`. Se já existir (409), o teste segue normalmente. |
| `paths` | `{ signup, login }` | se `login: true` | Caminhos de cadastro e login usados pelo `setup()`. |
| `tokenPath` | string | não | Campo da resposta do login que contém o token. Padrão: `accessToken`. Aceita caminho com ponto (`data.token`). |
| `options` | objeto | não | Opções extras do k6 (ex.: `{ "noConnectionReuse": true }`) mescladas por último; sobrescrevem as geradas. |
| `historicoDir` | string | não | Pasta do histórico. Padrão: `APP/historico` (ou `historico`, sem `APP`). Também pode ser definida com `-e HISTORY_DIR=...`. |
| `routes` | lista | sim | As requisições do teste, na ordem de execução. Veja a seção de rotas. |

### `carga`

Três formas (em JSON):

```json
"carga": { "vus": 10, "duration": "30s" }
```
```json
"carga": { "stages": [
  { "duration": "30s", "target": 20 },
  { "duration": "1m",  "target": 20 },
  { "duration": "10s", "target": 0 }
] }
```
```json
"carga": [
  { "duration": "30s", "target": 20 },
  { "duration": "10s", "target": 200 }
]
```

A terceira é uma lista direta de etapas (equivale a `stages`). **Só `duration` e `target` são usados**: outros campos, como `vus`, são ignorados. Para um spike, o `target` é que precisa subir (por exemplo `10` → `1000` → `10`).

- `vus`: usuários virtuais simultâneos.
- `duration`: tempo total (`"30s"`, `"2m"`...).
- `stages`: lista de etapas; cada uma leva a quantidade de VUs até `target` durante `duration`.
- Pela linha de comando, `-e VUS=50 -e DURATION=2m` sobrescrevem `vus` e `duration`.
- No modo `independent`, `carga` é o padrão de todos os cenários e cada rota pode ter o seu próprio (`load`).

### `thresholds`

Critérios que decidem **APROVADO** ou **REPROVADO**. A chave é a métrica e o valor é uma lista de expressões:

```json
"thresholds": {
  "http_req_failed":   ["rate<0.01"],
  "http_req_duration": ["p(95)<800"]
}
```

`rate<0.01` = menos de 1% de requisições com falha; `p(95)<800` = 95% das respostas em menos de 800 ms. Outros exemplos: `avg<300`, `p(99)<1500`, `max<3000`. Também funciona por rota: `"http_req_duration{name:signup}": ["p(95)<1200"]`.

Obs.: o `config.js` adiciona automaticamente um limite "vazio" por rota só para que o resumo mostre o tempo de resposta de cada uma. Esses não entram na lista de limites nem reprovam o teste.

## Parâmetros de cada rota (`routes`)

| Parâmetro | Tipo | O que faz |
|-----------|------|-----------|
| `name` | string | Nome da rota. Vira o nome do `group`, do `check` e a linha na tabela de tempo por rota. Use nomes únicos. |
| `method` | string | Método HTTP (`GET`, `POST`, `PUT`, `DELETE`...). Padrão: `GET`. |
| `path` | string | Caminho somado à `baseUrl`. Aceita `{{variáveis}}` e query string. |
| `body` | objeto | Corpo da requisição, enviado como JSON. Aceita `{{variáveis}}` em qualquer valor, inclusive aninhado. |
| `headers` | objeto | Cabeçalhos extras (`Content-Type: application/json` já vai por padrão). |
| `auth` | boolean | `false`: não envia o Bearer nessa rota. Se omitido, envia quando existe token (`login: true`). |
| `expectedStatus` | lista de números | Status considerados corretos (padrão `[200, 201, 204]`). Fora da lista, o `check` falha **e** a requisição conta em `http_req_failed`. Use para status esperados como `[409]` sem contar como erro. |
| `save` | objeto | Guarda campos da resposta (JSON) para rotas seguintes: `{ "productId": "id" }` guarda `resposta.id` em `{{productId}}`. Aceita caminho com ponto (`"user.id"`). |
| `sleep` | número (s) | Pausa depois dessa rota específica (além do `thinkTime`). |
| `load` | objeto | Só no modo `independent`: carga própria da rota (ex.: `{ "vus": 5, "duration": "30s" }`). Aceita também `executor` e outras opções de cenário do k6. |

## Variáveis `{{...}}`

Podem ser usadas em `path`, `body` (e valores aninhados) e `headers`.

| Variável | Valor |
|----------|-------|
| `{{runId}}` | Timestamp do início da execução (igual para todos os VUs). |
| `{{vu}}` | Número do usuário virtual. |
| `{{iter}}` | Número da iteração daquele VU (começa em 0). |
| `{{random}}` | Inteiro aleatório grande. |
| `{{randomPrice}}` | Preço aleatório entre 1,00 e 500,00. |
| `{{randomStock}}` | Inteiro aleatório de 0 a 499. |
| `{{token}}` | Token do login do `setup()`. |
| `{{qualquerChave}}` | Qualquer chave criada por `save` em rotas anteriores. |

- Se o valor é **somente** a variável (`"price": "{{randomPrice}}"`), o tipo é preservado (vira número no JSON).
- Dentro de um texto (`"Produto k6 {{runId}}-{{vu}}"`), vira string.
- Variável inexistente é mantida como está no texto (ajuda a notar erro de digitação).
- E-mails únicos por VU/iteração (`k6-{{runId}}-{{vu}}-{{iter}}@teste.com`) evitam 409 no cadastro.

## Sobrescritas pela linha de comando (`-e`)

| Variável | Efeito |
|----------|--------|
| `APP` | Pasta da aplicação (`APP/parametros` e `APP/historico`). |
| `TESTE` | Nome do JSON em `parametros/` (sem `.json`). **Obrigatória** (exceto com `PARAMS`). |
| `PARAMS_DIR` | Pasta dos JSON (substitui `APP/parametros`). |
| `PARAMS` | Caminho completo de um JSON. |
| `VUS` / `DURATION` | Sobrescrevem `carga.vus` e `carga.duration`. |
| `BASE_URL` | Sobrescreve `baseUrl`. |
| `HISTORY_DIR` | Sobrescreve a pasta do histórico. |

## Resultado e histórico

- O terminal mostra o resumo em português: duração, VUs, requisições, falhas, checks, tempo geral e **por rota**, checks com falha, limites `[ok]`/`[FALHOU]` e `APROVADO`/`REPROVADO`.
- O JSON completo (com os nomes de métrica originais do k6, em inglês) fica em `historico/<nome>-<data-hora>.json`.
- Requisições com status dentro de `expectedStatus` não contam como falha em `http_req_failed`.
