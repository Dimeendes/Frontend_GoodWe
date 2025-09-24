import { Server } from 'socket.io';

let io;

export default function handler(req, res) {
  if (!io) {
    const server = res.socket?.server;
    
    if (!server) {
      return res.status(500).json({ error: 'Socket server not available' });
    }

    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Importar e configurar o bridge Arduino
    import('./socketServer.js').then(({ default: ArduinoSocketBridge }) => {
      new ArduinoSocketBridge(server);
      console.log('🚀 Arduino Socket Bridge iniciado');
    }).catch(error => {
      console.error('Erro ao inicializar Arduino Socket Bridge:', error);
    });

    console.log('🔌 Socket.io server configurado');
  }

  res.end();
}
