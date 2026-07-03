import client from './client';

const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID || 'loja-web-client';
const CLIENT_SECRET = import.meta.env.VITE_OAUTH_CLIENT_SECRET || 'loja-web-secret';

/**
 * Autentica via OAuth2 Resource Owner Password Credentials Grant.
 * POST /oauth/token (application/x-www-form-urlencoded)
 */
export async function login(username, password) {
  const body = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });

  const { data } = await client.post('/oauth/token', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return data; // { access_token, refresh_token, token_type, expires_in, utilizador }
}

export function logout() {
  localStorage.removeItem('loja_auth');
}
