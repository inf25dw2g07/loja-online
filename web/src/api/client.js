import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const client = axios.create({
  baseURL: API_URL
});

// Anexa o access_token (Bearer) a todos os pedidos autenticados
client.interceptors.request.use((config) => {
  const raw = localStorage.getItem('loja_auth');
  if (raw) {
    const { access_token } = JSON.parse(raw);
    if (access_token) config.headers.Authorization = `Bearer ${access_token}`;
  }
  return config;
});

// Se o token expirar/for inválido (401), limpa a sessão e força novo login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('loja_auth');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default client;
