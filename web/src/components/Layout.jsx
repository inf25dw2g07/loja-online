import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/': 'Painel',
  '/categorias': 'Categorias',
  '/produtos': 'Catálogo de Produtos',
  '/encomendas': 'As Minhas Encomendas',
  '/encomendas/nova': 'Nova Encomenda'
};

function tituloAtual(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/encomendas/')) return 'Detalhe da Encomenda';
  if (pathname.startsWith('/categorias/')) return 'Produtos da Categoria';
  return 'circuitOS';
}

export default function Layout({ children }) {
  const { utilizador, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const iniciais = (utilizador?.username || '?').slice(0, 2).toUpperCase();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">
            circuit<span>OS</span>
          </span>
        </div>

        <nav className="nav-group">
          <div className="nav-label">Catálogo</div>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="dot" /> Painel
          </NavLink>
          <NavLink to="/categorias" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="dot" /> Categorias
          </NavLink>
          <NavLink to="/produtos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="dot" /> Produtos
          </NavLink>
        </nav>

        <nav className="nav-group">
          <div className="nav-label">Encomendas</div>
          <NavLink to="/encomendas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="dot" /> {utilizador?.role === 'admin' ? 'Todas as encomendas' : 'As minhas encomendas'}
          </NavLink>
          <NavLink to="/encomendas/nova" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="dot" /> Nova encomenda
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{iniciais}</div>
            <div className="user-meta">
              <div className="user-name">{utilizador?.username}</div>
              <div className="user-role">{utilizador?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Terminar sessão
          </button>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <span className="topbar-title">{tituloAtual(location.pathname)}</span>
          <span className="badge-role">{utilizador?.role === 'admin' ? 'acesso admin' : 'acesso cliente'}</span>
        </header>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
