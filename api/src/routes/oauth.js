const express = require('express');
const router = express.Router();
const OAuth2Server = require('oauth2-server');
const oauth = require('../config/oauth2');

const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;

/**
 * POST /oauth/token
 * Body (x-www-form-urlencoded ou JSON):
 *   grant_type=password
 *   username=jsilva
 *   password=password123
 *   client_id=loja-web-client
 *   client_secret=loja-web-secret
 */
router.post('/token', async (req, res) => {
    const request = new Request(req);
    const response = new Response(res);

    try {
        const token = await oauth.token(request, response);
        res.json({
            access_token: token.accessToken,
            refresh_token: token.refreshToken,
            token_type: 'Bearer',
            expires_in: Math.floor((token.accessTokenExpiresAt - new Date()) / 1000),
            utilizador: { id: token.user.id, username: token.user.username, role: token.user.role }
        });
    } catch (err) {
        res.status(err.code || 500).json({ erro: err.name, detalhe: err.message });
    }
});

module.exports = router;
