import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obterCategoria, produtosDaCategoria } from '../api/categorias';
import Spinner from '../components/Spinner';
import { StockPill } from '../components/StatusPill';

export default function CategoriaProdutos() {
  const { id } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [produtos, setProdutos] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setCategoria(null);
    setProdutos(null);
    Promise.all([obterCategoria(id), produtosDaCategoria(id)])
      .then(([cat, prods]) => {
        setCategoria(cat);
        setProdutos(prods);
      })
      .catch(() => setErro('Categoria não encontrada.'));
  }, [id]);

  if (erro) return <div className="alert alert-error">{erro}</div>;
  if (!categoria || !produtos) return <Spinner />;

  return (
    <div>
      <div className="breadcrumb">
        <Link to="/categorias">← Categorias</Link> / {categoria.nome}
      </div>

      <div className="page-header">
        <div>
          <span className="eyebrow">GET /api/categorias/{id}/produtos</span>
          <h1>{categoria.nome}</h1>
          <p className="subtitle">{categoria.descricao || 'Sem descrição.'} · {produtos.length} produtos associados.</p>
        </div>
      </div>

      {produtos.length === 0 ? (
        <div className="empty-state">
          <div className="glyph">◌</div>
          <h3>Sem produtos nesta categoria</h3>
        </div>
      ) : (
        <div className="product-grid">
          {produtos.map((p) => (
            <div className="product-card" key={p.id}>
              <div className="product-thumb">
                <span className="glyph">▤</span>
              </div>
              <span className="product-name">{p.nome}</span>
              <StockPill stock={p.stock} />
              <div className="product-foot">
                <span className="product-price">{Number(p.preco).toFixed(2)} €</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
