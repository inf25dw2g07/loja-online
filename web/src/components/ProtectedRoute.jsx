import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { autenticado, utilizador } = useAuth();

  if (!autenticado) return <Navigate to="/login" replace />;
  if (adminOnly && utilizador?.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
