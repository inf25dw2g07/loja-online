import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarCategorias } from '../api/categorias';
import { listarProdutos } from '../api/produtos';
import { listarEncomendas } from '../api/encomendas';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { EstadoPill } from '../components/StatusPill';

export default function Home() {
  const { utilizador } = useAuth();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    Promise.all([listarCategorias(), listarProdutos(), listarEncomendas()])
      .then(([categorias, produtos, encomendas]) => {
        if (!ativo) return;
        setDados({ categorias, produtos, encomendas });
      })
      .catch(() => ativo && setErro('Não foi possível carregar os dados do painel.'));
    return () => {
      ativo = false;
    };
  }, []);

  if (erro) return <div className="alert alert-error">{erro}</div>;
  if (!dados) return <Spinner />;

  const valorTotal = dados.encomendas.reduce((soma, e) => soma + Number(e.total || 0), 0);
  const recentes = [...dados.encomendas].sort((a, b) => b.id - a.id).slice(0, 6);

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">bem-vindo, {utilizador?.username}</span>
          <h1>Vista geral</h1>
          <p className="subtitle">Resumo em tempo real dos recursos disponibilizados pela API.</p>
        </div>
        <Link className="btn btn-accent" to="/encomendas/nova">
          + Nova encomenda
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Categorias</div>
          <div className="stat-value">{dados.categorias.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Produtos no catálogo</div>
          <div className="stat-value">{dados.produtos.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{utilizador?.role === 'admin' ? 'Encomendas (todas)' : 'As minhas encomendas'}</div>
          <div className="stat-value">{dados.encomendas.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Valor acumulado</div>
          <div className="stat-value mono">{valorTotal.toFixed(2)} €</div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Encomendas recentes</h3>
        </div>
        {recentes.length === 0 ? (
          <div className="empty-state">
            <div className="glyph">◌</div>
            <h3>Ainda não há encomendas</h3>
            <p>Crie a primeira encomenda a partir do catálogo de produtos.</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderTop: '1px solid var(--paper-2)', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentes.map((e) => (
                  <tr key={e.id}>
                    <td className="mono">#{e.id}</td>
                    <td>
                      <EstadoPill estado={e.estado} />
                    </td>
                    <td className="price">{Number(e.total).toFixed(2)} €</td>
                    <td className="cell-actions">
                      <Link className="btn btn-ghost btn-sm" to={`/encomendas/${e.id}`}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
