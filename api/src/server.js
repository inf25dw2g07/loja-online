require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API Loja Online a correr em http://localhost:${PORT}`);
    console.log(`Documentação OpenAPI disponível em http://localhost:${PORT}/docs`);
});
