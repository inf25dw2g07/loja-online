import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('jsilva');
  const [password, setPassword] = useState('password123');
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setAEnviar(true);
    try {
      await login(username, password);
      const destino = location.state?.from?.pathname || '/';
      navigate(destino, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detalhe || 'Credenciais inválidas. Verifique o utilizador e a password.';
      setErro(msg);
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-art">
        <span className="schema-line">// oauth2 · resource owner password credentials</span>
        <h1>
          Loja de eletrónica, <span>ligada por API.</span>
        </h1>
        <p>
          Aplicação cliente ReactJS para consulta e gestão dos recursos da API REST Loja Online —
          categorias, produtos e encomendas — protegida por autenticação OAuth2.
        </p>
      </div>

      <div className="login-panel">
        <div className="login-box">
          <h2>Iniciar sessão</h2>
          <p className="subtitle">Autentique-se para aceder ao catálogo e às suas encomendas.</p>

          {erro && <div className="alert alert-error">{erro}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Utilizador</label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button className="btn btn-accent" type="submit" disabled={aEnviar}>
              {aEnviar ? 'A autenticar…' : 'Entrar'}
            </button>
          </form>

          <div className="demo-creds">
            <b>Contas de demonstração</b>
            <br />
            admin / password123 — role: admin
            <br />
            jsilva / password123 — role: cliente
          </div>
        </div>
      </div>
    </div>
  );
}
