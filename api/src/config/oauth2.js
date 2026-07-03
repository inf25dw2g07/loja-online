const OAuth2Server = require('oauth2-server');
const model = require('./oauth2-model');

const oauth = new OAuth2Server({
    model,
    accessTokenLifetime: 3600,       // 1 hora
    refreshTokenLifetime: 60 * 60 * 24 * 14, // 14 dias
    allowBearerTokensInQueryString: false
});

module.exports = oauth;
