import { createContext, useContext, useState, useCallback } from 'react';
import { login as loginRequest, logout as logoutRequest } from '../api/auth';

const AuthContext = createContext(null);

function readSession() {
  const raw = localStorage.getItem('loja_auth');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password);
    localStorage.setItem('loja_auth', JSON.stringify(data));
    setSession(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setSession(null);
  }, []);

  const value = {
    utilizador: session?.utilizador || null,
    autenticado: !!session?.access_token,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
