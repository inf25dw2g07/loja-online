# Loja Online — Desenvolvimento Web II

Repositório do trabalho prático de avaliação final, unidade curricular de Desenvolvimento Web II, 2º ano,
Universidade da Maia. Desenvolvido pelo Grupo [Nº do grupo] — [Nome Completo 1] ([@github1](https://github.com/github1)), [Nome Completo 2] ([@github2](https://github.com/github2)), [Nome Completo 3] ([@github3](https://github.com/github3)).

## Descrição do tema

Uma **Loja Online de eletrónica** ("circuitOS"), composta por duas partes:

- **Parte 1** — uma API REST (Node.js + Express + MySQL) que expõe três recursos — Categorias, Produtos e
  Encomendas — protegidos por uma camada de Autenticação e Autorização OAuth 2.0, cumprindo os requisitos
  mínimos e valorizados do enunciado (relação 1:n, 4 verbos HTTP, documentação OpenAPI, coleção Postman,
  containerização Docker, restrição de acesso a recursos próprios).
- **Parte 2** — uma aplicação Web cliente em ReactJS que consome essa API, com autenticação, navegação
  Categorias → Produtos, carrinho de compras para criação de Encomendas, e gestão de estado por perfil de
  utilizador (cliente / admin).

## Organização do repositório

* **Código-fonte da API (Parte 1)** está na pasta [api](api/), incluindo o [schema e seed da base de dados](api/sql/init.sql).
* **Código-fonte da aplicação Web (Parte 2)** está na pasta [web](web/).
* **Documento OpenAPI 3.0** inicial da API em [api/openapi.yaml](api/openapi.yaml), servido também de forma
  interativa em `/docs` quando a API está a correr.
* **Coleção Postman** para testar a API está em [postman](postman/).
* **Capítulos do relatório** estão na pasta [relatorio](relatorio/).
* **Orquestração Docker** (multi-container: base de dados + API + Web) em [docker-compose.yml](docker-compose.yml).

## Tecnologias

* [Node.js](https://nodejs.org/en/) — ambiente de execução do servidor aplicacional
* [MySQL](https://www.mysql.com/) — sistema de gestão de base de dados relacional
* [OAuth 2.0](https://oauth.net/2/) — protocolo de autenticação e autorização
* [JavaScript (ES2022+)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) — linguagem usada em todo o projeto (backend e frontend)
* [Docker](https://www.docker.com/) — containerização da aplicação (multi-container: BD + API + Web)
* [OpenAPI 3.0](https://swagger.io/specification/) — especificação da documentação da API
* [Postman](https://www.postman.com/) — testes manuais e automatizados dos endpoints

### Frameworks e Bibliotecas

* [Express](https://expressjs.com/) — framework do servidor REST
* [mysql2](https://github.com/sidorares/node-mysql2) — driver MySQL para Node.js com suporte a promises
* [oauth2-server](https://github.com/oauthjs/node-oauth2-server) — implementação do protocolo OAuth 2.0
* [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — hashing de passwords
* [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express) — servir a documentação OpenAPI interativa
* [React](https://react.dev/) — biblioteca da interface da aplicação cliente
* [React Router](https://reactrouter.com/) — routing client-side da SPA
* [Vite](https://vitejs.dev/) — bundler e servidor de desenvolvimento do frontend
* [Axios](https://axios-http.com/) — cliente HTTP do frontend
* [Nginx](https://nginx.org/) — servidor da build de produção da aplicação Web em Docker

## Relatório

_O relatório está dividido pelas duas partes do enunciado, cada uma com a arquitetura, decisões técnicas,
comparação de flows OAuth2, dificuldades sentidas e conclusões._

### Parte 1 — API REST
* [Relatório completo da Parte 1](relatorio/relatorio-parte1.md)

### Parte 2 — Aplicação Web Cliente
* [Relatório completo da Parte 2](relatorio/relatorio-parte2.md)

## Como executar

```bash
docker compose up --build
```

* API: http://localhost:3000 — documentação: http://localhost:3000/docs
* Aplicação Web: http://localhost:5173

Utilizadores de demonstração (seed): `admin` / `password123` (perfil admin) e `jsilva` / `password123`
(perfil cliente). Ver [relatorio/relatorio-parte1.md](relatorio/relatorio-parte1.md) para mais detalhes de
configuração e testes.

## Equipa

* [Nome Completo 1] — [@github1](https://github.com/github1)
* [Nome Completo 2] — [@github2](https://github.com/github2)
* [Nome Completo 3] — [@github3](https://github.com/github3)
