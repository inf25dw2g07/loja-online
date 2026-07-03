import client from './client';

export const listarCategorias = () => client.get('/api/categorias').then((r) => r.data);
export const obterCategoria = (id) => client.get(`/api/categorias/${id}`).then((r) => r.data);
export const criarCategoria = (dados) => client.post('/api/categorias', dados).then((r) => r.data);
export const atualizarCategoria = (id, dados) => client.put(`/api/categorias/${id}`, dados).then((r) => r.data);
export const apagarCategoria = (id) => client.delete(`/api/categorias/${id}`);
export const produtosDaCategoria = (id) => client.get(`/api/categorias/${id}/produtos`).then((r) => r.data);
