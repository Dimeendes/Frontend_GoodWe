"use client";
import { useEffect, useState } from 'react';

export default function AssistantStatus() {
  const [status, setStatus] = useState({ loading: true, healthy: false, details: null });

  useEffect(() => {
    checkStatus();
    // Verificar status a cada 30 segundos
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  async function checkStatus() {
    try {
      const response = await fetch('/api/chat');
      const data = await response.json();
      
      if (response.ok) {
        setStatus({
          loading: false,
          healthy: true,
          details: data
        });
      } else {
        setStatus({
          loading: false,
          healthy: false,
          details: data
        });
      }
    } catch (error) {
      setStatus({
        loading: false,
        healthy: false,
        details: { error: error.message }
      });
    }
  }

  if (status.loading) {
    return (
      <div style={{ 
        padding: '8px 12px', 
        backgroundColor: '#fbbf24', 
        color: '#92400e',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        🔄 Verificando assistente...
      </div>
    );
  }

  if (status.healthy) {
    return (
      <div style={{ 
        padding: '8px 12px', 
        backgroundColor: '#10b981', 
        color: '#065f46',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        ✅ Assistente online
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '8px 12px', 
      backgroundColor: '#ef4444', 
      color: '#991b1b',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500'
    }}>
      ❌ Assistente offline
    </div>
  );
}
