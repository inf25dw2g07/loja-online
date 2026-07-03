# Relatório — Parte 2: Aplicação Web Cliente (ReactJS)

**Unidade Curricular:** Desenvolvimento Web II
**Instituição:** Universidade da Maia
**Ano letivo:** 2025/26 — Exame Prático, Época Normal
**Grupo:** [preencher nº de grupo] — [nomes dos elementos]

---

## 1. Introdução

Este relatório descreve a implementação da Parte 2 do trabalho prático: uma **aplicação Web cliente em
ReactJS** que consome os recursos disponibilizados pela API REST desenvolvida na Parte 1 (`loja-online/api`),
protegida por OAuth 2.0.

A aplicação, com o nome interno **circuitOS**, permite a um utilizador autenticado:
- consultar o catálogo de **Categorias** e **Produtos** (incluindo a relação 1:n categoria → produtos);
- criar uma **Encomenda** a partir de um carrinho de compras;
- consultar e gerir as suas próprias **Encomendas** (ou todas, se `admin`);
- para utilizadores `admin`, realizar operações CRUD completas sobre Categorias e Produtos diretamente na
  interface.

## 2. Arquitetura e Tecnologias

- **React 18** com **React Router 6** para navegação (SPA).
- **Vite** como bundler/dev-server (`npm run dev` / `npm run build`).
- **Axios** para comunicação HTTP com a API, com um interceptor que:
  - anexa automaticamente o cabeçalho `Authorization: Bearer <access_token>` a todos os pedidos;
  - deteta respostas `401` e força novo login, limpando a sessão local.
- **React Context (`AuthContext`)** para gerir o estado de autenticação em toda a aplicação, com a sessão
  persistida em `localStorage` (`loja_auth`: access token, refresh token e dados do utilizador).
- **Rotas protegidas** (`ProtectedRoute`) que redirecionam para `/login` caso não exista sessão válida, e que
  podem restringir determinadas rotas a `admin`.
- **Docker**: build multi-stage (`node:22-alpine` para o build Vite, seguido de `nginx:alpine` a servir os
  ficheiros estáticos), integrado no `docker-compose.yml` raiz junto com os serviços `db` e `api`.

## 3. Autenticação — Integração com o OAuth 2.0 da Parte 1

A aplicação usa o mesmo flow implementado na API: **Resource Owner Password Credentials Grant**. No ecrã de
login, o utilizador introduz `username`/`password`; o cliente envia um `POST /oauth/token`
(`application/x-www-form-urlencoded`) com `grant_type=password`, `client_id` e `client_secret` fixos da
aplicação (`loja-web-client` / `loja-web-secret`), e recebe `access_token`, `refresh_token` e os dados do
utilizador autenticado.

Este flow foi reaproveitado por ser o adequado ao cenário: a SPA React **é** o cliente de confiança da
própria API (mesmo grupo, mesmo trabalho), pelo que não se justifica a complexidade de um Authorization Code
Flow com redirecionamento — essa comparação está detalhada no relatório da Parte 1 (secção 4.2).

## 4. Autorização refletida na interface

A interface adapta-se ao `role` do utilizador autenticado (devolvido pela API):

| Funcionalidade | Cliente | Admin |
|---|---|---|
| Ver categorias e produtos | ✅ | ✅ |
| Criar / editar / apagar categorias e produtos | ❌ | ✅ |
| Ver as próprias encomendas | ✅ | ✅ (vê todas) |
| Ver encomendas de outros utilizadores | ❌ (403 da API) | ✅ |
| Criar nova encomenda | ✅ | ✅ |

Mesmo que a interface esconda botões de gestão para um `cliente`, a regra de autorização é sempre imposta
**do lado da API** (a UI é apenas uma conveniência — nunca a única barreira de segurança).

## 5. Estrutura da aplicação

```
web/
├── src/
│   ├── api/            # client axios + módulos por recurso (categorias, produtos, encomendas, auth)
│   ├── context/         # AuthContext (sessão, login, logout)
│   ├── components/      # Layout (sidebar), ProtectedRoute, StatusPill, Spinner
│   ├── pages/            # Login, Home, Categorias, Produtos, CategoriaProdutos,
│   │                      # Encomendas, EncomendaDetalhe, NovaEncomenda, NotFound
│   ├── styles/           # tokens.css (paleta/tipografia) + global.css
│   ├── App.jsx           # rotas
│   └── main.jsx
├── Dockerfile             # build multi-stage (Vite → Nginx)
├── nginx.conf
└── vite.config.js
```

## 6. Funcionalidades principais

- **Painel (`/`)**: estatísticas agregadas (nº categorias, produtos, encomendas, valor total) e encomendas
  recentes.
- **Categorias (`/categorias`)**: listagem + CRUD (admin) + acesso a `/categorias/:id`, que consome
  `GET /api/categorias/:id/produtos` para demonstrar a relação 1:n de forma visível na UI.
