# Loja Online — DW2, UMAIA 2025/26

Trabalho prático de avaliação final — **Parte 1** (API REST + OAuth2) e **Parte 2** (Aplicação Web React).

## Estrutura

```
loja-online/
├── docker-compose.yml        # orquestração completa: MySQL + API + Web
├── api/                       # Parte 1 — API REST (Node.js + Express + MySQL, OAuth2)
│   ├── src/
│   ├── sql/init.sql           # schema + 30 registos/tabela
│   └── openapi.yaml
├── web/                        # Parte 2 — Aplicação Web Cliente (ReactJS)
│   ├── src/
│   │   ├── api/                # cliente axios + chamadas por recurso
│   │   ├── context/             # AuthContext (sessão OAuth2)
│   │   ├── components/          # Layout, ProtectedRoute, StatusPill, Spinner
│   │   ├── pages/                # Login, Painel, Categorias, Produtos, Encomendas...
│   │   └── styles/
│   └── Dockerfile               # build multi-stage (Vite → Nginx)
├── postman/
│   └── LojaOnline.postman_collection.json
└── relatorio/
    ├── relatorio-parte1.md
    └── relatorio-parte2.md
```

## Como correr (stack completa via Docker)

```bash
docker compose up --build
```

| Serviço | URL |
|---|---|
| Aplicação Web (React) | http://localhost:5173 |
| API REST | http://localhost:3000 |
| Documentação OpenAPI (Swagger UI) | http://localhost:3000/docs |
| MySQL (fora do container) | localhost:3307 |

## Credenciais de teste (seed)

| username | password | role |
|---|---|---|
| admin | password123 | admin |
| jsilva | password123 | cliente |
| amartins | password123 | cliente |
| (+ 8 outros clientes) | password123 | cliente |

## Desenvolvimento sem Docker

**API:**
```bash
cd api
cp .env.example .env   # ajustar ligação a um MySQL local
npm install
npm run dev
```

**Web:**
```bash
cd web
cp .env.example .env
npm install
npm run dev             # http://localhost:5173, a apontar para VITE_API_URL
```

## Estado do trabalho

- ✅ **Parte 1** — API REST validada end-to-end (ver `relatorio/relatorio-parte1.md`).
- ✅ **Parte 2** — Aplicação Web React implementada: autenticação OAuth2, catálogo (categorias/produtos),
  relação 1:n visível na UI, carrinho/criação de encomendas, gestão CRUD para `admin`, containerização Docker.

## Próximos passos (a preencher pelo grupo)

- [ ] Enviar email a mao@umaia.pt com o tema e composição do grupo (até 5 dias antes do exame)
- [ ] Criar organização GitHub `infYYdw2gXX` e repositório(s)
- [ ] Criar conta DockerHub e publicar as imagens (`api` e `web`)
- [ ] Testar a stack completa (`docker compose up --build`) numa máquina limpa antes da apresentação
- [ ] Completar as secções "Dificuldades" e "Conclusão" de ambos os relatórios com a experiência real do grupo
- [ ] Praticar a apresentação: login, navegação por categorias/produtos, criação de uma encomenda, alteração
      de estado, CRUD como admin, e explicação do fluxo OAuth2 escolhido
