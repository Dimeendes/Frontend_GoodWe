# 🌉 Guia da Ponte Arduino ↔ Socket.io ↔ Frontend

## ✅ Configuração Completa

A ponte entre Arduino Serial e sua aplicação está configurada! Agora o Arduino pode se comunicar em tempo real com o frontend via Socket.io.

## 🔧 Como Funciona

```
Arduino (Serial) → Socket.io Server → Frontend (React)
     ↓                    ↓                ↓
  Sensor PIR        Comunicação        Dashboard
  LED/Lâmpada       em Tempo Real      SmartWe
```

## 📁 Arquivos Criados

- `lib/socketServer.js` - Servidor Socket.io com comunicação serial
- `hooks/useSocket.js` - Hook React para usar Socket.io
- `server.js` - Servidor personalizado integrado
- `components/ArduinoStatus.js` - Atualizado para usar Socket.io

## 🚀 Como Usar

### **1. Iniciar o Servidor**
```bash
npm run dev
```

### **2. Conectar Arduino**
- Conecte seu Arduino via USB
- Faça upload do código `arduino_code.ino`
- O servidor detectará automaticamente a porta

### **3. Acessar Dashboard**
- Abra: `http://localhost:3000`
- Vá para: **Aparelhos**
- Veja o status do Arduino em tempo real

## 📡 Eventos Socket.io

### **Cliente → Servidor**
- `arduino-command` - Enviar comando para Arduino
- `arduino-reconnect` - Reconectar Arduino

### **Servidor → Cliente**
- `arduino-status` - Status da conexão Arduino
- `arduino-message` - Mensagens do Arduino
- `lamp-state-changed` - Mudança no estado da lâmpada
- `arduino-command-sent` - Confirmação de comando enviado

## 💡 Funcionalidades

### **Detecção Automática**
- ✅ Detecta Arduino conectado via USB
- ✅ Reconecta automaticamente se desconectar
- ✅ Modo simulação se Arduino não encontrado

### **Comunicação em Tempo Real**
- ✅ Mensagens instantâneas do Arduino
- ✅ Status da lâmpada atualizado automaticamente
- ✅ Múltiplos clientes conectados simultaneamente

### **Controle da Lâmpada**
- ✅ Sensor PIR detecta movimento
- ✅ Lâmpada liga/desliga automaticamente
- ✅ Estado sincronizado com dashboard

## 🎯 Exemplo de Uso

### **No Frontend (React)**
```javascript
import { useSocket } from '../hooks/useSocket';

function MyComponent() {
  const { 
    arduinoStatus, 
    lampState, 
    sendArduinoCommand 
  } = useSocket();

  // Enviar comando para Arduino
  const toggleLamp = () => {
    sendArduinoCommand('TOGGLE');
  };

  return (
    <div>
      <p>Arduino: {arduinoStatus.connected ? 'Conectado' : 'Desconectado'}</p>
      <p>Lâmpada: {lampState?.isOn ? 'Ligada' : 'Desligada'}</p>
      <button onClick={toggleLamp}>Alternar Lâmpada</button>
    </div>
  );
}
```

### **No Arduino**
```cpp
void loop() {
  int reading = digitalRead(sensorPin);
  
  if (reading == HIGH) {
    digitalWrite(ledPin, HIGH);
    Serial.println("ON");  // Enviado via Socket.io
  } else {
    digitalWrite(ledPin, LOW);
    Serial.println("OFF"); // Enviado via Socket.io
  }
}
```

## 🔍 Monitoramento

### **Console do Servidor**
```
✅ Conectado ao Arduino na porta COM3
📨 Arduino enviou: ON
💡 Lâmpada ligada via Arduino
🔌 Cliente conectado via Socket.io
```

### **Console do Frontend**
```
✅ Conectado ao servidor Socket.io
📡 Status do Arduino: {connected: true, port: "COM3"}
📨 Mensagem do Arduino: {message: "ON", timestamp: "..."}
💡 Estado da lâmpada mudou: {isOn: true, source: "arduino"}
```

## 🛠️ Comandos Disponíveis

### **Scripts NPM**
```bash
npm run dev          # Iniciar com Socket.io
npm run dev:next     # Iniciar apenas Next.js
npm run build        # Build para produção
npm run start        # Produção com Socket.io
```

### **Comandos Arduino**
```bash
npm run arduino:compile  # Compilar código
npm run arduino:upload   # Upload para Arduino
npm run arduino:monitor  # Monitor serial
```

## 🚨 Solução de Problemas

### **Arduino não conecta**
```bash
# Verificar portas
npm run arduino:monitor

# Ou via Node.js
node -e "require('serialport').SerialPort.list().then(console.log)"
```

### **Socket.io não conecta**
- Verifique se o servidor está rodando
- Confirme a porta 3000 está livre
- Verifique o console do navegador

### **Modo simulação ativo**
- Arduino não detectado
- Biblioteca serialport não instalada
- Porta COM em uso

## 📊 Status da Aplicação

### **Indicadores Visuais**
- 🟢 **Verde**: Arduino conectado
- 🔴 **Vermelho**: Arduino desconectado
- 🟡 **Amarelo**: Modo simulação
- 🔌 **Socket.io**: Status da conexão WebSocket

### **Logs em Tempo Real**
- Console do servidor mostra todas as comunicações
- Console do navegador mostra eventos Socket.io
- Monitor serial mostra dados do Arduino

## 🎉 Próximos Passos

1. **Conecte seu Arduino**
2. **Faça upload do código**
3. **Inicie o servidor:** `npm run dev`
4. **Acesse o dashboard**
5. **Teste o sensor PIR**
6. **Veja a lâmpada ligar/desligar automaticamente!**

---

**🚀 Sua ponte Arduino ↔ Socket.io ↔ Frontend está pronta!**
