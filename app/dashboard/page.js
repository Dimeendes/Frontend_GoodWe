'use client';

import { useAuth } from '../../contexts/AuthContext';
import Dashboard from '../../components/Dashboard';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Se ainda está carregando, mostrar loading
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--bg)'
      }}>
        <div style={{ color: 'var(--text)' }}>Carregando...</div>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  return <Dashboard />;
}

