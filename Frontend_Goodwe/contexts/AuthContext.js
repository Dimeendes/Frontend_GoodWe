'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há sessão salva no localStorage ao carregar
  useEffect(() => {
    try {
      // Verificar se estamos no lado do cliente
      if (typeof window !== 'undefined') {
        const savedAuth = localStorage.getItem('goodwe-auth');
        if (savedAuth === 'true') {
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email, password) => {
    try {
      // Credenciais de teste
      if (email === 'goodwe.ccpg5@gmail.com' && password === 'Letsrockthefuture') {
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('goodwe-auth', 'true');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      setIsAuthenticated(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('goodwe-auth');
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
