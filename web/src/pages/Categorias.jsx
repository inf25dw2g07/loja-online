import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarCategorias, criarCategoria, atualizarCategoria, apagarCategoria } from '../api/categorias';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const VAZIO = { nome: '', descricao: '' };

export default function Categorias() {
  const { utilizador } = useAuth();
  const isAdmin = utilizador?.role === 'admin';

  const [categorias, setCategorias] = useState(null);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [formulario, setFormulario] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [aGuardar, setAGuardar] = useState(false);

  function carregar() {
    listarCategorias()
      .then(setCategorias)
      .catch(() => setErro('Não foi possível carregar as categorias.'));
  }

  useEffect(carregar, []);

  function abrirNova() {
    setFormulario(VAZIO);
    setEditandoId(null);
    setModalAberto(true);
  }

  function abrirEdicao(categoria) {
    setFormulario({ nome: categoria.nome, descricao: categoria.descricao || '' });
    setEditandoId(categoria.id);
    setModalAberto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setAGuardar(true);
    try {
      if (editandoId) {
        await atualizarCategoria(editandoId, formulario);
      } else {
        await criarCategoria(formulario);
      }
      setModalAberto(false);
      carregar();
    } catch {
      setErro('Não foi possível guardar a categoria.');
    } finally {
      setAGuardar(false);
    }
  }

  async function remover(categoria) {
    if (!confirm(`Apagar a categoria "${categoria.nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await apagarCategoria(categoria.id);
      carregar();
    } catch {
      setErro('Não foi possível apagar a categoria (pode ter produtos associados).');
    }
  }

  if (!categorias) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">recurso 1 · relação 1:n com produtos</span>
          <h1>Categorias</h1>
          <p className="subtitle">{categorias.length} categorias disponíveis no catálogo.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-accent" onClick={abrirNova}>
            + Nova categoria
          </button>
        )}
      </div>

      {erro && <div className="alert alert-error">{erro}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td className="mono muted-cell">{c.id}</td>
                <td style={{ fontWeight: 600 }}>{c.nome}</td>
                <td className="muted-cell">{c.descricao || '—'}</td>
                <td className="cell-actions">
                  <Link className="btn btn-ghost btn-sm" to={`/categorias/${c.id}`}>
                    Ver produtos
                  </Link>
                  {isAdmin && (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => abrirEdicao(c)}>
                        Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => remover(c)}>
                        Apagar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="modal-backdrop" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editandoId ? 'Editar categoria' : 'Nova categoria'}</h3>
              <button className="modal-close" onClick={() => setModalAberto(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={guardar}>
                <div className="field">
                  <label>Nome</label>
                  <input
                    required
                    value={formulario.nome}
                    onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Descrição</label>
                  <textarea
                    rows={3}
                    value={formulario.descricao}
                    onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setModalAberto(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={aGuardar}>
                    {aGuardar ? 'A guardar…' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
