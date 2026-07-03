const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const oauthRoutes = require('./routes/oauth');
const categoriasRoutes = require('./routes/categorias');
const produtosRoutes = require('./routes/produtos');
const encomendasRoutes = require('./routes/encomendas');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // necessário para o grant "password" via form

// Documentação OpenAPI 3.0 (requisito 8)
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Autenticação (obtenção de token)
app.use('/oauth', oauthRoutes);

// Recursos protegidos
app.use('/api/categorias', categoriasRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/encomendas', encomendasRoutes);

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API Loja Online - DW2 UMAIA 2025/26',
        documentacao: '/docs',
        autenticacao: 'POST /oauth/token'
    });
});

// Tratamento de erros genérico
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;
