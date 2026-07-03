import client from './client';

export const listarEncomendas = () => client.get('/api/encomendas').then((r) => r.data);
export const obterEncomenda = (id) => client.get(`/api/encomendas/${id}`).then((r) => r.data);
export const criarEncomenda = (dados) => client.post('/api/encomendas', dados).then((r) => r.data);
export const atualizarEncomenda = (id, dados) => client.put(`/api/encomendas/${id}`, dados).then((r) => r.data);
export const apagarEncomenda = (id) => client.delete(`/api/encomendas/${id}`);
