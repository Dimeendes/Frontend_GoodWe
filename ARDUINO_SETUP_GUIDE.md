# 🔧 Guia de Configuração Arduino no Cursor

## ✅ Configuração Completa

### **1. Instalar Extensões (OBRIGATÓRIO)**

1. **Abra o Cursor**
2. **Pressione `Ctrl+Shift+X`** para abrir extensões
3. **Instale as seguintes extensões:**
   - `Arduino` (Microsoft) - Extensão oficial Arduino
   - `PlatformIO IDE` (PlatformIO) - IDE profissional para Arduino
   - `C/C++` (Microsoft) - Suporte para C++

### **2. Instalar Arduino CLI (RECOMENDADO)**

```bash
# No terminal do Cursor (Ctrl+`)
npm install -g @arduino/arduino-cli
```

### **3. Instalar PlatformIO (OPCIONAL - Para desenvolvimento avançado)**

```bash
# Instalar PlatformIO
pip install platformio

# Ou via npm
npm install -g platformio
```

### **4. Configurar Arduino**

```bash
# Configurar cores Arduino
arduino-cli core install arduino:avr

# Atualizar índices
arduino-cli core update-index
```

## 🚀 Como Usar

### **Método 1: Extensão Arduino (Mais Simples)**

1. **Conecte seu Arduino via USB**
2. **Abra o arquivo `arduino_code.ino`**
3. **Selecione a placa:** `Ctrl+Shift+P` → "Arduino: Select Board" → "Arduino Uno"
4. **Selecione a porta:** `Ctrl+Shift+P` → "Arduino: Select Serial Port" → Escolha a porta COM
5. **Faça upload:** `Ctrl+Shift+P` → "Arduino: Upload"

### **Método 2: PlatformIO (Mais Profissional)**

```bash
# Compilar o código
npm run arduino:compile

# Fazer upload
npm run arduino:upload

# Monitor serial
npm run arduino:monitor

# Limpar projeto
npm run arduino:clean
```

### **Método 3: Comandos Diretos**

```bash
# Compilar
pio run

# Upload
pio run --target upload

# Monitor serial
pio device monitor
```

## 🔍 Monitor Serial

Para ver as mensagens do Arduino:

1. **Via extensão Arduino:** `Ctrl+Shift+P` → "Arduino: Open Serial Monitor"
2. **Via PlatformIO:** `npm run arduino:monitor`
3. **Via terminal:** `pio device monitor`

## 📁 Estrutura do Projeto

```
Frontend_GoodWe/
├── arduino_code.ino          # Seu código Arduino
├── platformio.ini           # Configuração PlatformIO
├── .vscode/
│   ├── settings.json        # Configurações Arduino
│   └── extensions.json      # Extensões recomendadas
├── package.json             # Scripts Arduino
└── ARDUINO_SETUP_GUIDE.md   # Este guia
```

## ⚡ Scripts Disponíveis

- `npm run arduino:compile` - Compilar código
- `npm run arduino:upload` - Upload para Arduino
- `npm run arduino:monitor` - Monitor serial
- `npm run arduino:clean` - Limpar projeto
- `npm run arduino:setup` - Configurar PlatformIO

## 🔧 Solução de Problemas

### **Erro: "Arduino não encontrado"**
```bash
# Listar portas disponíveis
arduino-cli board list

# Ou via PlatformIO
pio device list
```

### **Erro: "Placa não reconhecida"**
```bash
# Instalar core Arduino
arduino-cli core install arduino:avr
```

### **Erro: "Porta em uso"**
- Desconecte e reconecte o Arduino
- Feche outros programas que possam estar usando a porta
- Reinicie o Cursor

## 📋 Checklist de Configuração

- [ ] Extensão Arduino instalada
- [ ] Extensão PlatformIO instalada (opcional)
- [ ] Arduino CLI instalado
- [ ] Arduino conectado via USB
- [ ] Porta COM detectada
- [ ] Placa selecionada (Arduino Uno)
- [ ] Upload testado com sucesso
- [ ] Monitor serial funcionando

## 🎯 Próximos Passos

1. **Conecte seu Arduino**
2. **Teste o upload:** `npm run arduino:upload`
3. **Abra o monitor:** `npm run arduino:monitor`
4. **Teste o sensor PIR** movendo a mão na frente
5. **Verifique no SmartWe Dashboard** se a lâmpada liga/desliga

---

**🎉 Pronto! Seu Cursor está configurado para desenvolvimento Arduino!**
