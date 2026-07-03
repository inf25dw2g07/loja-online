import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty-state">
      <div className="glyph">◌</div>
      <h3>404 — recurso não encontrado</h3>
      <p style={{ marginBottom: 16 }}>Este caminho não corresponde a nenhuma página conhecida.</p>
      <Link className="btn btn-primary" to="/">
        Voltar ao painel
      </Link>
    </div>
  );
}
