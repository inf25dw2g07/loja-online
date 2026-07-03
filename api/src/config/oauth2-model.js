/**
 * Modelo OAuth2 (Resource Owner Password Credentials Grant)
 * Implementa a interface exigida pela biblioteca "oauth2-server".
 *
 * Fluxo escolhido: Resource Owner Password Credentials Grant
 * - O cliente (app React) envia diretamente username + password ao endpoint /oauth/token
 * - O servidor valida as credenciais e devolve access_token + refresh_token
 * - Ver relatório para comparação com Authorization Code, Client Credentials e Implicit Flow
 */
const bcrypt = require('bcryptjs');
const db = require('./db');

module.exports = {
    // Valida o cliente OAuth2 (a "aplicação" que está a pedir o token)
    getClient: async (clientId, clientSecret) => {
        const [rows] = await db.query(
            'SELECT * FROM oauth_clients WHERE id = ?',
            [clientId]
        );
        if (rows.length === 0) return null;
        const client = rows[0];

        if (clientSecret && client.client_secret !== clientSecret) return null;

        return {
            id: client.id,
            grants: client.grants.split(','),
            redirectUris: client.redirect_uris ? client.redirect_uris.split(',') : []
        };
    },

    // Valida username + password (chamado no grant "password")
    getUser: async (username, password) => {
        const [rows] = await db.query(
            'SELECT * FROM utilizadores WHERE username = ?',
            [username]
        );
        if (rows.length === 0) return null;

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return null;

        return { id: user.id, username: user.username, role: user.role, nome: user.nome };
    },

    // Persiste o token gerado
    saveToken: async (token, client, user) => {
        await db.query(
            `INSERT INTO oauth_tokens
             (access_token, access_token_expires_at, refresh_token, refresh_token_expires_at, client_id, utilizador_id, scope)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                token.accessToken,
                token.accessTokenExpiresAt,
                token.refreshToken || null,
                token.refreshTokenExpiresAt || null,
                client.id,
                user.id,
                token.scope || null
            ]
        );

        return {
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            client,
            user
        };
    },

    // Usado em cada pedido protegido para validar o Bearer token
    getAccessToken: async (accessToken) => {
        const [rows] = await db.query(
            `SELECT t.*, u.username, u.role, u.nome
             FROM oauth_tokens t
             JOIN utilizadores u ON u.id = t.utilizador_id
             WHERE t.access_token = ?`,
            [accessToken]
        );
        if (rows.length === 0) return null;
        const row = rows[0];

        return {
            accessToken: row.access_token,
            accessTokenExpiresAt: row.access_token_expires_at,
            scope: row.scope,
            client: { id: row.client_id },
            user: { id: row.utilizador_id, username: row.username, role: row.role, nome: row.nome }
        };
    },

    getRefreshToken: async (refreshToken) => {
        const [rows] = await db.query(
            'SELECT * FROM oauth_tokens WHERE refresh_token = ?',
            [refreshToken]
        );
        if (rows.length === 0) return null;
        const row = rows[0];
        return {
            refreshToken: row.refresh_token,
            refreshTokenExpiresAt: row.refresh_token_expires_at,
            client: { id: row.client_id },
            user: { id: row.utilizador_id }
        };
    },

    revokeToken: async (token) => {
        await db.query('DELETE FROM oauth_tokens WHERE refresh_token = ?', [token.refreshToken]);
        return true;
    },

    verifyScope: async (token, scope) => {
        // Não usamos scopes granulares neste trabalho - todo o utilizador autenticado tem acesso
        return true;
    }
};
