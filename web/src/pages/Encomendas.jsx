import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarEncomendas, apagarEncomenda } from '../api/encomendas';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { EstadoPill } from '../components/StatusPill';

export default function Encomendas() {
  const { utilizador } = useAuth();
  const [encomendas, setEncomendas] = useState(null);
  const [erro, setErro] = useState('');

  function carregar() {
    listarEncomendas()
      .then(setEncomendas)
      .catch(() => setErro('Não foi possível carregar as encomendas.'));
  }

  useEffect(carregar, []);

  async function remover(e) {
    if (!confirm(`Apagar a encomenda #${e.id}?`)) return;
    try {
      await apagarEncomenda(e.id);
      carregar();
    } catch {
      setErro('Não foi possível apagar a encomenda.');
    }
  }

  if (!encomendas) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">recurso 3 · acesso restrito ao dono (ou admin)</span>
          <h1>{utilizador?.role === 'admin' ? 'Todas as encomendas' : 'As minhas encomendas'}</h1>
          <p className="subtitle">{encomendas.length} encomendas.</p>
        </div>
        <Link className="btn btn-accent" to="/encomendas/nova">
          + Nova encomenda
        </Link>
      </div>

      {erro && <div className="alert alert-error">{erro}</div>}

      {encomendas.length === 0 ? (
        <div className="empty-state">
          <div className="glyph">◌</div>
          <h3>Ainda sem encomendas</h3>
          <p>Comece por criar uma nova encomenda a partir do catálogo.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                {utilizador?.role === 'admin' && <th>Utilizador</th>}
                <th>Estado</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {encomendas.map((e) => (
                <tr key={e.id}>
                  <td className="mono">#{e.id}</td>
                  {utilizador?.role === 'admin' && <td className="muted-cell">utilizador #{e.utilizador_id}</td>}
                  <td>
                    <EstadoPill estado={e.estado} />
                  </td>
                  <td className="price">{Number(e.total).toFixed(2)} €</td>
                  <td className="cell-actions">
                    <Link className="btn btn-ghost btn-sm" to={`/encomendas/${e.id}`}>
                      Ver
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => remover(e)}>
                      Apagar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
