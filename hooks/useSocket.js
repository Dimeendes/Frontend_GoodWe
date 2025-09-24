'use client';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [arduinoStatus, setArduinoStatus] = useState({
    connected: false,
    port: null,
    lastMessage: null
  });
  const [lampState, setLampState] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Inicializar Socket.io
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Eventos de conexão
    socketInstance.on('connect', () => {
      console.log('✅ Conectado ao servidor Socket.io');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Desconectado do servidor Socket.io');
      setIsConnected(false);
    });

    // Eventos do Arduino
    socketInstance.on('arduino-status', (status) => {
      console.log('📡 Status do Arduino:', status);
      setArduinoStatus(status);
    });

    socketInstance.on('arduino-message', (message) => {
      console.log('📨 Mensagem do Arduino:', message);
      setArduinoStatus(prev => ({
        ...prev,
        lastMessage: message
      }));
    });

    socketInstance.on('lamp-state-changed', (state) => {
      console.log('💡 Estado da lâmpada mudou:', state);
      setLampState(state);
    });

    socketInstance.on('arduino-command-sent', (result) => {
      console.log('📤 Resultado do comando:', result);
      if (result.success) {
        console.log(`✅ Comando '${result.command}' enviado com sucesso`);
      } else {
        console.error(`❌ Erro ao enviar comando '${result.command}':`, result.error);
      }
    });

    // Cleanup
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Função para enviar comando para Arduino
  const sendArduinoCommand = (command) => {
    if (socket && isConnected) {
      socket.emit('arduino-command', { command });
      console.log(`📤 Enviando comando para Arduino: ${command}`);
    } else {
      console.error('❌ Socket não conectado');
    }
  };

  // Função para reconectar Arduino
  const reconnectArduino = () => {
    if (socket && isConnected) {
      socket.emit('arduino-reconnect');
      console.log('🔄 Solicitando reconexão do Arduino');
    }
  };

  return {
    socket,
    isConnected,
    arduinoStatus,
    lampState,
    sendArduinoCommand,
    reconnectArduino
  };
};
