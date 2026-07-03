import { useEffect, useMemo, useState } from 'react';
import { listarProdutos, criarProduto, atualizarProduto, apagarProduto } from '../api/produtos';
import { listarCategorias } from '../api/categorias';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { StockPill } from '../components/StatusPill';

const VAZIO = { nome: '', descricao: '', preco: '', stock: '', categoria_id: '' };

export default function Produtos() {
  const { utilizador } = useAuth();
  const isAdmin = utilizador?.role === 'admin';

  const [produtos, setProdutos] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [pesquisa, setPesquisa] = useState('');
  const [erro, setErro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [formulario, setFormulario] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [aGuardar, setAGuardar] = useState(false);

  function carregar() {
    Promise.all([listarProdutos(), listarCategorias()])
      .then(([p, c]) => {
        setProdutos(p);
        setCategorias(c);
      })
      .catch(() => setErro('Não foi possível carregar os produtos.'));
  }

  useEffect(carregar, []);

  const categoriaNome = useMemo(() => {
    const map = {};
    categorias.forEach((c) => (map[c.id] = c.nome));
    return map;
  }, [categorias]);

  const visiveis = useMemo(() => {
    if (!produtos) return [];
    return produtos.filter((p) => {
      const passaCategoria = filtroCategoria === 'todas' || String(p.categoria_id) === String(filtroCategoria);
      const passaPesquisa = p.nome.toLowerCase().includes(pesquisa.toLowerCase());
      return passaCategoria && passaPesquisa;
    });
  }, [produtos, filtroCategoria, pesquisa]);

  function abrirNovo() {
    setFormulario(VAZIO);
    setEditandoId(null);
    setModalAberto(true);
  }

  function abrirEdicao(p) {
    setFormulario({
      nome: p.nome,
      descricao: p.descricao || '',
      preco: p.preco,
      stock: p.stock,
      categoria_id: p.categoria_id
    });
    setEditandoId(p.id);
    setModalAberto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setAGuardar(true);
    const dados = {
      ...formulario,
      preco: Number(formulario.preco),
      stock: Number(formulario.stock),
      categoria_id: Number(formulario.categoria_id)
    };
    try {
      if (editandoId) {
        await atualizarProduto(editandoId, dados);
      } else {
        await criarProduto(dados);
      }
      setModalAberto(false);
      carregar();
    } catch {
      setErro('Não foi possível guardar o produto.');
    } finally {
      setAGuardar(false);
    }
  }

  async function remover(p) {
    if (!confirm(`Apagar o produto "${p.nome}"?`)) return;
    try {
      await apagarProduto(p.id);
      carregar();
    } catch {
      setErro('Não foi possível apagar o produto.');
    }
  }

  if (!produtos) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">recurso 2 · filtrável por categoria</span>
          <h1>Produtos</h1>
          <p className="subtitle">{visiveis.length} de {produtos.length} produtos apresentados.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-accent" onClick={abrirNovo}>
            + Novo produto
          </button>
        )}
      </div>

      {erro && <div className="alert alert-error">{erro}</div>}

      <div className="filters-row">
        <input placeholder="Pesquisar por nome…" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="todas">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      {visiveis.length === 0 ? (
        <div className="empty-state">
          <div className="glyph">◌</div>
          <h3>Sem resultados</h3>
          <p>Ajuste a pesquisa ou o filtro de categoria.</p>
        </div>
      ) : (
        <div className="product-grid">
          {visiveis.map((p) => (
            <div className="product-card" key={p.id}>
              <div className="product-thumb">
                <span className="glyph">▤</span>
              </div>
              <span className="product-cat">{categoriaNome[p.categoria_id] || `categoria #${p.categoria_id}`}</span>
              <span className="product-name">{p.nome}</span>
              <StockPill stock={p.stock} />
              <div className="product-foot">
                <span className="product-price">{Number(p.preco).toFixed(2)} €</span>
                {isAdmin && (
                  <div className="cell-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => abrirEdicao(p)}>
                      Editar
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => remover(p)}>
                      Apagar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <div className="modal-backdrop" onClick={() => setModalAberto(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editandoId ? 'Editar produto' : 'Novo produto'}</h3>
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
                    rows={2}
                    value={formulario.descricao}
                    onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Preço (€)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={formulario.preco}
                      onChange={(e) => setFormulario({ ...formulario, preco: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Stock</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formulario.stock}
                      onChange={(e) => setFormulario({ ...formulario, stock: e.target.value })}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Categoria</label>
                  <select
                    required
                    value={formulario.categoria_id}
                    onChange={(e) => setFormulario({ ...formulario, categoria_id: e.target.value })}
                  >
                    <option value="" disabled>
                      Escolha uma categoria
                    </option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
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
