import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarProdutos } from '../api/produtos';
import { criarEncomenda } from '../api/encomendas';
import Spinner from '../components/Spinner';

export default function NovaEncomenda() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState(null);
  const [pesquisa, setPesquisa] = useState('');
  const [carrinho, setCarrinho] = useState({}); // { produto_id: quantidade }
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);

  useEffect(() => {
    listarProdutos()
      .then(setProdutos)
      .catch(() => setErro('Não foi possível carregar os produtos.'));
  }, []);

  const produtosPorId = useMemo(() => {
    const map = {};
    (produtos || []).forEach((p) => (map[p.id] = p));
    return map;
  }, [produtos]);

  const visiveis = useMemo(
    () => (produtos || []).filter((p) => p.nome.toLowerCase().includes(pesquisa.toLowerCase())),
    [produtos, pesquisa]
  );

  function adicionar(produtoId) {
    setCarrinho((c) => ({ ...c, [produtoId]: (c[produtoId] || 0) + 1 }));
  }

  function definirQuantidade(produtoId, qtd) {
    const q = Math.max(0, Number(qtd) || 0);
    setCarrinho((c) => {
      const novo = { ...c };
      if (q === 0) delete novo[produtoId];
      else novo[produtoId] = q;
      return novo;
    });
  }

  function remover(produtoId) {
    setCarrinho((c) => {
      const novo = { ...c };
      delete novo[produtoId];
      return novo;
    });
  }

  const linhas = Object.entries(carrinho).map(([id, quantidade]) => ({
    produto: produtosPorId[id],
    quantidade
  }));
  const total = linhas.reduce((soma, l) => soma + (l.produto?.preco || 0) * l.quantidade, 0);

  async function submeter() {
    if (linhas.length === 0) return;
    setAEnviar(true);
    setErro('');
    try {
      const payload = {
        estado: 'pendente',
        linhas: linhas.map((l) => ({ produto_id: l.produto.id, quantidade: l.quantidade }))
      };
      const nova = await criarEncomenda(payload);
      navigate(`/encomendas/${nova.id}`);
    } catch (err) {
      setErro(err.response?.data?.detalhe || 'Não foi possível criar a encomenda.');
    } finally {
      setAEnviar(false);
    }
  }

  if (!produtos) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">POST /api/encomendas · associada ao utilizador autenticado</span>
          <h1>Nova encomenda</h1>
          <p className="subtitle">Escolha os produtos e as quantidades pretendidas.</p>
        </div>
      </div>

      {erro && <div className="alert alert-error">{erro}</div>}

      <div className="order-layout">
        <div>
          <div className="filters-row">
            <input placeholder="Pesquisar produto…" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
          </div>
          <div className="product-grid">
            {visiveis.map((p) => (
              <div className="product-card" key={p.id}>
                <div className="product-thumb">
                  <span className="glyph">▤</span>
                </div>
                <span className="product-name">{p.nome}</span>
                <div className="product-foot">
                  <span className="product-price">{Number(p.preco).toFixed(2)} €</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => adicionar(p.id)} disabled={p.stock === 0}>
                    {p.stock === 0 ? 'Esgotado' : 'Adicionar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad" style={{ position: 'sticky', top: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 6 }}>Carrinho</h3>
          {linhas.length === 0 ? (
            <p className="muted-cell" style={{ padding: '20px 0' }}>
              Ainda não adicionou produtos.
            </p>
          ) : (
            <>
              {linhas.map((l) => (
                <div className="line-row" key={l.produto.id}>
                  <span>{l.produto.nome}</span>
                  <input
                    className="qty-input"
                    type="number"
                    min="0"
                    value={l.quantidade}
                    onChange={(e) => definirQuantidade(l.produto.id, e.target.value)}
                  />
                  <span className="price">{(l.produto.preco * l.quantidade).toFixed(2)} €</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => remover(l.produto.id)}>
                    ✕
                  </button>
                </div>
              ))}
              <div className="summary-total">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </>
          )}
          <button
            className="btn btn-accent"
            style={{ width: '100%', marginTop: 16 }}
            disabled={linhas.length === 0 || aEnviar}
            onClick={submeter}
          >
            {aEnviar ? 'A criar…' : 'Confirmar encomenda'}
          </button>
        </div>
      </div>
    </div>
  );
}
