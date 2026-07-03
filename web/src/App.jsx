import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Home from './pages/Home';
import Categorias from './pages/Categorias';
import CategoriaProdutos from './pages/CategoriaProdutos';
import Produtos from './pages/Produtos';
import Encomendas from './pages/Encomendas';
import EncomendaDetalhe from './pages/EncomendaDetalhe';
import NovaEncomenda from './pages/NovaEncomenda';
import NotFound from './pages/NotFound';

function Privada({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Privada><Home /></Privada>} />
          <Route path="/categorias" element={<Privada><Categorias /></Privada>} />
          <Route path="/categorias/:id" element={<Privada><CategoriaProdutos /></Privada>} />
          <Route path="/produtos" element={<Privada><Produtos /></Privada>} />
          <Route path="/encomendas" element={<Privada><Encomendas /></Privada>} />
          <Route path="/encomendas/nova" element={<Privada><NovaEncomenda /></Privada>} />
          <Route path="/encomendas/:id" element={<Privada><EncomendaDetalhe /></Privada>} />

          <Route path="*" element={<Privada><NotFound /></Privada>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