- **Produtos (`/produtos`)**: grelha de produtos com pesquisa por nome e filtro por categoria; CRUD completo
  para `admin`.
- **Nova Encomenda (`/encomendas/nova`)**: carrinho de compras — o utilizador escolhe produtos e quantidades;
  ao confirmar, é feito um único `POST /api/encomendas` com todas as linhas, que a API processa numa
  transação.
- **Encomendas (`/encomendas`)**: lista as encomendas do utilizador (ou todas, se admin), com acesso ao
  detalhe (`/encomendas/:id`) — linhas, totais e alteração de estado (`pendente` → `pago` → `enviado` →
  `entregue` / `cancelado`).

## 7. Como executar

**Via Docker (recomendado, stack completa):**
```bash
docker compose up --build
```
- Web: `http://localhost:5173`
- API: `http://localhost:3000` (documentação em `/docs`)

**Em desenvolvimento (sem Docker):**
```bash
cd web
cp .env.example .env
npm install
npm run dev
```

Utilizadores de teste (seed da Parte 1): `admin` / `password123` (role `admin`); `jsilva` / `password123`
(role `cliente`).

## 8. Dificuldades e Aprendizagens

**Persistência da sessão entre recarregamentos de página.** Uma SPA perde o estado em memória sempre que a
página é recarregada (F5) ou aberta num novo separador. Para o utilizador não ter de fazer login a cada
navegação, a sessão (token + dados do utilizador) é guardada em `localStorage` e lida na inicialização do
`AuthContext`. Isto levantou a questão de como reagir quando o token guardado já expirou — resolvido com um
interceptor de resposta do Axios que deteta qualquer `401` vindo da API, limpa a sessão local e redireciona
para `/login` de forma transparente, em vez de a aplicação ficar "presa" a mostrar erros.

**Distinguir erros 401 de 403 na interface.** A API devolve `401` quando não há autenticação válida (token
em falta/expirado) e `403` quando o utilizador está autenticado mas não tem permissão sobre aquele recurso
específico (por exemplo, tentar ver a encomenda de outro cliente). Tratámo-los de forma diferente na UI: o
`401` força logout/novo login; o `403` mostra uma mensagem de "sem permissão" sem forçar logout, porque o
utilizador continua validamente autenticado.

**Construção do carrinho de compras antes de submeter a encomenda.** Ao contrário de um CRUD simples, a
criação de uma encomenda na Parte 1 espera um único pedido `POST` com todas as linhas (produto + quantidade)
de uma só vez, não uma linha de cada vez. Isto exigiu manter o "carrinho" como estado local do componente
(um objeto `{ produto_id: quantidade }`) até o utilizador confirmar, e só nesse momento montar o `payload`
completo e chamar a API — espelhando, do lado do cliente, a transação atómica implementada no servidor.

**Refletir permissões na interface sem duplicar a lógica de negócio.** Optámos por esconder ações (botões de
criar/editar/apagar) que o `role` do utilizador não permite, para uma experiência mais limpa — mas sem nunca
assumir que isso substitui a validação do servidor. A API continua a ser a única fonte de verdade sobre
permissões; a interface é só uma camada de conveniência.

**Routing client-side em produção (Nginx).** Ao contrário do servidor de desenvolvimento do Vite, que trata
automaticamente rotas como `/encomendas/3`, um servidor Nginx "genérico" devolveria `404` para qualquer
caminho que não corresponda a um ficheiro real no disco. Foi necessário configurar explicitamente
`try_files $uri $uri/ /index.html;` no `nginx.conf`, para que qualquer rota da SPA seja sempre servida pelo
`index.html` e entregue ao React Router tratar a navegação.

## 9. Conclusão

A Parte 2 cumpre o objetivo de disponibilizar uma aplicação Web cliente em ReactJS que consome e gere os
recursos da API REST da Parte 1, através de uma camada de autenticação e autorização OAuth 2.0 partilhada
entre as duas partes do trabalho. A aplicação cobre os três recursos (Categorias, Produtos, Encomendas), a
relação 1:n entre Categorias e Produtos, e a regra de que um utilizador só acede às suas próprias Encomendas
— sempre validada do lado do servidor, com a interface a refletir essa mesma regra.

O maior desafio não foi tecnicamente complexo por si só, mas sim de integração: fazer o frontend "falar
exatamente a mesma língua" que o backend espera — desde o formato `application/x-www-form-urlencoded` exigido
pelo endpoint de token, até à estrutura exata do `payload` de uma nova encomenda. Isso reforçou a importância
de manter a documentação OpenAPI da Parte 1 atualizada e de a consultar como referência durante o
desenvolvimento do cliente.

Como trabalho futuro, destacamos: paginação nas listagens (atualmente todos os produtos/categorias são
carregados de uma vez, o que é aceitável para o volume de dados de demonstração mas não escalaria para um
catálogo real), e testes automatizados de interface (não implementados por restrição de tempo).
