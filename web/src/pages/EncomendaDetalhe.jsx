import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { obterEncomenda, atualizarEncomenda } from '../api/encomendas';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { EstadoPill } from '../components/StatusPill';

const ESTADOS = ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'];

export default function EncomendaDetalhe() {
  const { id } = useParams();
  const { utilizador } = useAuth();
  const navigate = useNavigate();
  const [encomenda, setEncomenda] = useState(null);
  const [erro, setErro] = useState('');
  const [aAtualizar, setAAtualizar] = useState(false);

  function carregar() {
    obterEncomenda(id)
      .then(setEncomenda)
      .catch((err) => {
        if (err.response?.status === 403) setErro('Não tem permissão para ver esta encomenda.');
        else setErro('Encomenda não encontrada.');
      });
  }

  useEffect(carregar, [id]);

  async function mudarEstado(novoEstado) {
    setAAtualizar(true);
    try {
      await atualizarEncomenda(id, { estado: novoEstado });
      carregar();
    } catch {
      setErro('Não foi possível atualizar o estado.');
    } finally {
      setAAtualizar(false);
    }
  }

  if (erro)
    return (
      <div>
        <div className="alert alert-error">{erro}</div>
        <button className="btn btn-ghost" onClick={() => navigate('/encomendas')}>
          ← Voltar às encomendas
        </button>
      </div>
    );
  if (!encomenda) return <Spinner />;

  const podeGerir = utilizador?.role === 'admin' || encomenda.utilizador_id === utilizador?.id;

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/encomendas">← Encomendas</Link> / #{encomenda.id}
      </div>

      <div className="page-header">
        <div>
          <span className="eyebrow">GET /api/encomendas/{id}</span>
          <h1>Encomenda #{encomenda.id}</h1>
          <p className="subtitle">
            <EstadoPill estado={encomenda.estado} />
          </p>
        </div>
      </div>

      <div className="order-layout">
        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 10 }}>Linhas da encomenda</h3>
          {(encomenda.linhas || []).map((l) => (
            <div className="line-row" key={l.id}>
              <span>{l.produto_nome}</span>
              <span className="muted-cell mono">x{l.quantidade}</span>
              <span className="mono">{Number(l.preco_unitario).toFixed(2)} €</span>
              <span className="price">{(Number(l.preco_unitario) * l.quantidade).toFixed(2)} €</span>
            </div>
          ))}
          {(!encomenda.linhas || encomenda.linhas.length === 0) && (
            <p className="muted-cell">Sem linhas associadas.</p>
          )}
        </div>

        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 10 }}>Resumo</h3>
          <div className="summary-row">
            <span>Nº de linhas</span>
            <span>{encomenda.linhas?.length || 0}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>{Number(encomenda.total).toFixed(2)} €</span>
          </div>

          {podeGerir && (
            <div style={{ marginTop: 20 }}>
              <div className="field">
                <label>Atualizar estado</label>
                <select value={encomenda.estado} onChange={(e) => mudarEstado(e.target.value)} disabled={aAtualizar}>
                  {ESTADOS.map((es) => (
                    <option key={es} value={es}>
                      {es}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
