import { Server } from 'socket.io';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

class ArduinoSocketBridge {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.serialPort = null;
    this.parser = null;
    this.isConnected = false;
    this.lastMessage = null;
    
    this.setupSocketEvents();
    this.setupSerialConnection();
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log('Cliente conectado via Socket.io:', socket.id);
      
      // Enviar status atual da conexão
      socket.emit('arduino-status', {
        connected: this.isConnected,
        port: this.serialPort?.path || null,
        lastMessage: this.lastMessage
      });

      // Enviar comando para Arduino
      socket.on('arduino-command', async (data) => {
        try {
          const { command } = data;
          if (this.serialPort && this.isConnected) {
            this.serialPort.write(command + '\n');
            console.log(`Comando enviado para Arduino: ${command}`);
            
            // Confirmar envio para o cliente
            socket.emit('arduino-command-sent', {
              success: true,
              command: command,
              timestamp: new Date().toISOString()
            });
          } else {
            socket.emit('arduino-command-sent', {
              success: false,
              error: 'Arduino não conectado',
              command: command
            });
          }
        } catch (error) {
          console.error('Erro ao enviar comando:', error);
          socket.emit('arduino-command-sent', {
            success: false,
            error: error.message,
            command: data.command
          });
        }
      });

      // Reconectar Arduino
      socket.on('arduino-reconnect', async () => {
        console.log('Cliente solicitou reconexão do Arduino');
        await this.connectToArduino();
        
        socket.emit('arduino-status', {
          connected: this.isConnected,
          port: this.serialPort?.path || null,
          lastMessage: this.lastMessage
        });
      });

      socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
      });
    });
  }

  async setupSerialConnection() {
    try {
      // Importação dinâmica da biblioteca serialport
      if (typeof SerialPort === 'undefined') {
        console.log('Biblioteca serialport não disponível. Modo simulação ativo.');
        this.setupSimulationMode();
        return;
      }

      await this.connectToArduino();
    } catch (error) {
      console.error('Erro ao configurar conexão serial:', error);
      this.setupSimulationMode();
    }
  }

  async connectToArduino() {
    try {
      if (this.serialPort && this.isConnected) {
        console.log('Arduino já conectado');
        return;
      }

      // Listar portas disponíveis
      const ports = await SerialPort.list();
      console.log('Portas disponíveis:', ports.map(p => ({ path: p.path, manufacturer: p.manufacturer })));

      // Procurar por portas Arduino
      let arduinoPort = null;
      for (const port of ports) {
        if (port.manufacturer && port.manufacturer.toLowerCase().includes('arduino')) {
          arduinoPort = port.path;
          break;
        }
        // Fallback: usar portas COM comuns
        if (port.path.match(/COM[3-9]/)) {
          arduinoPort = port.path;
        }
      }

      if (!arduinoPort) {
        console.warn('Arduino não encontrado. Modo simulação ativo.');
        this.setupSimulationMode();
        return;
      }

      // Criar conexão serial
      this.serialPort = new SerialPort({
        path: arduinoPort,
        baudRate: 115200,
        autoOpen: false
      });

      // Configurar parser
      this.parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

      // Eventos da porta serial
      this.serialPort.on('open', () => {
        console.log(`✅ Conectado ao Arduino na porta ${arduinoPort}`);
        this.isConnected = true;
        
        // Notificar todos os clientes conectados
        this.io.emit('arduino-status', {
          connected: true,
          port: arduinoPort,
          lastMessage: this.lastMessage
        });
      });

      this.serialPort.on('error', (err) => {
        console.error('❌ Erro na porta serial:', err.message);
        this.isConnected = false;
        
        // Notificar clientes sobre o erro
        this.io.emit('arduino-status', {
          connected: false,
          port: null,
          error: err.message,
          lastMessage: this.lastMessage
        });
      });

      this.parser.on('data', (data) => {
        const message = data.trim();
        console.log('📨 Arduino enviou:', message);
        this.lastMessage = {
          message: message,
          timestamp: new Date().toISOString()
        };

        // Processar comandos do Arduino
        this.processArduinoMessage(message);

        // Enviar para todos os clientes conectados
        this.io.emit('arduino-message', this.lastMessage);
      });

      this.serialPort.on('close', () => {
        console.log('🔌 Porta serial fechada');
        this.isConnected = false;
        
        // Notificar clientes sobre desconexão
        this.io.emit('arduino-status', {
          connected: false,
          port: null,
          lastMessage: this.lastMessage
        });
      });

      // Abrir a porta
      await new Promise((resolve, reject) => {
        this.serialPort.open((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

    } catch (error) {
      console.error('Erro ao conectar ao Arduino:', error);
      this.setupSimulationMode();
    }
  }

  setupSimulationMode() {
    console.log('🎭 Modo simulação ativo');
    this.isConnected = false;
    this.lastMessage = {
      message: 'SIMULATION_MODE',
      timestamp: new Date().toISOString()
    };

    // Simular mensagens do Arduino a cada 10 segundos
    setInterval(() => {
      const messages = ['ON', 'OFF'];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      this.lastMessage = {
        message: randomMessage,
        timestamp: new Date().toISOString(),
        simulated: true
      };

      console.log('🎭 Simulação - Arduino enviou:', randomMessage);
      this.processArduinoMessage(randomMessage);
      this.io.emit('arduino-message', this.lastMessage);
    }, 10000);
  }

  async processArduinoMessage(message) {
    try {
      // Processar comandos do Arduino (ON/OFF)
      if (message === 'ON' || message === 'OFF') {
        const isOn = message === 'ON';
        
        // Atualizar estado da lâmpada na API
        await this.updateLampState(isOn);
        
        console.log(`💡 Lâmpada ${isOn ? 'ligada' : 'desligada'} via Arduino`);
        
        // Notificar clientes sobre mudança de estado
        this.io.emit('lamp-state-changed', {
          isOn: isOn,
          source: 'arduino',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erro ao processar mensagem do Arduino:', error);
    }
  }

  async updateLampState(isOn) {
    try {
      // Buscar a lâmpada na lista de aparelhos
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aparelhos`);
      const aparelhos = await response.json();
      
      const lampada = aparelhos.find(aparelho => 
        aparelho.name.toLowerCase().includes('lâmpada') || 
        aparelho.name.toLowerCase().includes('lampada')
      );

      if (lampada) {
        // Atualizar estado da lâmpada
        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aparelhos/${lampada.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_on: isOn })
        });

        if (updateResponse.ok) {
          console.log(`✅ Lâmpada atualizada para: ${isOn ? 'Ligada' : 'Desligada'}`);
        } else {
          console.error('❌ Erro ao atualizar estado da lâmpada');
        }
      } else {
        console.warn('⚠️ Lâmpada não encontrada na lista de aparelhos');
      }
    } catch (error) {
      console.error('Erro ao atualizar estado da lâmpada:', error);
    }
  }

  // Método para obter status atual
  getStatus() {
    return {
      connected: this.isConnected,
      port: this.serialPort?.path || null,
      lastMessage: this.lastMessage,
      clients: this.io.sockets.sockets.size
    };
  }
}

export default ArduinoSocketBridge;
