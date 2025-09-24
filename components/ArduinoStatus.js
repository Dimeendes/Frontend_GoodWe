"use client";

import { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useSocket } from '../hooks/useSocket';

export default function ArduinoStatus() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState('');
  const [port, setPort] = useState('');
  const { language } = useSettings();
  
  // Hook Socket.io
  const { 
    isConnected, 
    arduinoStatus, 
    lampState, 
    sendArduinoCommand, 
    reconnectArduino 
  } = useSocket();

  const translations = {
    pt: {
      title: 'Status Arduino',
      connected: 'Conectado',
      disconnected: 'Desconectado',
      connecting: 'Conectando...',
      port: 'Porta',
      lastMessage: 'Última mensagem',
      none: 'Nenhuma',
      reconnect: 'Reconectar',
      baudRate: 'Taxa de transmissão',
      sensorInfo: 'Sensor PIR no pino 2',
      ledInfo: 'LED no pino 13'
    },
    en: {
      title: 'Arduino Status',
      connected: 'Connected',
      disconnected: 'Disconnected',
      connecting: 'Connecting...',
      port: 'Port',
      lastMessage: 'Last message',
      none: 'None',
      reconnect: 'Reconnect',
      baudRate: 'Baud rate',
      sensorInfo: 'PIR sensor on pin 2',
      ledInfo: 'LED on pin 13'
    }
  };

  const t = translations[language];

  // Atualizar estado baseado no Socket.io
  useEffect(() => {
    if (arduinoStatus) {
      setConnectionStatus(arduinoStatus.connected ? 'connected' : 'disconnected');
      setPort(arduinoStatus.port || '');
      
      if (arduinoStatus.lastMessage) {
        setLastMessage(arduinoStatus.lastMessage.message || '');
      }
    }
  }, [arduinoStatus]);

  // Verificar status da conexão (fallback para API)
  const checkConnection = async () => {
    try {
      const response = await fetch('/api/arduino/serial');
      const data = await response.json();
      
      setConnectionStatus(data.connected ? 'connected' : 'disconnected');
      setPort(data.port || '');
      
      return data;
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      setConnectionStatus('disconnected');
      setPort('');
      return null;
    }
  };

  // Reconectar ao Arduino
  const reconnect = async () => {
    setConnectionStatus('connecting');
    
    // Usar Socket.io se disponível, senão usar API
    if (isConnected) {
      reconnectArduino();
    } else {
      const result = await checkConnection();
      if (result && result.success) {
        console.log('Arduino conectado com sucesso');
      } else {
        console.log('Falha ao conectar ao Arduino');
      }
    }
  };

  // Verificar conexão ao carregar
  useEffect(() => {
    checkConnection();
    
    // Verificar conexão a cada 10 segundos
    const interval = setInterval(checkConnection, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Simular recebimento de mensagens (em produção, isso viria via WebSocket ou polling)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (connectionStatus === 'connected') {
        // Aqui você pode implementar polling ou WebSocket para receber mensagens em tempo real
        // Por enquanto, vamos simular algumas mensagens para demonstração
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [connectionStatus]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢';
      case 'connecting': return '🟡';
      case 'disconnected': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16
    }}>
      <h4 style={{ 
        margin: '0 0 12px 0', 
        color: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        🔧 {t.title}
      </h4>

      <div style={{ display: 'grid', gap: 12 }}>
        {/* Status da Conexão */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 12,
          background: 'var(--surface-2)',
          borderRadius: 8,
          border: '1px solid var(--border)'
        }}>
          <div>
            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Status</div>
            <div style={{ 
              color: getStatusColor(),
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              {getStatusIcon()} {t[connectionStatus]}
            </div>
          </div>
          
          <button
            onClick={reconnect}
            disabled={connectionStatus === 'connecting'}
            style={{
              padding: '8px 16px',
              background: connectionStatus === 'connected' ? 'var(--muted)' : 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: connectionStatus === 'connecting' ? 'not-allowed' : 'pointer',
              opacity: connectionStatus === 'connecting' ? 0.6 : 1
            }}
          >
            {connectionStatus === 'connecting' ? '...' : t.reconnect}
          </button>
        </div>

        {/* Informações da Porta */}
        {connectionStatus === 'connected' && (
          <div style={{
            padding: 12,
            background: 'var(--background)',
            borderRadius: 8,
            fontSize: '12px',
            color: 'var(--text)'
          }}>
            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>📡 Informações da Conexão</div>
            <div><strong>{t.port}:</strong> {port}</div>
            <div><strong>{t.baudRate}:</strong> 115200 bps</div>
            <div><strong>{t.sensorInfo}</strong></div>
            <div><strong>{t.ledInfo}</strong></div>
            <div style={{ 
              marginTop: 8, 
              padding: 4, 
              background: 'rgba(255, 193, 7, 0.1)', 
              borderRadius: 4,
              color: '#ff9800',
              fontSize: '10px'
            }}>
              ⚠️ Modo Simulação - Para conexão real, instale: npm install serialport
            </div>
            <div style={{ 
              marginTop: 4, 
              padding: 4, 
              background: isConnected ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', 
              borderRadius: 4,
              color: isConnected ? '#4CAF50' : '#F44336',
              fontSize: '10px'
            }}>
              {isConnected ? '🔌 Socket.io: Conectado' : '🔌 Socket.io: Desconectado'}
            </div>
          </div>
        )}

        {/* Última Mensagem */}
        <div style={{
          padding: 8,
          background: 'var(--background)',
          borderRadius: 6,
          fontSize: '11px',
          color: 'var(--muted)'
        }}>
          <div><strong>{t.lastMessage}:</strong> {lastMessage || t.none}</div>
        </div>

        {/* Instruções */}
        <div style={{
          padding: 8,
          background: 'var(--background)',
          borderRadius: 6,
          fontSize: '10px',
          color: 'var(--muted)'
        }}>
          <div><strong>💡 Instruções:</strong></div>
          <div>• Conecte o Arduino via USB</div>
          <div>• Upload do código com sensor PIR</div>
          <div>• O sistema detectará automaticamente a porta</div>
          <div>• Movimento detectado ligará a lâmpada</div>
        </div>
      </div>
    </div>
  );
}
