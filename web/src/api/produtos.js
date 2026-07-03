import client from './client';

export const listarProdutos = () => client.get('/api/produtos').then((r) => r.data);
export const obterProduto = (id) => client.get(`/api/produtos/${id}`).then((r) => r.data);
export const criarProduto = (dados) => client.post('/api/produtos', dados).then((r) => r.data);
export const atualizarProduto = (id, dados) => client.put(`/api/produtos/${id}`, dados).then((r) => r.data);
export const apagarProduto = (id) => client.delete(`/api/produtos/${id}`);
