# Relatório — Parte 1: API REST Loja Online

**Unidade Curricular:** Desenvolvimento Web II
**Instituição:** Universidade da Maia
**Ano letivo:** 2025/26 — Exame Prático, Época Normal
**Grupo:** [preencher nº de grupo] — [nomes dos elementos]

---

## 1. Introdução

Este relatório descreve a implementação da Parte 1 do trabalho prático: uma API REST para gestão de uma
**Loja Online**, protegida por um mecanismo de Autenticação e Autorização baseado em **OAuth 2.0**.

O tema foi escolhido por permitir demonstrar de forma natural:
- uma relação de cardinalidade **1:n** (Categoria → Produtos);
- um recurso cujo acesso deve ser restrito ao **próprio utilizador autenticado** (Encomendas);
- um caso de uso realista para operações CRUD completas.

## 2. Modelo de Dados

| Tabela | Descrição | Nº de registos (seed) |
|---|---|---|
| `utilizadores` | Contas de acesso (1 admin + 10 clientes) | 11 |
| `categorias` | Categorias de produtos | 10 |
| `produtos` | Produtos à venda, associados a uma categoria (**N:1**) | 30 |
| `encomendas` | Encomendas efetuadas por um utilizador (**N:1**) | 30 |
| `linhas_encomenda` | Detalhe de cada encomenda (produto + quantidade) | 27 |
| `oauth_clients` / `oauth_tokens` | Suporte à camada OAuth2 | — |

**Relação 1:n obrigatória (requisito 4):** `categorias` (1) → `produtos` (n), refletida na foreign key
`produtos.categoria_id` e exposta no endpoint `GET /api/categorias/:id/produtos`.

## 3. Arquitetura dos Serviços

- **Node.js + Express** como servidor aplicacional e framework de rotas.
- **MySQL 8** como SGBD, acedido via `mysql2/promise` (queries parametrizadas, previne SQL Injection).
- **oauth2-server** para implementar o protocolo OAuth 2.0 do lado do Resource/Authorization Server.
- Três recursos principais expostos em `/api/categorias`, `/api/produtos`, `/api/encomendas`, cada um com os
  **4 verbos HTTP** (GET, POST, PUT, DELETE) mapeados às operações CRUD.
- Todas as respostas em **JSON** (requisito 5).
- **Docker Compose** com dois containers (`db` + `api`) — requisito 12.

## 4. Autenticação e Autorização — OAuth 2.0

### 4.1 Flow escolhido: Resource Owner Password Credentials Grant

Optámos pelo **Resource Owner Password Credentials Grant** (`grant_type=password`). O cliente (a aplicação
React da Parte 2) envia diretamente `username` e `password` ao endpoint `POST /oauth/token`, juntamente com
as credenciais do cliente OAuth2 (`client_id` / `client_secret`), e recebe um `access_token` (Bearer) e um
`refresh_token`.

Todos os pedidos aos recursos protegidos (`/api/*`) incluem o cabeçalho:

```
Authorization: Bearer <access_token>
```

O middleware `autenticar` (ver `src/middleware/auth.js`) valida o token junto do `oauth2-server`, e — cumprindo
o **requisito 7** — regista na consola o utilizador autenticado em cada pedido:

```
[AUTH] 2026-06-15T10:32:10.123Z | GET /api/produtos | Utilizador: jsilva (id=2, role=cliente)
```

### 4.2 Comparação com os restantes flows do OAuth 2.0

