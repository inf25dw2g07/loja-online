const OAuth2Server = require('oauth2-server');
const oauth = require('../config/oauth2');

const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;

/**
 * Middleware que exige um Bearer token válido.
 * Requisito 7: imprime na consola o utilizador autenticado em cada pedido.
 */
async function autenticar(req, res, next) {
    const request = new Request(req);
    const response = new Response(res);

    try {
        const token = await oauth.authenticate(request, response);

        req.utilizador = token.user; // disponibiliza o utilizador autenticado nas rotas seguintes

        // Requisito 7 - log do utilizador autenticado no pedido
        console.log(
            `[AUTH] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ` +
            `Utilizador: ${token.user.username} (id=${token.user.id}, role=${token.user.role})`
        );

        next();
    } catch (err) {
        res.status(err.code || 401).json({ erro: 'Não autorizado', detalhe: err.message });
    }
}

/**
 * Middleware opcional para restringir a admins.
 */
function apenasAdmin(req, res, next) {
    if (req.utilizador?.role !== 'admin') {
        return res.status(403).json({ erro: 'Acesso restrito a administradores' });
    }
    next();
}

module.exports = { autenticar, apenasAdmin };
