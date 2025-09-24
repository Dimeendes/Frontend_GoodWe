'use client';

import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/Dashboard';
import LoginPage from '../components/LoginPage';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Se ainda está carregando, mostrar a tela de login (evita problemas de hidratação)
  if (isLoading) {
    return <LoginPage />;
  }

  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}