| Flow | Como funciona | Porque não foi escolhido |
|---|---|---|
| **Authorization Code** | O utilizador é redirecionado para uma página de login do Authorization Server; após consentimento, recebe um *code* que troca por um token num pedido servidor-a-servidor. É o mais seguro para aplicações com backend, pois o `client_secret` nunca é exposto ao browser. | Exige uma UI de login separada e um fluxo de redirecionamento (`redirect_uri`), o que acrescenta complexidade desnecessária para uma SPA que fala diretamente com a nossa própria API — não há um "terceiro" a autorizar. |
| **Implicit Grant** | Semelhante ao Authorization Code, mas o token é devolvido diretamente na URL de redirecionamento, sem troca por código. Pensado para SPAs antigas sem backend. | Está **deprecated** nas recomendações atuais da OAuth 2.0 Security BCP, por expor o token no histórico do browser. Não deve ser usado em novos projetos. |
| **Client Credentials** | Usado para comunicação **máquina-a-máquina**, sem um utilizador humano — o cliente autentica-se apenas com `client_id`/`client_secret`. | Não serve o nosso caso, pois precisamos de identificar *qual* utilizador está a aceder (para a regra "só vejo as minhas encomendas"). |
| **Resource Owner Password Credentials (escolhido)** | O cliente recolhe username/password diretamente e troca-os por um token. | Só é aceitável quando o cliente é **de confiança total** (a nossa própria SPA) — não deve ser usado para integrar aplicações de terceiros. Foi escolhido pela simplicidade de implementação e por ser adequado ao contexto (1 API + 1 SPA do mesmo grupo). |
| **Refresh Token** | Não é bem um "flow" inicial, mas um mecanismo usado após qualquer um dos anteriores para renovar o `access_token` sem pedir novamente as credenciais. | **Foi implementado** como complemento ao Password Grant (`refresh_token` devolvido em `/oauth/token`), para não obrigar o utilizador a autenticar-se de novo a cada hora. |

### 4.3 Autorização (controlo de acesso aos recursos)

Além da autenticação, implementámos uma regra de **autorização**: um utilizador `cliente`
só pode ler, atualizar ou apagar as **suas próprias** encomendas — qualquer tentativa de aceder a uma
encomenda de outro utilizador devolve `403 Forbidden`. Um utilizador `admin` vê e gere todas as encomendas.

## 5. Documentação e Testes

- **OpenAPI 3.0**: especificação completa em `api/openapi.yaml`, servida interativamente em `/docs` via
  Swagger UI.
- **Postman Collection**: `postman/LojaOnline.postman_collection.json`, com um pedido de obtenção de token
  que guarda automaticamente o `access_token` numa variável de coleção, reutilizada pelos restantes pedidos.

## 6. Como executar

```bash
docker compose up --build
```

A API fica disponível em `http://localhost:3000`, a documentação em `http://localhost:3000/docs`, e o MySQL
é inicializado automaticamente com o schema e os dados de seed (`api/sql/init.sql`).

Utilizador de teste: `jsilva` / `password123` (cliente). Utilizador admin: `admin` / `password123`.

## 7. Conclusão

Os objetivos definidos para a Parte 1 do enunciado foram integralmente cumpridos: uma API REST com os quatro
verbos HTTP mapeados a operações CRUD, três recursos (Categorias, Produtos, Encomendas) com uma relação 1:n
entre os dois primeiros, representações em JSON, e uma camada de Autenticação e Autorização OAuth 2.0
funcional, com o utilizador autenticado visível na consola em cada pedido.

Além dos requisitos mínimos, implementámos os itens valorizados no enunciado: framework Express, OAuth 2.0
(Resource Owner Password Credentials Grant, com suporte a refresh token), e a restrição de acesso de um
utilizador aos seus próprios recursos (Encomendas), verificada e testada com respostas `403 Forbidden` para
tentativas de acesso indevido.

O maior valor de aprendizagem esteve em perceber que uma biblioteca de OAuth2 como o `oauth2-server` não
"faz tudo sozinha" — implementa o protocolo, mas o armazenamento, a validação de credenciais e a lógica de
negócio continuam a ser responsabilidade nossa. Esta separação clara entre "protocolo" e "modelo de dados" é
uma boa prática que levamos para além deste trabalho.

Como trabalho futuro (fora do âmbito desta entrega), destacamos: suporte a scopes OAuth2 mais granulares
(atualmente qualquer utilizador autenticado tem o mesmo conjunto de permissões, distinguido apenas pelo
`role`), e um mecanismo de expiração/revogação de tokens mais visível na interface da Parte 2.
